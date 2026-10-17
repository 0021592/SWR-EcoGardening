"""Open-Meteo weather client for the gardening app.

Setup (Python 3.10 or newer):
    pip install requests
    The --garden option and get_garden_weather() also need db.py next to this
    file, its dependencies (supabase, python-dotenv) and its .env file.

Command line:
    python weather.py --city Iasi --country RO
    python weather.py --city Iasi --country RO --summary
    python weather.py --lat 47.16 --lon 27.59 --days 5
    python weather.py --garden <garden uuid>

From code:
    from weather import get_garden_weather, get_weather
    forecast = get_weather(47.16, 27.59, days=7)

Notes:
    - The free Open-Meteo tier is for non-commercial use. Its limits are 600 calls
      per minute, 5,000 per hour and 10,000 per day.
    - The data is licensed CC BY 4.0. Show the ATTRIBUTION text wherever you
      display it.
    - Results are cached in memory for one hour per location. Coordinates are
      rounded to 2 decimals (about 1 km) before the request, so nearby gardens
      share one call.
    - Units are the Open-Meteo defaults: degrees Celsius, km/h and mm. The
      "units" field lists the unit of every variable.
"""

import argparse
import copy
import json
import sys
import time
from datetime import datetime, timezone
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

Weather = dict[str, Any]

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
ATTRIBUTION = "Weather data by Open-Meteo.com (https://open-meteo.com), CC BY 4.0"
USER_AGENT = "gardening-app-mvp/0.1"
REQUEST_TIMEOUT_SECONDS = 10
CACHE_TTL_SECONDS = 3600
MAX_FORECAST_DAYS = 16

# Edit these lists to change what the app receives.
CURRENT_VARIABLES = (
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "precipitation",
    "weather_code",
    "cloud_cover",
    "wind_speed_10m",
    "wind_gusts_10m",
    "is_day",
)
DAILY_VARIABLES = (
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
    "uv_index_max",
    "sunshine_duration",
    "et0_fao_evapotranspiration",
    "sunrise",
    "sunset",
)
# Hourly variables. Their value for the current hour is merged into "current".
HOURLY_VARIABLES = ("soil_temperature_6cm", "soil_moisture_3_to_9cm")

WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


class WeatherError(RuntimeError):
    """Raised when Open-Meteo is unreachable, returns an error, or finds no match."""


def _make_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.headers["User-Agent"] = USER_AGENT
    return session


_http = _make_session()
_cache: dict[tuple[float, float, int], tuple[float, Weather]] = {}


def _get_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    try:
        response = _http.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
    except requests.RequestException as error:
        raise WeatherError(f"Could not reach Open-Meteo: {error}") from error
    try:
        data = response.json()
    except ValueError:
        data = {}
    failed = response.status_code != 200 or (isinstance(data, dict) and data.get("error"))
    if failed:
        reason = data.get("reason") if isinstance(data, dict) else None
        raise WeatherError(
            f"Open-Meteo returned status {response.status_code}: {reason or response.text[:200]}"
        )
    return data


# ---------------------------------------------------------------------------
# Geocoding
# ---------------------------------------------------------------------------


def geocode(city: str, country_code: str | None = None, count: int = 5) -> list[dict[str, Any]]:
    """Find places by name, best match first.

    country_code is an ISO 3166-1 alpha-2 code such as RO. Use it to avoid
    ambiguous names. Raises WeatherError when nothing matches.
    """
    name = (city or "").strip()
    if len(name) < 2:
        raise ValueError("city must have at least 2 characters")
    params: dict[str, Any] = {"name": name, "count": count, "language": "en", "format": "json"}
    if country_code:
        params["countryCode"] = country_code.strip().upper()
    results = _get_json(GEOCODING_URL, params).get("results") or []
    if not results:
        where = f" in {params['countryCode']}" if country_code else ""
        raise WeatherError(f"No location found for '{name}'{where}")
    return [
        {
            "name": place.get("name"),
            "country": place.get("country"),
            "country_code": place.get("country_code"),
            "region": place.get("admin1"),
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "elevation": place.get("elevation"),
            "timezone": place.get("timezone"),
            "population": place.get("population"),
        }
        for place in results
    ]


