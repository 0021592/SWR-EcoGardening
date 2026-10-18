"""Gardening app HTTP API (FastAPI).

Run:
    pip install -r requirements.txt
    uvicorn api:app --reload
    Interactive docs: http://127.0.0.1:8000/docs

Environment (.env file next to this script):
    SUPABASE_URL, SUPABASE_KEY   service role or secret key, backend only
    ANTHROPIC_API_KEY            used by the photo diagnosis
    ANTHROPIC_MODEL              optional, default claude-sonnet-5-5
    SUPABASE_PHOTO_BUCKET        optional, default plant-photos. Create this
                                 bucket as PRIVATE in Supabase Storage first.
    CORS_ORIGINS                 optional, comma separated origins, default *
    DIAGNOSE_LIMIT_PER_HOUR      optional, default 10 diagnoses per user per hour

Every endpoint except /health and /auth/* needs the header
"Authorization: Bearer <access token>", where the token comes from /auth/login.

Authorization: the backend uses the service key, which bypasses Row Level
Security, so this file enforces access itself. A user can touch a garden only
when a user_gardens row links them to it, and everything below a garden (plants,
tasks, diagnoses, photos) inherits that check.

Grid coordinates: grid_x is the column and grid_y is the row (the "line"), both
0-based, counted from the top left.

Endpoints:
    POST /auth/signup  /auth/login  /auth/refresh      GET /me
    POST /gardens      GET /gardens      GET /gardens/{id}
    GET  /species
    POST /gardens/{id}/plants      GET /gardens/{id}/plants
    POST /plants/{id}/tasks        GET /gardens/{id}/tasks
    POST /tasks/{id}/complete      POST /tasks/{id}/defer
    GET  /gardens/{id}/weather
    POST /plants/{id}/diagnose     GET /plants/{id}/diagnoses
"""

import hashlib
import logging
import os
import threading
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from postgrest.exceptions import APIError
from pydantic import BaseModel, ConfigDict, Field, model_validator

import db
import diagnosis
import weather

logger = logging.getLogger("garden-api")

PHOTO_BUCKET = os.environ.get("SUPABASE_PHOTO_BUCKET", "plant-photos")
PHOTO_URL_TTL_SECONDS = 3600
TOKEN_CACHE_SECONDS = 60
RATE_WINDOW_SECONDS = 3600


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.client()  # fails at startup with a clear message when SUPABASE_URL or SUPABASE_KEY is missing
    if not os.environ.get("ANTHROPIC_API_KEY"):
        logger.warning("ANTHROPIC_API_KEY is not set, photo diagnosis will fail")
    yield


