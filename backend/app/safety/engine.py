from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.config import DEFAULT_RISK_WEIGHTS
from app.ml.predictor import (
    predict_crowd_ml,
    predict_weather_risk_ml,
    predict_scam_risk_ml,
    predict_route_risk_ml,
)
from app.models.entities import TouristPlace, IncidentReport, District


def evaluate_time_based_risk(
    selected_time: str = "14:00",
    opening_time: str = "09:00",
    closing_time: str = "18:00",
    category: str = "Historical",
    incident_count: int = 0,
) -> Dict[str, Any]:
    """
    Section 20: Time-Based Safety Analysis.
    Evaluates place type, opening hours, time of day, and historical incidents.
    """
    try:
        hour = int(selected_time.split(":")[0])
    except Exception:
        hour = 14
    try:
        open_h = int(opening_time.split(":")[0])
        close_h = int(closing_time.split(":")[0])
    except Exception:
        open_h, close_h = 8, 19

    score = 18.0
    reasons = []
    recommendation = "Selected visiting window is within safe daytime operating hours."

    is_outdoor_isolated = category in [
        "Waterfall", "Trekking", "Wildlife", "Nature", "Beach", "Hill Station", "Fort", "Camping"
    ]

    if hour < open_h or hour > close_h:
        score += 45.0
        reasons.append(f"Selected time ({selected_time}) is outside regular operating hours ({opening_time}–{closing_time})")
        recommendation = f"Reschedule visit between {opening_time} and {closing_time} when security staff are active."

    if hour >= 21 or hour <= 5:
        score += 38.0
        reasons.append(f"Late-night / pre-dawn window ({selected_time}) increases visibility and transit vulnerability")
        if is_outdoor_isolated:
            score += 20.0
            reasons.append(f"Isolated/outdoor {category.lower()} location at night carries elevated safety risk")
        recommendation = "Visit during daytime hours (08:30 AM – 05:00 PM) and use verified transport."
    elif 18 <= hour <= 20 and is_outdoor_isolated:
        score += 24.0
        reasons.append(f"Post-sunset hours at outdoor {category.lower()} site reduce trail visibility")
        recommendation = "Start outdoor exploration before 03:30 PM to return before dusk."
    elif 13 <= hour <= 15 and category in ["Fort", "Historical", "Trekking"]:
        score += 12.0
        reasons.append("Peak afternoon solar exposure window")

    if incident_count >= 3 and hour >= 19:
        score += 15.0
        reasons.append(f"{incident_count} evening/night incidents reported near this zone")

    score = round(min(98.0, max(10.0, score)), 1)
    level = "HIGH" if score >= 67 else ("MEDIUM" if score >= 34 else "LOW")
    if not reasons:
        reasons.append("Optimal daytime lighting, active tourist footfall, and open security checkpoints")

    return {
        "time_risk_score": score,
        "time_risk_level": level,
        "hour": hour,
        "reasons": reasons,
        "recommendation": recommendation,
    }


