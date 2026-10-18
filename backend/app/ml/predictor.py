from typing import Dict, Any, Optional
import joblib
import numpy as np
from app.config import ML_MODELS_DIR

_MODEL_CACHE: Dict[str, Any] = {}


def load_model_bundle(model_name: str) -> Optional[Dict[str, Any]]:
    if model_name in _MODEL_CACHE:
        return _MODEL_CACHE[model_name]
    pkl_path = ML_MODELS_DIR / f"{model_name}.pkl"
    if pkl_path.exists():
        bundle = joblib.load(pkl_path)
        _MODEL_CACHE[model_name] = bundle
        return bundle
    return None


def clear_model_cache():
    _MODEL_CACHE.clear()


def predict_crowd_ml(
    day_of_week: int = 5,
    month: int = 10,
    is_holiday: int = 0,
    hour: int = 11,
    historical_crowd: float = 65.0,
    weather_condition: str = "Clear",
) -> Dict[str, Any]:
    bundle = load_model_bundle("crowd_model")
    weather_map = {"Clear": 0, "Cloudy": 1, "Rainy": 2, "Foggy": 3, "Heavy Rain": 4, "Stormy": 4}
    w_code = weather_map.get(weather_condition, 0)
    season_peak = 1 if month in [10, 11, 12, 1, 2, 5] else 0
    is_weekend = 1 if day_of_week in [5, 6] else 0

    X = np.array([[day_of_week, month, season_peak, is_holiday, hour, historical_crowd, w_code, is_weekend]])
    if bundle and "model" in bundle:
        clf = bundle["model"]
        idx_pred = int(clf.predict(X)[0])
        proba = clf.predict_proba(X)[0]
        label = bundle["idx_to_label"].get(idx_pred, "Moderate")
        confidence = round(float(np.max(proba)) * 100, 1)
        algo = bundle.get("selected_algorithm", "Random Forest")
    else:
        # Fallback if model not yet trained
        score = historical_crowd + (15 if is_weekend else 0) + (15 if is_holiday else 0)
        label = "High" if score >= 75 else ("Moderate" if score >= 45 else "Low")
        confidence = 84.0
        algo = "Rule Fallback"

    score_map = {"Low": 28.0, "Moderate": 56.0, "High": 84.0}
    base_score = score_map.get(label, 55.0)
    numeric_score = round(min(98.0, max(12.0, (base_score * 0.7 + historical_crowd * 0.3))), 1)

    reasons = []
    if is_weekend:
        reasons.append("Weekend footfall surge")
    if season_peak:
        reasons.append("Peak tourism season month")
    if is_holiday:
        reasons.append("Public/Festival holiday period")
    if 16 <= hour <= 19:
        reasons.append("Evening peak visiting hours")
    elif 6 <= hour <= 9:
        reasons.append("Early morning low-density window")
    if not reasons:
        reasons.append("Standard weekday visitor distribution")

    return {
        "crowd_level": label,
        "crowd_risk_score": numeric_score,
        "confidence_pct": confidence,
        "model_used": f"crowd_model.pkl ({algo})",
        "reasons": reasons,
    }


def predict_weather_risk_ml(
    temperature: float = 28.0,
    rainfall: float = 0.0,
    humidity: float = 60.0,
    wind_speed: float = 12.0,
    activity_sensitivity: str = "MEDIUM",
    month: int = 10,
) -> Dict[str, Any]:
    bundle = load_model_bundle("weather_risk_model")
    sens_map = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}
    sens_code = sens_map.get(str(activity_sensitivity).upper(), 1)

    X = np.array([[temperature, rainfall, humidity, wind_speed, sens_code, month]])
    if bundle and "model" in bundle:
        clf = bundle["model"]
        idx_pred = int(clf.predict(X)[0])
        proba = clf.predict_proba(X)[0]
        label = bundle["idx_to_label"].get(idx_pred, "LOW")
        confidence = round(float(np.max(proba)) * 100, 1)
        algo = bundle.get("selected_algorithm", "Random Forest")
    else:
        label = "HIGH" if (rainfall > 40 and sens_code >= 1) else ("MEDIUM" if rainfall > 15 or temperature > 39 else "LOW")
        confidence = 86.0
        algo = "Rule Fallback"

    # Configurable domain guardrails (Section 16: Heavy Rain + Trekking -> HIGH, Heavy Rain + Museum -> LOW/MODERATE)
    reasons = []
    if rainfall >= 40 and sens_code == 2:
        label = "HIGH"
        reasons.append(f"Heavy rainfall ({rainfall} mm) combined with high-exposure outdoor/trekking activity")
    elif rainfall >= 40 and sens_code == 0:
        label = "LOW" if rainfall < 65 else "MEDIUM"
        reasons.append(f"Indoor attraction shields visitors from {rainfall} mm rainfall")
    elif temperature >= 40 and sens_code >= 1:
        if label == "LOW":
            label = "MEDIUM"
        reasons.append(f"High heat stress ({temperature}°C) during outdoor sightseeing")
    elif temperature <= 5 and sens_code == 2:
        reasons.append(f"Extreme cold ({temperature}°C) at high-altitude/outdoor site")
    else:
        reasons.append(f"Favorable weather ({temperature}°C, {rainfall} mm rain) for planned activity")

    score_map = {"LOW": 22.0, "MEDIUM": 54.0, "HIGH": 85.0}
    risk_score = score_map.get(label, 30.0)
    if rainfall > 50:
        risk_score = min(96.0, risk_score + 8.0)

    return {
        "weather_risk_level": label,
        "weather_risk_score": round(risk_score, 1),
        "confidence_pct": confidence,
        "model_used": f"weather_risk_model.pkl ({algo})",
        "reasons": reasons,
    }


