"""Supabase data access layer for the gardening app.

Setup (Python 3.10 or newer):
    pip install supabase python-dotenv
    Create a .env file next to this script:
        SUPABASE_URL=https://<project-ref>.supabase.co
        SUPABASE_KEY=<service role or secret key>

Assumptions about the database:
    - id, created_at, creation_date and joined_at have server defaults
      (gen_random_uuid(), now()), so inserts do not send them.
    - grid_x is the column index and grid_y is the row index, both 0-based.
    - confidence is stored as a percentage from 0 to 100.
    - urgency is one of: low, medium, high.
    - An open care task is one with completed_at empty.

Command line:
    python db.py select user_gardens --eq user_id=<uuid>
    python db.py select care_tasks --eq completed_at=null --order due_date
    python db.py insert communities '{"name": "Iasi Growers"}'
    python db.py insert plants @plants.json
    python db.py context <plant_uuid>

From code (for example the FastAPI backend):
    from db import get_diagnosis_context, save_diagnosis
"""

import argparse
import json
import os
import sys
import uuid
from datetime import date, datetime, timezone
from typing import Any

from dotenv import load_dotenv
from postgrest.exceptions import APIError
from supabase import Client, create_client

load_dotenv()

Row = dict[str, Any]

TABLES = (
    "users",
    "communities",
    "user_communities",
    "user_gardens",
    "plant_species",
    "plants",
    "care_tasks",
    "plant_diagnoses",
)
URGENCY_LEVELS = ("low", "medium", "high")

_client: Client | None = None


# ---------------------------------------------------------------------------
# Connection and generic operations
# ---------------------------------------------------------------------------


def client() -> Client:
    """Create the Supabase client once and reuse it."""
    global _client
    if _client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise RuntimeError(
                "Set SUPABASE_URL and SUPABASE_KEY in the environment or in a .env file."
            )
        _client = create_client(url, key)
    return _client


def _check_table(table: str) -> None:
    if table not in TABLES:
        raise ValueError(f"Unknown table '{table}'. Known tables: {', '.join(TABLES)}")


def fetch(
    table: str,
    columns: str = "*",
    filters: dict[str, Any] | None = None,
    order_by: str | None = None,
    descending: bool = False,
    limit: int = 100,
) -> list[Row]:
    """Return rows from a table.

    Every filter is an equality match. A filter value of None matches NULL.
    Related tables embed through foreign keys, for example
    columns="*, plant_species(common_name)" on the plants table.
    """
    _check_table(table)
    query = client().table(table).select(columns)
    for column, value in (filters or {}).items():
        query = query.is_(column, "null") if value is None else query.eq(column, value)
    if order_by:
        query = query.order(order_by, desc=descending)
    return query.limit(limit).execute().data


def insert(table: str, rows: Row | list[Row]) -> list[Row]:
    """Insert one row (dict) or many rows (list of dicts). Returns the inserted rows."""
    _check_table(table)
    return client().table(table).insert(rows).execute().data


def update(table: str, values: Row, filters: dict[str, Any]) -> list[Row]:
    """Update rows matching all filters. Filters are required to prevent updating every row."""
    _check_table(table)
    if not filters:
        raise ValueError("update requires at least one filter")
    query = client().table(table).update(values)
    for column, value in filters.items():
        query = query.is_(column, "null") if value is None else query.eq(column, value)
    return query.execute().data


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _text(value: str | None, field: str, max_len: int) -> str:
    """Trim a string and enforce the VARCHAR limit before the database does."""
    cleaned = (value or "").strip()
    if not cleaned:
        raise ValueError(f"{field} must not be empty")
    if len(cleaned) > max_len:
        raise ValueError(f"{field} is longer than {max_len} characters")
    return cleaned