def compute_comprehensive_safety_risk(
    db: Optional[Session],
    destination: str = "Delhi",
    place_name: Optional[str] = None,
    category: str = "Historical",
    activity: str = "Sightseeing",
    travel_date: str = "2026-10-15",
    visit_time: str = "14:00",
    temperature_c: float = 28.0,
    rainfall_mm: float = 0.0,
    humidity_pct: float = 60.0,
    wind_speed_kmh: float = 12.0,
    weather_condition: str = "Clear",
    custom_weights: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Sections 15, 34, 35: Multi-Factor AI Safety Engine + Transparent Risk Score + Safer Alternatives.
    """
    weights = dict(DEFAULT_RISK_WEIGHTS)
    if custom_weights:
        weights.update(custom_weights)

    # Parse date
    try:
        dt = datetime.strptime(travel_date[:10], "%Y-%m-%d")
        day_of_week = dt.weekday()
        month = dt.month
    except Exception:
        day_of_week = 5
        month = 10

    try:
        hour = int(visit_time.split(":")[0])
    except Exception:
        hour = 14

    # Lookup place and district from DB if available
    place_obj: Optional[TouristPlace] = None
    incident_count = 1
    district_crime_idx = 30.0
    base_location_safety = 82.0
    opening_time = "09:00"
    closing_time = "18:00"
    weather_sens = "MEDIUM"

    if db is not None:
        q = db.query(TouristPlace)
        if place_name:
            place_obj = q.filter(TouristPlace.name.ilike(f"%{place_name}%")).first()
        if not place_obj and destination:
            place_obj = q.filter(
                (TouristPlace.city.ilike(f"%{destination}%")) | (TouristPlace.state.ilike(f"%{destination}%"))
            ).first()

        if place_obj:
            category = place_obj.category or category
            base_location_safety = float(place_obj.safety_score or 82.0)
            opening_time = place_obj.opening_time or "09:00"
            closing_time = place_obj.closing_time or "18:00"
            weather_sens = place_obj.weather_sensitivity or "MEDIUM"
            incident_count = db.query(IncidentReport).filter(
                (IncidentReport.place_id == place_obj.id) | (IncidentReport.city.ilike(f"%{place_obj.city}%"))
            ).count()
            if place_obj.district_id:
                dist_obj = db.query(District).filter(District.id == place_obj.district_id).first()
                if dist_obj:
                    district_crime_idx = float(dist_obj.crime_index or 30.0)

    # Activity sensitivity override
    act_lower = f"{activity} {category}".lower()
    if any(k in act_lower for k in ["trek", "waterfall", "safari", "beach", "rafting", "camp", "adventure", "outdoor"]):
        weather_sens = "HIGH"
    elif any(k in act_lower for k in ["museum", "gallery", "indoor", "palace", "mall"]):
        weather_sens = "LOW"

    # 1. Weather Risk (ML + domain rules)
    weather_res = predict_weather_risk_ml(
        temperature=temperature_c,
        rainfall=rainfall_mm,
        humidity=humidity_pct,
        wind_speed=wind_speed_kmh,
        activity_sensitivity=weather_sens,
        month=month,
    )
    weather_risk_score = weather_res["weather_risk_score"]

    # 2. Crowd Risk (ML)
    hist_crowd = float(place_obj.crowd_score if place_obj else 62.0)
    crowd_res = predict_crowd_ml(
        day_of_week=day_of_week,
        month=month,
        is_holiday=1 if day_of_week in [5, 6] else 0,
        hour=hour,
        historical_crowd=hist_crowd,
        weather_condition=weather_condition,
    )
    crowd_risk_score = crowd_res["crowd_risk_score"]

    # 3. Time Risk (Rule-based time suitability)
    time_res = evaluate_time_based_risk(
        selected_time=visit_time,
        opening_time=opening_time,
        closing_time=closing_time,
        category=category,
        incident_count=incident_count,
    )
    time_risk_score = time_res["time_risk_score"]

    # 4. Route Risk (ML)
    vis_km = 3.0 if rainfall_mm > 35 else (5.0 if weather_condition in ["Rainy", "Foggy"] else 9.0)
    td_code = 3 if crowd_res["crowd_level"] == "High" else (2 if crowd_res["crowd_level"] == "Moderate" else 1)
    route_res = predict_route_risk_ml(
        road_type_code=2 if weather_sens == "HIGH" else 1,
        lanes=4,
        traffic_signal=1,
        weather_condition=weather_condition,
        visibility_km=vis_km,
        traffic_density_code=td_code,
        hour=hour,
    )
    route_risk_score = route_res["route_risk_score"]
    if rainfall_mm > 40:
        route_risk_score = min(94.0, route_risk_score + 18.0)

    # 5. Location Risk (Inverse of verified safety score + district crime baseline)
    location_risk_score = round(
        min(95.0, max(12.0, (100.0 - base_location_safety) * 1.4 + district_crime_idx * 0.35)), 1
    )

    # 6. Scam / Incident Risk (ML)
    hub_type = 2 if category in ["Shopping", "Food"] else (1 if category in ["Historical", "Fort", "Temple"] else 0)
    scam_res = predict_scam_risk_ml(
        district_crime_index=district_crime_idx,
        hour=hour,
        location_hub_type=hub_type,
        historical_incident_reports=incident_count,
        incident_severity_weight=2 if incident_count > 2 else 1,
    )
    scam_risk_score = scam_res["scam_risk_score"]

    # Transparent Weighted Sum (Section 34)
    overall_score = round(
        weather_risk_score * weights["weather_risk"]
        + crowd_risk_score * weights["crowd_risk"]
        + time_risk_score * weights["time_risk"]
        + route_risk_score * weights["route_risk"]
        + location_risk_score * weights["location_risk"]
        + scam_risk_score * weights["scam_risk"],
        1,
    )

    if overall_score <= 33:
        overall_level = "LOW"
    elif overall_score <= 66:
        overall_level = "MEDIUM"
    else:
        overall_level = "HIGH"

    # Build human-readable reasons
    reasons: List[str] = []
    if weather_risk_score >= 55:
        reasons.extend(weather_res["reasons"])
    if crowd_risk_score >= 60:
        reasons.append(f"{crowd_res['crowd_level']} predicted crowd ({crowd_risk_score}/100) at {visit_time}")
    if time_risk_score >= 45:
        reasons.extend(time_res["reasons"])
    if route_risk_score >= 55:
        reasons.append(f"Elevated route risk ({route_risk_score}/100) due to traffic/weather conditions")
    if scam_risk_score >= 55:
        reasons.append(f"Moderate-to-high tout/scam alert index ({scam_risk_score}/100) in busy zone")
    if not reasons:
        reasons.append("Favorable weather, manageable crowd density, and high daytime location safety.")

    # Section 35: Safer Alternative System
    safer_alternatives = _generate_safer_alternatives(
        db=db,
        destination=destination,
        category=category,
        activity=activity,
        visit_time=visit_time,
        rainfall_mm=rainfall_mm,
        temperature_c=temperature_c,
        overall_level=overall_level,
        weather_risk_score=weather_risk_score,
        crowd_risk_score=crowd_risk_score,
        time_risk_score=time_risk_score,
    )

    return {
        "destination": destination,
        "place_name": place_obj.name if place_obj else (place_name or destination),
        "activity": activity,
        "overall_risk_score": overall_score,
        "overall_risk_level": overall_level,
        "weights_used": weights,
        "factor_scores": {
            "weather": round(weather_risk_score, 1),
            "crowd": round(crowd_risk_score, 1),
            "time": round(time_risk_score, 1),
            "route": round(route_risk_score, 1),
            "location": round(location_risk_score, 1),
            "scam": round(scam_risk_score, 1),
        },
        "crowd_prediction": crowd_res,
        "weather_analysis": weather_res,
        "time_analysis": time_res,
        "scam_analysis": scam_res,
        "route_analysis": route_res,
        "reasons": reasons,
        "explanation_summary": " + ".join(reasons[:4]),
        "recommendation": safer_alternatives["primary_recommendation"],
        "safer_alternatives": safer_alternatives,
    }


def _generate_safer_alternatives(
    db: Optional[Session],
    destination: str,
    category: str,
    activity: str,
    visit_time: str,
    rainfall_mm: float,
    temperature_c: float,
    overall_level: str,
    weather_risk_score: float,
    crowd_risk_score: float,
    time_risk_score: float,
) -> Dict[str, Any]:
    alt_time = "08:30 AM – 11:30 AM (Morning Low-Risk Window)"
    alt_activity = "Guided Indoor Museum / Heritage Palace Tour" if weather_risk_score >= 50 else "Daytime Cultural & Monument Walk"
    alt_route = "Safety-Verified Route B (Metro + Arterial Corridor avoiding congested/unlit stretches)"
    alt_place_name = "National Museum / State Heritage Gallery"

    if db is not None:
        indoor_candidates = db.query(TouristPlace).filter(
            (TouristPlace.city.ilike(f"%{destination}%")) | (TouristPlace.state.ilike(f"%{destination}%")),
            TouristPlace.weather_sensitivity == "LOW",
        ).order_by(TouristPlace.safety_score.desc()).limit(3).all()
        if indoor_candidates:
            alt_place_name = ", ".join(p.name for p in indoor_candidates[:2])

    if rainfall_mm >= 25 or weather_risk_score >= 55:
        primary_rec = (
            f"Consider visiting an indoor attraction ({alt_place_name}) during heavy rain/adverse weather "
            f"and move {activity.lower()} to a clear morning weather window ({alt_time})."
        )
    elif time_risk_score >= 50:
        primary_rec = (
            f"Selected time ({visit_time}) has elevated time risk. Reschedule visit to {alt_time} "
            f"or choose well-patrolled central landmarks ({alt_place_name})."
        )
    elif crowd_risk_score >= 65:
        primary_rec = (
            f"High crowd predicted at {visit_time}. Visit early at {alt_time} and use Metro transit to bypass traffic."
        )
    elif overall_level == "LOW":
        primary_rec = "Conditions are safe and optimal. Follow standard travel precautions and use verified transport."
    else:
        primary_rec = f"Moderate risk detected. Prefer visiting during {alt_time} via {alt_route}."

    return {
        "primary_recommendation": primary_rec,
        "alternative_time": alt_time,
        "alternative_place": alt_place_name,
        "alternative_activity": alt_activity,
        "alternative_route": alt_route,
    }