# ---------------------------------------------------------------------------
# Forecast
# ---------------------------------------------------------------------------


def _current_hourly_values(payload: dict[str, Any]) -> dict[str, Any]:
    """Pick the hourly values that match the current hour."""
    hourly = payload.get("hourly") or {}
    hour = payload["current"]["time"][:13] + ":00"
    try:
        index = hourly["time"].index(hour)
    except (KeyError, ValueError):
        return {name: None for name in HOURLY_VARIABLES}
    return {name: hourly[name][index] for name in HOURLY_VARIABLES}


def _describe(code: int | None) -> str:
    return WEATHER_CODES.get(code, "Unknown")


def _build_result(payload: dict[str, Any]) -> Weather:
    current = {key: value for key, value in payload["current"].items() if key != "interval"}
    current.update(_current_hourly_values(payload))
    current["weather_description"] = _describe(current.get("weather_code"))

    raw_daily = payload["daily"]
    daily = []
    for index, day in enumerate(raw_daily["time"]):
        entry: dict[str, Any] = {"date": day}
        for name in DAILY_VARIABLES:
            entry[name] = raw_daily[name][index]
        entry["weather_description"] = _describe(entry.get("weather_code"))
        daily.append(entry)

    units: dict[str, str] = {}
    for key in ("hourly_units", "current_units", "daily_units"):
        for name, unit in (payload.get(key) or {}).items():
            if name not in ("time", "interval"):
                units[name] = unit

    return {
        "location": {
            "latitude": payload["latitude"],
            "longitude": payload["longitude"],
            "elevation": payload.get("elevation"),
            "timezone": payload.get("timezone"),
        },
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "current": current,
        "daily": daily,
        "units": units,
        "attribution": ATTRIBUTION,
    }


def get_weather(latitude: float, longitude: float, days: int = 7, use_cache: bool = True) -> Weather:
    """Current conditions plus a daily forecast for a point.

    days is 1 to 16. Times are in the location's local timezone.
    """
    if not -90 <= latitude <= 90:
        raise ValueError("latitude must be between -90 and 90")
    if not -180 <= longitude <= 180:
        raise ValueError("longitude must be between -180 and 180")
    if isinstance(days, bool) or not isinstance(days, int) or not 1 <= days <= MAX_FORECAST_DAYS:
        raise ValueError(f"days must be an integer from 1 to {MAX_FORECAST_DAYS}")

    lat, lon = round(float(latitude), 2), round(float(longitude), 2)
    key = (lat, lon, days)
    now = time.monotonic()
    cached = _cache.get(key)
    if use_cache and cached and now - cached[0] < CACHE_TTL_SECONDS:
        return copy.deepcopy(cached[1])

    payload = _get_json(
        FORECAST_URL,
        {
            "latitude": lat,
            "longitude": lon,
            "current": ",".join(CURRENT_VARIABLES),
            "hourly": ",".join(HOURLY_VARIABLES),
            "daily": ",".join(DAILY_VARIABLES),
            "timezone": "auto",
            "forecast_days": days,
        },
    )
    result = _build_result(payload)
    _cache[key] = (now, result)
    return copy.deepcopy(result)


def get_city_weather(city: str, country_code: str | None = None, days: int = 7) -> Weather:
    """Geocode a city name and return its weather. Uses the best geocoding match."""
    place = geocode(city, country_code)[0]
    result = get_weather(place["latitude"], place["longitude"], days)
    result["location"].update(
        name=place["name"], country=place["country"], region=place["region"]
    )
    return result