app = FastAPI(title="Gardening App API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Error mapping
# ---------------------------------------------------------------------------


@app.exception_handler(APIError)
async def database_error_handler(request: Request, error: APIError) -> JSONResponse:
    code = getattr(error, "code", None)
    if code == "23505":
        return JSONResponse(status_code=409, content={"detail": "That record already exists"})
    if code == "23503":
        return JSONResponse(status_code=422, content={"detail": "A referenced record does not exist"})
    logger.error("Database error on %s %s: %s", request.method, request.url.path, error)
    return JSONResponse(status_code=502, content={"detail": "Database error"})


@app.exception_handler(weather.WeatherError)
async def weather_error_handler(request: Request, error: weather.WeatherError) -> JSONResponse:
    logger.warning("Weather error on %s: %s", request.url.path, error)
    return JSONResponse(status_code=502, content={"detail": f"Weather service problem: {error}"})


@app.exception_handler(diagnosis.DiagnosisError)
async def diagnosis_error_handler(request: Request, error: diagnosis.DiagnosisError) -> JSONResponse:
    logger.error("Diagnosis error on %s: %s", request.url.path, error)
    return JSONResponse(status_code=502, content={"detail": "The diagnosis service failed. Try again."})


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------


class Credentials(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, max_length=128)


class RefreshBody(BaseModel):
    refresh_token: str = Field(min_length=10, max_length=2000)


class GardenCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    grid_rows: int = Field(ge=1, le=100, description="Number of rows (lines)")
    grid_cols: int = Field(ge=1, le=100, description="Number of columns")
    city: str | None = Field(default=None, min_length=2, max_length=100)
    country_code: str | None = Field(
        default=None, min_length=2, max_length=2, description="ISO code such as RO. Used only to find the city."
    )
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    @model_validator(mode="after")
    def coordinates_come_together(self):
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must be given together")
        return self


class PlantCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    species_id: UUID
    nickname: str = Field(min_length=1, max_length=100)
    grid_x: int = Field(ge=0, description="Column, 0-based")
    grid_y: int = Field(ge=0, description="Row (line), 0-based")


class TaskCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    task_type: str = Field(min_length=1, max_length=50)
    due_date: date


class TaskDefer(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    reason: str = Field(min_length=1, max_length=1000)
    new_due_date: date | None = None


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

bearer_scheme = HTTPBearer(auto_error=False)
_token_cache: dict[str, tuple[float, dict[str, str]]] = {}
_known_users: set[str] = set()
_verifier: Any = None
_verifier_lock = threading.Lock()


def _verifier_client() -> Any:
    """A dedicated client for token checks, so sign-ins never touch the data client."""
    global _verifier
    with _verifier_lock:
        if _verifier is None:
            _verifier = db.new_client()
        return _verifier


def verify_token(token: str) -> dict[str, str]:
    """Check an access token with Supabase Auth. Results are cached for a minute."""
    digest = hashlib.sha256(token.encode()).hexdigest()
    now = time.monotonic()
    cached = _token_cache.get(digest)
    if cached and cached[0] > now:
        return cached[1]

    try:
        response = _verifier_client().auth.get_user(token)
    except Exception as error:  # the auth library's exception classes differ between versions
        if getattr(error, "status", None) in (400, 401, 403):
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            ) from error
        logger.error("Token verification failed: %s", error)
        raise HTTPException(status_code=503, detail="Authentication service unavailable") from error

    if response is None or response.user is None:
        raise HTTPException(
            status_code=401, detail="Invalid or expired token", headers={"WWW-Authenticate": "Bearer"}
        )

    user = {"id": str(response.user.id), "email": response.user.email or ""}
    if len(_token_cache) > 1000:
        for key in [k for k, (expires, _) in _token_cache.items() if expires <= now]:
            _token_cache.pop(key, None)
    _token_cache[digest] = (now + TOKEN_CACHE_SECONDS, user)
    return user


def ensure_user_row(user_id: str) -> None:
    """Make sure the users table has a row for this auth user (the foreign keys need it)."""
    if user_id in _known_users:
        return
    db.client().table("users").upsert({"id": user_id}, on_conflict="id", ignore_duplicates=True).execute()
    _known_users.add(user_id)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, str]:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=401, detail="Missing bearer token", headers={"WWW-Authenticate": "Bearer"}
        )
    user = verify_token(credentials.credentials)
    ensure_user_row(user["id"])
    return user


def _auth_failure(error: Exception, action: str) -> HTTPException:
    status = getattr(error, "status", None)
    message = getattr(error, "message", None) or str(error)
    if getattr(error, "code", None) == "email_not_confirmed":
        return HTTPException(status_code=403, detail="Email not confirmed. Check your inbox.")
    if action == "login" and status in (400, 401, 422):
        return HTTPException(status_code=401, detail="Invalid email or password")
    if action == "refresh" and status in (400, 401, 403, 422):
        return HTTPException(status_code=401, detail="Invalid or expired refresh token")
    if action == "signup" and status in (400, 422):
        return HTTPException(status_code=400, detail=message)
    if status == 429:
        return HTTPException(status_code=429, detail="Too many attempts. Try again later.")
    logger.error("Auth service error during %s: %s", action, error)
    return HTTPException(status_code=503, detail="Authentication service unavailable")


def _session_payload(response: Any) -> dict[str, Any]:
    session, user = response.session, response.user
    return {
        "user": {"id": str(user.id), "email": user.email} if user else None,
        "access_token": session.access_token if session else None,
        "refresh_token": session.refresh_token if session else None,
        "expires_in": session.expires_in if session else None,
        "token_type": "bearer",
    }


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/signup", status_code=201, tags=["auth"])
def signup(body: Credentials) -> dict[str, Any]:
    """Create an account. When the project requires email confirmation, no token comes back yet."""
    try:
        response = db.new_client().auth.sign_up({"email": body.email, "password": body.password})
    except Exception as error:
        raise _auth_failure(error, "signup") from error
    payload = _session_payload(response)
    if payload["access_token"] is None:
        payload["message"] = "Account created. Confirm your email, then log in."
    return payload


