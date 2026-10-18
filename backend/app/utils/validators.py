import re
from typing import Dict, Any, List, Tuple

INDIAN_STATES_AND_UTS = {
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    # Union Territories
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
}

TIME_PATTERN = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")


def normalize_state_name(state: str) -> str:
    if not state:
        return ""
    s = state.strip()
    mapping = {
        "NCT of Delhi": "Delhi",
        "New Delhi": "Delhi",
        "Pondicherry": "Puducherry",
        "Andaman & Nicobar": "Andaman and Nicobar Islands",
        "Andaman & Nicobar Islands": "Andaman and Nicobar Islands",
        "Jammu & Kashmir": "Jammu and Kashmir",
        "Orissa": "Odisha",
        "Uttaranchal": "Uttarakhand",
    }
    return mapping.get(s, s)


def validate_tourist_place_record(
    record: Dict[str, Any],
    existing_place_keys: set = None,
) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    Validates a tourist place record per Section 29 requirements:
    - Required: state, district, city, name, latitude, longitude, category
    - Validates coordinate bounds, non-negative prices, valid times, state validity, duplicates.
    """
    errors: List[str] = []
    cleaned = dict(record)

    required_fields = ["state", "district", "city", "name", "latitude", "longitude", "category"]
    for field in required_fields:
        val = cleaned.get(field)
        if val is None or (isinstance(val, str) and not val.strip()):
            errors.append(f"Missing required field: '{field}'")

    state_norm = normalize_state_name(str(cleaned.get("state", "")))
    cleaned["state"] = state_norm
    if state_norm and state_norm not in INDIAN_STATES_AND_UTS:
        errors.append(f"Invalid Indian State/UT: '{state_norm}'")

    # Validate Latitude & Longitude (India bounding box approx 6.0 to 37.6 N, 68.0 to 97.6 E)
    try:
        lat = float(cleaned.get("latitude", 0))
        lon = float(cleaned.get("longitude", 0))
        cleaned["latitude"] = round(lat, 5)
        cleaned["longitude"] = round(lon, 5)
        if not (6.0 <= lat <= 38.0):
            errors.append(f"Latitude {lat} is out of valid India geographic range (6.0°N – 38.0°N)")
        if not (68.0 <= lon <= 98.0):
            errors.append(f"Longitude {lon} is out of valid India geographic range (68.0°E – 98.0°E)")
    except (TypeError, ValueError):
        errors.append("Latitude and Longitude must be valid numeric coordinates")

    # Validate Entry Fee
    try:
        fee = float(cleaned.get("entry_fee", 0.0) or 0.0)
        if fee < 0:
            errors.append(f"Negative entry fee ({fee}) is invalid")
        cleaned["entry_fee"] = fee
    except (TypeError, ValueError):
        errors.append("Entry fee must be a valid number")

    # Validate Opening and Closing Times
    opening = str(cleaned.get("opening_time", "09:00") or "09:00").strip()
    closing = str(cleaned.get("closing_time", "18:00") or "18:00").strip()
    if not TIME_PATTERN.match(opening):
        errors.append(f"Invalid opening_time '{opening}' (expected HH:MM 24-hr format)")
    if not TIME_PATTERN.match(closing):
        errors.append(f"Invalid closing_time '{closing}' (expected HH:MM 24-hr format)")
    cleaned["opening_time"] = opening
    cleaned["closing_time"] = closing

    # Validate Rating & Safety Score
    try:
        rating = float(cleaned.get("rating", 4.4) or 4.4)
        if not (0.0 <= rating <= 5.0):
            errors.append(f"Rating {rating} must be between 0.0 and 5.0")
        cleaned["rating"] = round(rating, 2)
    except (TypeError, ValueError):
        cleaned["rating"] = 4.4

    try:
        safety = float(cleaned.get("safety_score", 80.0) or 80.0)
        if not (0.0 <= safety <= 100.0):
            errors.append(f"Safety score {safety} must be between 0 and 100")
        cleaned["safety_score"] = round(safety, 1)
    except (TypeError, ValueError):
        cleaned["safety_score"] = 80.0

    # Duplicate check
    if existing_place_keys is not None:
        key = (
            str(cleaned.get("name", "")).strip().lower(),
            str(cleaned.get("city", "")).strip().lower(),
            state_norm.lower(),
        )
        if key in existing_place_keys:
            errors.append(f"Duplicate tourist place detected: '{cleaned.get('name')}' in {cleaned.get('city')}, {state_norm}")

    return (len(errors) == 0, errors, cleaned)