def get_garden_weather(garden_id: str, days: int = 7, country_code: str | None = None) -> Weather:
    """Weather for a row of the gardens table.

    Uses the stored latitude and longitude. When they are empty, geocodes the
    city once and writes the coordinates back, so later calls skip geocoding.
    """
    import db  # imported here so the rest of this module works without Supabase
    from postgrest.exceptions import APIError

    try:
        rows = (
            db.client()
            .table("gardens")
            .select("id, name, city, latitude, longitude")
            .eq("id", garden_id)
            .limit(1)
            .execute()
            .data
        )
        if not rows:
            raise ValueError(f"Garden {garden_id} not found")
        garden = rows[0]

        if garden["latitude"] is None or garden["longitude"] is None:
            if not garden.get("city"):
                raise ValueError("Garden has no coordinates and no city to look up")
            place = geocode(garden["city"], country_code)[0]
            garden["latitude"] = round(place["latitude"], 6)
            garden["longitude"] = round(place["longitude"], 6)
            (
                db.client()
                .table("gardens")
                .update({"latitude": garden["latitude"], "longitude": garden["longitude"]})
                .eq("id", garden_id)
                .execute()
            )
    except APIError as error:
        raise WeatherError(f"Database error: {error}") from error

    result = get_weather(float(garden["latitude"]), float(garden["longitude"]), days)
    result["garden"] = {"id": garden["id"], "name": garden["name"], "city": garden["city"]}
    return result


# ---------------------------------------------------------------------------
# Command line interface
# ---------------------------------------------------------------------------


def _show(value: Any, unit: str = "") -> str:
    return "n/a" if value is None else f"{value} {unit}".strip()


def format_summary(weather: Weather) -> str:
    """Short human-readable text for checking results in a terminal."""
    location = weather["location"]
    units = weather["units"]
    current = weather["current"]
    name = location.get("name") or f"{location['latitude']}, {location['longitude']}"
    lines = [
        f"{name} (timezone {location['timezone']}, elevation {_show(location['elevation'], 'm')})",
        "Now: "
        f"{_show(current['temperature_2m'], units['temperature_2m'])} "
        f"(feels like {_show(current['apparent_temperature'], units['apparent_temperature'])}), "
        f"{current['weather_description']}, "
        f"wind {_show(current['wind_speed_10m'], units['wind_speed_10m'])}, "
        f"humidity {_show(current['relative_humidity_2m'], units['relative_humidity_2m'])}",
        "Soil: "
        f"{_show(current['soil_temperature_6cm'], units['soil_temperature_6cm'])} at 6 cm, "
        f"moisture {_show(current['soil_moisture_3_to_9cm'], units['soil_moisture_3_to_9cm'])} "
        "at 3 to 9 cm",
    ]
    for day in weather["daily"]:
        lines.append(
            f"{day['date']}: "
            f"{_show(day['temperature_2m_min'])} to "
            f"{_show(day['temperature_2m_max'], units['temperature_2m_max'])}, "
            f"precipitation {_show(day['precipitation_sum'], units['precipitation_sum'])}, "
            f"{day['weather_description']}"
        )
    lines.append(weather["attribution"])
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Fetch weather from Open-Meteo.")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--city", help="city name, geocoded with Open-Meteo")
    source.add_argument("--garden", help="id of a row in the gardens table")
    source.add_argument("--lat", type=float, help="latitude, use together with --lon")
    parser.add_argument("--lon", type=float, help="longitude, use together with --lat")
    parser.add_argument("--country", help="ISO country code such as RO, narrows city lookups")
    parser.add_argument("--days", type=int, default=7, help=f"1 to {MAX_FORECAST_DAYS}, default 7")
    parser.add_argument("--summary", action="store_true", help="print text instead of JSON")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    if (args.lat is None) != (args.lon is None):
        parser.error("--lat and --lon must be used together")

    try:
        if args.city:
            result = get_city_weather(args.city, args.country, args.days)
        elif args.garden:
            result = get_garden_weather(args.garden, args.days, args.country)
        else:
            result = get_weather(args.lat, args.lon, args.days)
    except (RuntimeError, ValueError) as error:
        sys.exit(f"Error: {error}")

    if args.summary:
        print(format_summary(result))
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