@app.post("/auth/login", tags=["auth"])
def login(body: Credentials) -> dict[str, Any]:
    try:
        response = db.new_client().auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as error:
        raise _auth_failure(error, "login") from error
    return _session_payload(response)


@app.post("/auth/refresh", tags=["auth"])
def refresh(body: RefreshBody) -> dict[str, Any]:
    """Exchange a refresh token for a new access token."""
    try:
        response = db.new_client().auth.refresh_session(body.refresh_token)
    except Exception as error:
        raise _auth_failure(error, "refresh") from error
    return _session_payload(response)


@app.get("/me", tags=["auth"])
def me(user: dict[str, str] = Depends(current_user)) -> dict[str, str]:
    return user


# ---------------------------------------------------------------------------
# Access control helpers
# ---------------------------------------------------------------------------


def _embedded(value: Any) -> dict[str, Any] | None:
    """PostgREST embeds a to-one relation as an object, but tolerate a one-item list."""
    if isinstance(value, list):
        return value[0] if value else None
    return value


def garden_for_member(garden_id: UUID | str, user_id: str) -> dict[str, Any]:
    """Return the garden with the user's role, or raise 404 when the user is not a member."""
    rows = (
        db.client()
        .table("user_gardens")
        .select("role, gardens(*)")
        .eq("user_id", user_id)
        .eq("garden_id", str(garden_id))
        .limit(1)
        .execute()
        .data
    )
    garden = _embedded(rows[0].get("gardens")) if rows else None
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")
    return {**garden, "role": rows[0]["role"]}