def _positive_int(value: int, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ValueError(f"{field} must be an integer of at least 1")
    return value


def _iso_date(value: date | str) -> str:
    """Return YYYY-MM-DD for a date, datetime or ISO date string."""
    if isinstance(value, datetime):
        value = value.date()
    if isinstance(value, str):
        value = date.fromisoformat(value)
    return value.isoformat()


def _first(rows: list[Row], what: str) -> Row:
    if not rows:
        raise ValueError(f"{what} not found")
    return rows[0]


def _format_steps(steps: str | list[str]) -> str:
    if isinstance(steps, str):
        return steps.strip()
    return "\n".join(f"{index}. {step.strip()}" for index, step in enumerate(steps, start=1))


# ---------------------------------------------------------------------------
# Users and communities
# ---------------------------------------------------------------------------


def create_user(user_id: str | None = None) -> Row:
    """Create a user. Pass the auth user id if you link this table to Supabase Auth."""
    return insert("users", {"id": user_id or str(uuid.uuid4())})[0]


def create_community(name: str, description: str | None = None) -> Row:
    return insert(
        "communities", {"name": _text(name, "name", 100), "description": description}
    )[0]


def join_community(user_id: str, community_id: str, role: str = "member") -> Row:
    return insert(
        "user_communities",
        {"user_id": user_id, "community_id": community_id, "role": _text(role, "role", 20)},
    )[0]


# ---------------------------------------------------------------------------
# Gardens and plants
# ---------------------------------------------------------------------------


def create_garden(user_id: str, name: str, grid_rows: int, grid_cols: int) -> Row:
    return insert(
        "user_gardens",
        {
            "user_id": user_id,
            "name": _text(name, "name", 100),
            "grid_rows": _positive_int(grid_rows, "grid_rows"),
            "grid_cols": _positive_int(grid_cols, "grid_cols"),
        },
    )[0]


def get_user_gardens(user_id: str) -> list[Row]:
    return fetch("user_gardens", filters={"user_id": user_id}, order_by="created_at")


def upsert_species(species: Row | list[Row]) -> list[Row]:
    """Insert plant species, or update them when common_name already exists.

    Safe to run repeatedly, which makes it suitable for seeding the reference data.
    """
    _check_table("plant_species")
    return client().table("plant_species").upsert(species, on_conflict="common_name").execute().data


def find_species(name: str, limit: int = 10) -> list[Row]:
    """Case-insensitive partial match on the common name."""
    query = client().table("plant_species").select("*").ilike("common_name", f"%{name.strip()}%")
    return query.order("common_name").limit(limit).execute().data


def add_plant(
    garden_id: str,
    species_id: str,
    nickname: str,
    grid_x: int | None = None,
    grid_y: int | None = None,
) -> Row:
    """Add a plant to a garden, optionally on a grid cell.

    Checks that the cell lies inside the garden grid and is free. The check is not
    atomic, so add a unique constraint on (garden_id, grid_x, grid_y) in the database
    to make the guarantee hold under concurrent requests.
    """
    if (grid_x is None) != (grid_y is None):
        raise ValueError("Pass both grid_x and grid_y, or neither")

    if grid_x is not None and grid_y is not None:
        garden = _first(fetch("user_gardens", filters={"id": garden_id}, limit=1), "Garden")
        if not (0 <= grid_x < garden["grid_cols"] and 0 <= grid_y < garden["grid_rows"]):
            raise ValueError(
                f"Cell ({grid_x}, {grid_y}) is outside the {garden['grid_cols']} x "
                f"{garden['grid_rows']} grid (0-based, x is the column, y is the row)"
            )
        occupied = fetch(
            "plants",
            columns="id",
            filters={"garden_id": garden_id, "grid_x": grid_x, "grid_y": grid_y},
            limit=1,
        )
        if occupied:
            raise ValueError(f"Cell ({grid_x}, {grid_y}) already holds a plant")

    return insert(
        "plants",
        {
            "garden_id": garden_id,
            "species_id": species_id,
            "nickname": _text(nickname, "nickname", 100),
            "grid_x": grid_x,
            "grid_y": grid_y,
        },
    )[0]


def get_garden_plants(garden_id: str) -> list[Row]:
    """All plants in a garden with their species care data attached."""
    return fetch(
        "plants",
        columns="*, plant_species(common_name, watering_interval_days, sunlight_needs)",
        filters={"garden_id": garden_id},
        order_by="created_at",
        limit=1000,
    )


def mark_watered(plant_id: str, when: datetime | None = None) -> Row:
    timestamp = (when or datetime.now(timezone.utc)).isoformat()
    rows = update("plants", {"last_watered_at": timestamp}, {"id": plant_id})
    return _first(rows, "Plant")


# ---------------------------------------------------------------------------
# Care tasks
# ---------------------------------------------------------------------------


def add_care_task(plant_id: str, task_type: str, due_date: date | str) -> Row:
    return insert(
        "care_tasks",
        {
            "plant_id": plant_id,
            "task_type": _text(task_type, "task_type", 50),
            "due_date": _iso_date(due_date),
            "is_deferred": False,
        },
    )[0]


def get_open_tasks(garden_id: str, due_by: date | str | None = None) -> list[Row]:
    """Uncompleted tasks for every plant in a garden, earliest due date first."""
    query = (
        client()
        .table("care_tasks")
        .select("*, plants!inner(nickname, garden_id, plant_species(common_name))")
        .eq("plants.garden_id", garden_id)
        .is_("completed_at", "null")
    )
    if due_by is not None:
        query = query.lte("due_date", _iso_date(due_by))
    return query.order("due_date").execute().data


def complete_task(task_id: str) -> Row:
    return _first(update("care_tasks", {"completed_at": _now()}, {"id": task_id}), "Task")


def defer_task(task_id: str, reason: str, new_due_date: date | str | None = None) -> Row:
    values: Row = {"is_deferred": True, "defer_reason": _text(reason, "reason", 1000)}
    if new_due_date is not None:
        values["due_date"] = _iso_date(new_due_date)
    return _first(update("care_tasks", values, {"id": task_id}), "Task")


# ---------------------------------------------------------------------------
# Diagnoses
# ---------------------------------------------------------------------------


def save_diagnosis(
    plant_id: str,
    image_url: str,
    illness_name: str,
    confidence: float,
    urgency: str,
    treatment_steps: str | list[str],
    raw_llm_response: Row | None = None,
) -> Row:
    """Store the top diagnosis in columns and the complete model output in JSONB.

    confidence is a percentage from 0 to 100.
    """
    if isinstance(confidence, bool) or not 0 <= confidence <= 100:
        raise ValueError("confidence must be a number from 0 to 100")
    if urgency not in URGENCY_LEVELS:
        raise ValueError(f"urgency must be one of {', '.join(URGENCY_LEVELS)}")
    return insert(
        "plant_diagnoses",
        {
            "plant_id": plant_id,
            "image_url": _text(image_url, "image_url", 2048),
            "illness_name": _text(illness_name, "illness_name", 150),
            "confidence": round(float(confidence), 2),
            "urgency": urgency,
            "treatment_steps": _format_steps(treatment_steps),
            "raw_llm_response": raw_llm_response,
        },
    )[0]


def get_diagnoses(plant_id: str, limit: int = 10, include_raw: bool = False) -> list[Row]:
    columns = "id, image_url, illness_name, confidence, urgency, treatment_steps, created_at"
    if include_raw:
        columns += ", raw_llm_response"
    return fetch(
        "plant_diagnoses",
        columns=columns,
        filters={"plant_id": plant_id},
        order_by="created_at",
        descending=True,
        limit=limit,
    )


def get_diagnosis_context(plant_id: str, recent_diagnoses: int = 3) -> Row:
    """Everything the backend should put in the prompt before calling the vision model."""
    plant = _first(
        fetch(
            "plants",
            columns="*, plant_species(*), user_gardens(name, grid_rows, grid_cols)",
            filters={"id": plant_id},
            limit=1,
        ),
        "Plant",
    )
    return {
        "plant": plant,
        "recent_diagnoses": get_diagnoses(plant_id, limit=recent_diagnoses),
        "open_tasks": fetch(
            "care_tasks",
            filters={"plant_id": plant_id, "completed_at": None},
            order_by="due_date",
            limit=20,
        ),
    }


# ---------------------------------------------------------------------------
# Command line interface
# ---------------------------------------------------------------------------


def load_json_argument(raw: str) -> Any:
    """Parse inline JSON, or read a JSON file when the argument starts with @."""
    if raw.startswith("@"):
        with open(raw[1:], encoding="utf-8") as handle:
            return json.load(handle)
    return json.loads(raw)


def parse_filters(pairs: list[str]) -> dict[str, Any]:
    filters: dict[str, Any] = {}
    for pair in pairs:
        column, separator, value = pair.partition("=")
        if not separator or not column:
            raise ValueError(f"Filter '{pair}' must look like COLUMN=VALUE")
        filters[column] = None if value.lower() == "null" else value
    return filters


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Read from and insert into the gardening database.")
    commands = parser.add_subparsers(dest="command", required=True)

    select = commands.add_parser("select", help="read rows from a table")
    select.add_argument("table", choices=TABLES)
    select.add_argument("--columns", default="*", help="comma separated, default: *")
    select.add_argument(
        "--eq",
        action="append",
        default=[],
        metavar="COLUMN=VALUE",
        help="equality filter, repeatable, use COLUMN=null to match empty values",
    )
    select.add_argument("--order", help="column to sort by")
    select.add_argument("--desc", action="store_true", help="sort descending")
    select.add_argument("--limit", type=int, default=100, help="default: 100")

    insert_cmd = commands.add_parser("insert", help="insert rows without schema validation")
    insert_cmd.add_argument("table", choices=TABLES)
    insert_cmd.add_argument("data", help="JSON object, JSON array of objects, or @file.json")

    context = commands.add_parser("context", help="load the diagnosis context for a plant")
    context.add_argument("plant_id")

    return parser


def main() -> None:
    args = build_parser().parse_args()
    try:
        if args.command == "select":
            result: Any = fetch(
                args.table,
                columns=args.columns,
                filters=parse_filters(args.eq),
                order_by=args.order,
                descending=args.desc,
                limit=args.limit,
            )
        elif args.command == "insert":
            result = insert(args.table, load_json_argument(args.data))
        else:
            result = get_diagnosis_context(args.plant_id)
    except (APIError, OSError, RuntimeError, ValueError) as error:
        sys.exit(f"Error: {error}")
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