def predict_scam_risk_ml(
    district_crime_index: float = 32.0,
    hour: int = 14,
    location_hub_type: int = 1,
    historical_incident_reports: int = 2,
    incident_severity_weight: int = 1,
) -> Dict[str, Any]:
    bundle = load_model_bundle("scam_risk_model")
    is_late_night = 1 if (hour >= 21 or hour <= 5) else 0
    X = np.array([[
        district_crime_index, hour, is_late_night,
        location_hub_type, historical_incident_reports, incident_severity_weight
    ]])

    if bundle and "model" in bundle:
        clf = bundle["model"]
        idx_pred = int(clf.predict(X)[0])
        proba = clf.predict_proba(X)[0]
        label = bundle["idx_to_label"].get(idx_pred, "LOW")
        confidence = round(float(np.max(proba)) * 100, 1)
        algo = bundle.get("selected_algorithm", "Random Forest")
    else:
        pts = district_crime_index * 0.4 + is_late_night * 25 + historical_incident_reports * 5
        label = "HIGH" if pts >= 60 else ("MEDIUM" if pts >= 35 else "LOW")
        confidence = 85.0
        algo = "Rule Fallback"

    if is_late_night and (location_hub_type == 2 or historical_incident_reports >= 4):
        label = "HIGH"

    score_map = {"LOW": 24.0, "MEDIUM": 52.0, "HIGH": 79.0}
    base = score_map.get(label, 30.0)
    score = round(min(96.0, max(10.0, base * 0.75 + district_crime_index * 0.25)), 1)

    precautions = [
        "Book government-prepaid cabs, metro, or verified ride-hailing apps instead of unmarked touts.",
        "Verify official ASI/state monument ticket counters or QR portals; avoid unofficial 'skip-the-line' guides.",
    ]
    if is_late_night:
        precautions.insert(0, "Avoid isolated transit hubs and unlit bazaar lanes after 9:30 PM.")

    return {
        "scam_risk_level": label,
        "scam_risk_score": score,
        "confidence_pct": confidence,
        "model_used": f"scam_risk_model.pkl ({algo})",
        "precautions": precautions,
    }


def predict_route_risk_ml(
    road_type_code: int = 1,
    lanes: int = 4,
    traffic_signal: int = 1,
    weather_condition: str = "Clear",
    visibility_km: float = 8.0,
    traffic_density_code: int = 2,
    hour: int = 14,
) -> Dict[str, Any]:
    bundle = load_model_bundle("route_risk_model")
    weather_map = {"Clear": 0, "Cloudy": 1, "Rainy": 2, "Foggy": 3, "Stormy": 4, "Heavy Rain": 4}
    w_code = weather_map.get(weather_condition, 0)
    is_peak = 1 if hour in [8, 9, 10, 17, 18, 19, 20] else 0

    X = np.array([[road_type_code, lanes, traffic_signal, w_code, visibility_km, traffic_density_code, is_peak, hour]])
    if bundle and "model" in bundle:
        clf = bundle["model"]
        idx_pred = int(clf.predict(X)[0])
        proba = clf.predict_proba(X)[0]
        label = bundle["idx_to_label"].get(idx_pred, "LOW")
        confidence = round(float(np.max(proba)) * 100, 1)
        algo = bundle.get("selected_algorithm", "Random Forest")
    else:
        label = "HIGH" if (w_code >= 3 or visibility_km < 3) else ("MEDIUM" if is_peak else "LOW")
        confidence = 85.0
        algo = "Rule Fallback"

    score_map = {"LOW": 25.0, "MEDIUM": 55.0, "HIGH": 82.0}
    score = score_map.get(label, 35.0)

    return {
        "route_risk_level": label,
        "route_risk_score": round(score, 1),
        "confidence_pct": confidence,
        "model_used": f"route_risk_model.pkl ({algo})",
    }