def plant_for_member(plant_id: UUID, user_id: str) -> tuple[dict[str, Any], dict[str, Any]]:
    """Return (plant with species, garden). Raises 404 unless the user belongs to the plant's garden."""
    rows = (
        db.client()
        .table("plants")
        .select("*, plant_species(*)")
        .eq("id", str(plant_id))
        .limit(1)
        .execute()
        .data
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Plant not found")
    plant = rows[0]
    garden = garden_for_member(plant["garden_id"], user_id)
    return plant, garden


def task_for_member(task_id: UUID, user_id: str) -> dict[str, Any]:
    rows = (
        db.client()
        .table("care_tasks")
        .select("*, plants(garden_id)")
        .eq("id", str(task_id))
        .limit(1)
        .execute()
        .data
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Task not found")
    task = dict(rows[0])
    plant = _embedded(task.pop("plants", None)) or {}
    garden_for_member(plant.get("garden_id", ""), user_id)
    return task


# ---------------------------------------------------------------------------
# Gardens
# ---------------------------------------------------------------------------


@app.post("/gardens", status_code=201, tags=["gardens"])
def create_garden(body: GardenCreate, user: dict[str, str] = Depends(current_user)) -> dict[str, Any]:
    """Create a garden and make the caller its owner.

    When a city is given without coordinates, the city is looked up once and the
    coordinates are stored. A failed lookup does not block the creation.
    """
    warnings: list[str] = []
    latitude, longitude = body.latitude, body.longitude
    if latitude is None and body.city:
        try:
            place = weather.geocode(body.city, body.country_code)[0]
            latitude, longitude = round(place["latitude"], 6), round(place["longitude"], 6)
        except weather.WeatherError as error:
            warnings.append(f"Could not find coordinates for the city: {error}")

    garden = db.insert(
        "gardens",
        {
            "name": body.name,
            "grid_rows": body.grid_rows,
            "grid_cols": body.grid_cols,
            "city": body.city,
            "latitude": latitude,
            "longitude": longitude,
        },
    )[0]
    try:
        db.insert("user_gardens", {"user_id": user["id"], "garden_id": garden["id"], "role": "owner"})
    except Exception:
        # The two inserts are not atomic, so remove the orphan garden before reporting the failure.
        db.client().table("gardens").delete().eq("id", garden["id"]).execute()
        raise
    return {**garden, "role": "owner", "warnings": warnings}


@app.get("/gardens", tags=["gardens"])
def list_gardens(user: dict[str, str] = Depends(current_user)) -> list[dict[str, Any]]:
    rows = (
        db.client()
        .table("user_gardens")
        .select("role, gardens(*)")
        .eq("user_id", user["id"])
        .order("joined_at")
        .execute()
        .data
    )
    result = []
    for row in rows:
        garden = _embedded(row.get("gardens"))
        if garden:
            result.append({**garden, "role": row["role"]})
    return result


@app.get("/gardens/{garden_id}", tags=["gardens"])
def get_garden(garden_id: UUID, user: dict[str, str] = Depends(current_user)) -> dict[str, Any]:
    return garden_for_member(garden_id, user["id"])


# ---------------------------------------------------------------------------
# Species and plants
# ---------------------------------------------------------------------------


@app.get("/species", tags=["plants"], dependencies=[Depends(current_user)])
def search_species(
    q: str | None = Query(default=None, max_length=100, description="Part of the common name"),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[dict[str, Any]]:
    """Search the plant species list, used to pick a species when adding a plant."""
    query = db.client().table("plant_species").select("*")
    if q and q.strip():
        query = query.ilike("common_name", f"%{q.strip()}%")
    return query.order("common_name").limit(limit).execute().data


@app.post("/gardens/{garden_id}/plants", status_code=201, tags=["plants"])
def add_plant(
    garden_id: UUID, body: PlantCreate, user: dict[str, str] = Depends(current_user)
) -> dict[str, Any]:
    """Add a plant to a garden at a column (grid_x) and a row (grid_y)."""
    garden = garden_for_member(garden_id, user["id"])
    if body.grid_x >= garden["grid_cols"] or body.grid_y >= garden["grid_rows"]:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Column {body.grid_x}, row {body.grid_y} is outside the grid of "
                f"{garden['grid_cols']} columns by {garden['grid_rows']} rows (both 0-based)"
            ),
        )
    taken = db.fetch(
        "plants",
        columns="id, nickname",
        filters={"garden_id": str(garden_id), "grid_x": body.grid_x, "grid_y": body.grid_y},
        limit=1,
    )
    if taken:
        raise HTTPException(status_code=409, detail=f"That cell already holds '{taken[0]['nickname']}'")
    return db.insert(
        "plants",
        {
            "garden_id": str(garden_id),
            "species_id": str(body.species_id),
            "nickname": body.nickname,
            "grid_x": body.grid_x,
            "grid_y": body.grid_y,
        },
    )[0]


@app.get("/gardens/{garden_id}/plants", tags=["plants"])
def list_plants(garden_id: UUID, user: dict[str, str] = Depends(current_user)) -> list[dict[str, Any]]:
    garden_for_member(garden_id, user["id"])
    return db.fetch(
        "plants",
        columns="*, plant_species(common_name, scientific_name, watering_interval_days, sunlight_needs)",
        filters={"garden_id": str(garden_id)},
        order_by="created_at",
        limit=1000,
    )


# ---------------------------------------------------------------------------
# Care tasks
# ---------------------------------------------------------------------------


@app.post("/plants/{plant_id}/tasks", status_code=201, tags=["tasks"])
def create_task(
    plant_id: UUID, body: TaskCreate, user: dict[str, str] = Depends(current_user)
) -> dict[str, Any]:
    plant_for_member(plant_id, user["id"])
    return db.insert(
        "care_tasks",
        {
            "plant_id": str(plant_id),
            "task_type": body.task_type,
            "due_date": body.due_date.isoformat(),
            "is_deferred": False,
        },
    )[0]


@app.get("/gardens/{garden_id}/tasks", tags=["tasks"])
def list_tasks(
    garden_id: UUID,
    due_by: date | None = Query(default=None, description="Only tasks due on or before this date"),
    include_completed: bool = Query(default=False),
    user: dict[str, str] = Depends(current_user),
) -> list[dict[str, Any]]:
    garden_for_member(garden_id, user["id"])
    query = (
        db.client()
        .table("care_tasks")
        .select("*, plants!inner(nickname, garden_id, plant_species(common_name))")
        .eq("plants.garden_id", str(garden_id))
    )
    if not include_completed:
        query = query.is_("completed_at", "null")
    if due_by is not None:
        query = query.lte("due_date", due_by.isoformat())
    return query.order("due_date").limit(500).execute().data


@app.post("/tasks/{task_id}/complete", tags=["tasks"])
def complete_task(task_id: UUID, user: dict[str, str] = Depends(current_user)) -> dict[str, Any]:
    task = task_for_member(task_id, user["id"])
    if task.get("completed_at"):
        return task
    now = datetime.now(timezone.utc).isoformat()
    return db.update("care_tasks", {"completed_at": now}, {"id": str(task_id)})[0]


@app.post("/tasks/{task_id}/defer", tags=["tasks"])
def defer_task(
    task_id: UUID, body: TaskDefer, user: dict[str, str] = Depends(current_user)
) -> dict[str, Any]:
    task = task_for_member(task_id, user["id"])
    if task.get("completed_at"):
        raise HTTPException(status_code=409, detail="The task is already completed")
    values: dict[str, Any] = {"is_deferred": True, "defer_reason": body.reason}
    if body.new_due_date is not None:
        values["due_date"] = body.new_due_date.isoformat()
    return db.update("care_tasks", values, {"id": str(task_id)})[0]


# ---------------------------------------------------------------------------
# Weather
# ---------------------------------------------------------------------------


@app.get("/gardens/{garden_id}/weather", tags=["weather"])
def garden_weather(
    garden_id: UUID,
    days: int = Query(default=7, ge=1, le=weather.MAX_FORECAST_DAYS),
    user: dict[str, str] = Depends(current_user),
) -> dict[str, Any]:
    """Current conditions and forecast for the garden's location."""
    garden_for_member(garden_id, user["id"])
    try:
        return weather.get_garden_weather(str(garden_id), days)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


# ---------------------------------------------------------------------------
# Photo diagnosis
# ---------------------------------------------------------------------------

_diagnosis_calls: dict[str, deque[float]] = defaultdict(deque)
_limit_lock = threading.Lock()


def enforce_diagnosis_limit(user_id: str) -> None:
    """Allow a limited number of diagnoses per user per hour. Each one costs model usage."""
    limit = int(os.environ.get("DIAGNOSE_LIMIT_PER_HOUR", "10"))
    now = time.monotonic()
    with _limit_lock:
        calls = _diagnosis_calls[user_id]
        while calls and now - calls[0] > RATE_WINDOW_SECONDS:
            calls.popleft()
        if len(calls) >= limit:
            wait = int(RATE_WINDOW_SECONDS - (now - calls[0])) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Diagnosis limit reached ({limit} per hour). Try again later.",
                headers={"Retry-After": str(wait)},
            )
        calls.append(now)


def upload_photo(path: str, data: bytes, media_type: str) -> None:
    try:
        db.client().storage.from_(PHOTO_BUCKET).upload(
            path=path, file=data, file_options={"content-type": media_type}
        )
    except Exception as error:
        logger.exception("Photo upload to bucket '%s' failed", PHOTO_BUCKET)
        raise HTTPException(status_code=502, detail="Could not store the photo") from error


def remove_photo(path: str) -> None:
    try:
        db.client().storage.from_(PHOTO_BUCKET).remove([path])
    except Exception:
        logger.warning("Could not remove orphan photo %s", path)


def _absolute_storage_url(url: str) -> str:
    if url.startswith("http"):
        return url
    base = os.environ.get("SUPABASE_URL", "").rstrip("/")
    return f"{base}/storage/v1{url if url.startswith('/') else '/' + url}"


def sign_photo_urls(paths: list[str]) -> dict[str, str | None]:
    """Create short-lived download links for private photos. A failure yields None, not an error."""
    unique = list(dict.fromkeys(path for path in paths if path))
    if not unique:
        return {}
    try:
        items = db.client().storage.from_(PHOTO_BUCKET).create_signed_urls(unique, PHOTO_URL_TTL_SECONDS)
    except Exception:
        logger.warning("Could not sign photo URLs", exc_info=True)
        return {path: None for path in unique}

    urls: dict[str, str | None] = {}
    for item in items:
        read = item.get if isinstance(item, dict) else (lambda key, default=None, _i=item: getattr(_i, key, default))
        link = read("signedURL") or read("signedUrl") or read("signed_url")
        urls[read("path")] = _absolute_storage_url(link) if link else None
    return {path: urls.get(path) for path in unique}


def _diagnosis_view(row: dict[str, Any], photo_url: str | None) -> dict[str, Any]:
    view = {key: value for key, value in row.items() if key != "raw_llm_response"}
    view["photo_url"] = photo_url
    return view


def _days_since(timestamp: str | None) -> int | None:
    if not timestamp:
        return None
    try:
        return (datetime.now(timezone.utc).date() - date.fromisoformat(timestamp[:10])).days
    except ValueError:
        return None


def build_diagnosis_context(plant: dict[str, Any], garden: dict[str, Any]) -> dict[str, Any]:
    """Facts the vision model gets next to the photo."""
    species = _embedded(plant.get("plant_species")) or {}
    context: dict[str, Any] = {
        "today": datetime.now(timezone.utc).date().isoformat(),
        "plant": {
            "nickname": plant.get("nickname"),
            "species": {
                key: species.get(key)
                for key in ("common_name", "scientific_name", "watering_interval_days", "sunlight_needs", "soil_type")
            },
            "last_watered_date": (plant.get("last_watered_at") or "")[:10] or None,
            "days_since_watered": _days_since(plant.get("last_watered_at")),
        },
        "garden": {"city": garden.get("city")},
        "weather": None,
        "recent_diagnoses": db.fetch(
            "plant_diagnoses",
            columns="illness_name, urgency, confidence, created_at",
            filters={"plant_id": plant["id"]},
            order_by="created_at",
            descending=True,
            limit=3,
        ),
    }
    if garden.get("latitude") is not None and garden.get("longitude") is not None:
        try:
            forecast = weather.get_weather(float(garden["latitude"]), float(garden["longitude"]), days=3)
            context["weather"] = diagnosis.compact_weather(forecast)
        except weather.WeatherError:
            logger.warning("Weather unavailable for the diagnosis context")
    return context


@app.post("/plants/{plant_id}/diagnose", status_code=201, tags=["diagnosis"])
def diagnose_plant(
    plant_id: UUID,
    photo: UploadFile = File(..., description="JPEG, PNG, WebP or GIF, up to 5 MB"),
    notes: str | None = Form(default=None, max_length=1000),
    user: dict[str, str] = Depends(current_user),
) -> dict[str, Any]:
    """Upload a photo of a plant, get a diagnosis from the vision model, and save it.

    Send the request as multipart/form-data with the fields "photo" and, optionally, "notes".
    Resize photos on the device to about 1500 px on the long edge before uploading.
    """
    plant, garden = plant_for_member(plant_id, user["id"])

    data = photo.file.read(diagnosis.MAX_IMAGE_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(data) > diagnosis.MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="The photo is larger than 5 MB")
    detected = diagnosis.detect_image_type(data)
    if detected is None:
        raise HTTPException(status_code=415, detail="Unsupported image. Upload a JPEG, PNG, WebP or GIF")
    media_type, extension = detected

    enforce_diagnosis_limit(user["id"])

    path = f"{garden['id']}/{plant['id']}/{uuid4().hex}.{extension}"
    upload_photo(path, data, media_type)
    try:
        context = build_diagnosis_context(plant, garden)
        result, raw = diagnosis.run_diagnosis(data, media_type, context, notes)
        saved = db.insert(
            "plant_diagnoses",
            {
                "plant_id": plant["id"],
                "image_url": path,
                **diagnosis.to_db_fields(result),
                "raw_llm_response": {"model": diagnosis.model_name(), "tool_input": raw},
            },
        )[0]
    except Exception:
        remove_photo(path)
        raise

    return {
        "diagnosis": _diagnosis_view(saved, sign_photo_urls([path]).get(path)),
        "assessment": result,
    }


@app.get("/plants/{plant_id}/diagnoses", tags=["diagnosis"])
def list_diagnoses(
    plant_id: UUID,
    limit: int = Query(default=10, ge=1, le=50),
    user: dict[str, str] = Depends(current_user),
) -> list[dict[str, Any]]:
    """Past diagnoses for a plant, newest first, with temporary photo links."""
    plant_for_member(plant_id, user["id"])
    rows = db.fetch(
        "plant_diagnoses",
        columns="id, plant_id, image_url, illness_name, confidence, urgency, treatment_steps, created_at",
        filters={"plant_id": str(plant_id)},
        order_by="created_at",
        descending=True,
        limit=limit,
    )
    urls = sign_photo_urls([row["image_url"] for row in rows])
    return [_diagnosis_view(row, urls.get(row["image_url"])) for row in rows]