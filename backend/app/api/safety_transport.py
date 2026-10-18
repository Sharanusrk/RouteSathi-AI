from typing import Optional, Dict
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.ml.predictor import predict_crowd_ml, predict_weather_risk_ml
from app.models.entities import IncidentReport, MetroStation, BusStop, TouristPlace, User
from app.routing.engine import (
    analyze_safe_vs_shortest_route,
    calculate_local_transport_options,
    calculate_intercity_transport,
    CITY_COORDINATES,
)
from app.safety.engine import compute_comprehensive_safety_risk
from app.utils.security import get_optional_user
from app.weather.service import fetch_weather_for_coordinates

router = APIRouter(prefix="/api", tags=["AI Safety, Crowd, Weather, Routing & Transport"])


class RiskPredictRequest(BaseModel):
    destination: str = "Delhi"
    placeName: Optional[str] = "Red Fort (Lal Qila)"
    category: Optional[str] = "Historical"
    activity: Optional[str] = "Sightseeing"
    date: Optional[str] = "2026-10-15"
    time: Optional[str] = "14:00"
    temperatureC: Optional[float] = None
    rainfallMm: Optional[float] = None
    humidityPct: Optional[float] = 62.0
    windSpeedKmh: Optional[float] = 12.0
    weatherCondition: Optional[str] = None
    customWeights: Optional[Dict[str, float]] = None


class CrowdPredictRequest(BaseModel):
    placeName: Optional[str] = "India Gate"
    dayOfWeek: int = 5
    month: int = 10
    isHoliday: int = 0
    hour: int = 17
    historicalCrowd: float = 68.0
    weatherCondition: str = "Clear"


class WeatherRiskRequest(BaseModel):
    city: str = "Delhi"
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090
    activity: str = "Trekking"
    activitySensitivity: str = "HIGH"
    temperatureC: Optional[float] = None
    rainfallMm: Optional[float] = None
    humidityPct: Optional[float] = None
    windSpeedKmh: Optional[float] = None


class RouteAnalyzeRequest(BaseModel):
    originName: str = "India Gate"
    destName: str = "Red Fort (Lal Qila)"
    city: Optional[str] = "Delhi"
    originLat: Optional[float] = None
    originLon: Optional[float] = None
    destLat: Optional[float] = None
    destLon: Optional[float] = None
    weatherCondition: Optional[str] = "Clear"
    hour: Optional[int] = 14


class IncidentCreateRequest(BaseModel):
    locationName: str
    city: str
    state: Optional[str] = "Delhi"
    date: str
    time: str
    category: str
    description: str
    severity: str = "MEDIUM"
    imageUrl: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@router.post("/risk/predict")
def predict_comprehensive_risk(payload: RiskPredictRequest, db: Session = Depends(get_db)):
    coords = CITY_COORDINATES.get(payload.destination.strip().lower(), (28.6139, 77.2090))
    weather = fetch_weather_for_coordinates(coords[0], coords[1], city=payload.destination, travel_date=payload.date)

    temp = payload.temperatureC if payload.temperatureC is not None else weather["temperature_c"]
    rain = payload.rainfallMm if payload.rainfallMm is not None else weather["rainfall_mm"]
    cond = payload.weatherCondition if payload.weatherCondition else weather["condition"]

    res = compute_comprehensive_safety_risk(
        db=db,
        destination=payload.destination,
        place_name=payload.placeName,
        category=payload.category or "Historical",
        activity=payload.activity or "Sightseeing",
        travel_date=payload.date or "2026-10-15",
        visit_time=payload.time or "14:00",
        temperature_c=temp,
        rainfall_mm=rain,
        humidity_pct=payload.humidityPct or weather["humidity_pct"],
        wind_speed_kmh=payload.windSpeedKmh or weather["wind_speed_kmh"],
        weather_condition=cond,
        custom_weights=payload.customWeights,
    )
    res["weather_context"] = weather
    return res


@router.post("/crowd/predict")
def predict_crowd_endpoint(payload: CrowdPredictRequest, db: Session = Depends(get_db)):
    hist = payload.historicalCrowd
    if payload.placeName:
        p = db.query(TouristPlace).filter(TouristPlace.name.ilike(f"%{payload.placeName}%")).first()
        if p and p.crowd_score:
            hist = float(p.crowd_score)
    return predict_crowd_ml(
        day_of_week=payload.dayOfWeek,
        month=payload.month,
        is_holiday=payload.isHoliday,
        hour=payload.hour,
        historical_crowd=hist,
        weather_condition=payload.weatherCondition,
    )


@router.post("/weather/risk")
def predict_weather_activity_risk(payload: WeatherRiskRequest):
    coords = CITY_COORDINATES.get(payload.city.strip().lower(), (payload.latitude or 28.6139, payload.longitude or 77.2090))
    live_w = fetch_weather_for_coordinates(coords[0], coords[1], city=payload.city)

    temp = payload.temperatureC if payload.temperatureC is not None else live_w["temperature_c"]
    rain = payload.rainfallMm if payload.rainfallMm is not None else live_w["rainfall_mm"]
    hum = payload.humidityPct if payload.humidityPct is not None else live_w["humidity_pct"]
    wind = payload.windSpeedKmh if payload.windSpeedKmh is not None else live_w["wind_speed_kmh"]

    sens = payload.activitySensitivity
    act_l = payload.activity.lower()
    if any(k in act_l for k in ["trek", "waterfall", "safari", "beach", "outdoor", "camp"]):
        sens = "HIGH"
    elif any(k in act_l for k in ["museum", "gallery", "indoor", "mall"]):
        sens = "LOW"

    res = predict_weather_risk_ml(
        temperature=temp,
        rainfall=rain,
        humidity=hum,
        wind_speed=wind,
        activity_sensitivity=sens,
        month=live_w["month"],
    )
    res["weather_telemetry"] = {
        "city": payload.city,
        "temperature_c": temp,
        "rainfall_mm": rain,
        "humidity_pct": hum,
        "wind_speed_kmh": wind,
        "data_type": live_w["data_type"],
        "source_label": live_w["source_label"],
    }
    return res


@router.post("/route/analyze")
def analyze_route_endpoint(payload: RouteAnalyzeRequest, db: Session = Depends(get_db)):
    lat1, lon1 = payload.originLat, payload.originLon
    lat2, lon2 = payload.destLat, payload.destLon

    if lat1 is None or lon1 is None:
        p1 = db.query(TouristPlace).filter(TouristPlace.name.ilike(f"%{payload.originName}%")).first()
        if p1:
            lat1, lon1 = p1.latitude, p1.longitude
        else:
            lat1, lon1 = 28.6129, 77.2295

    if lat2 is None or lon2 is None:
        p2 = db.query(TouristPlace).filter(TouristPlace.name.ilike(f"%{payload.destName}%")).first()
        if p2:
            lat2, lon2 = p2.latitude, p2.longitude
        else:
            lat2, lon2 = 28.6562, 77.2410

    route_comparison = analyze_safe_vs_shortest_route(
        db=db,
        origin_name=payload.originName,
        dest_name=payload.destName,
        lat1=lat1,
        lon1=lon1,
        lat2=lat2,
        lon2=lon2,
        weather_condition=payload.weatherCondition or "Clear",
        hour=payload.hour or 14,
    )
    local_transit = calculate_local_transport_options(
        db=db,
        origin_name=payload.originName,
        dest_name=payload.destName,
        lat1=lat1,
        lon1=lon1,
        lat2=lat2,
        lon2=lon2,
        city=payload.city or "Delhi",
    )
    route_comparison["transport_modes"] = local_transit["options"]
    return route_comparison


@router.get("/transport")
def get_transport_options(
    origin: str = Query("India Gate"),
    destination: str = Query("Red Fort"),
    city: str = Query("Delhi"),
    start_city: Optional[str] = Query(None),
    travelers: int = Query(2),
    db: Session = Depends(get_db),
):
    p1 = db.query(TouristPlace).filter(TouristPlace.name.ilike(f"%{origin}%")).first()
    p2 = db.query(TouristPlace).filter(TouristPlace.name.ilike(f"%{destination}%")).first()
    lat1, lon1 = (p1.latitude, p1.longitude) if p1 else (28.6129, 77.2295)
    lat2, lon2 = (p2.latitude, p2.longitude) if p2 else (28.6562, 77.2410)

    local_opts = calculate_local_transport_options(
        db=db,
        origin_name=origin,
        dest_name=destination,
        lat1=lat1,
        lon1=lon1,
        lat2=lat2,
        lon2=lon2,
        city=city,
        origin_metro=p1.nearest_metro if p1 else None,
        dest_metro=p2.nearest_metro if p2 else None,
        origin_bus=p1.nearest_bus_stop if p1 else None,
        dest_bus=p2.nearest_bus_stop if p2 else None,
    )

    intercity_opts = calculate_intercity_transport(
        start_city=start_city or "Bangalore",
        destination_city=city,
        travelers=travelers,
    )

    metro_stations = db.query(MetroStation).filter(MetroStation.city.ilike(f"%{city}%")).all()
    bus_stops = db.query(BusStop).filter(BusStop.city.ilike(f"%{city}%")).all()

    return {
        "localTransport": local_opts,
        "intercityTransport": intercity_opts,
        "metroStations": [
            {
                "id": m.id,
                "city": m.city,
                "network": m.network_name,
                "stationName": m.station_name,
                "lineName": m.line_name,
                "lineColor": m.line_color,
                "latitude": m.latitude,
                "longitude": m.longitude,
                "isInterchange": m.is_interchange,
                "connectedLines": m.connected_lines,
                "nearbyAttractions": m.nearby_attractions,
            }
            for m in metro_stations
        ],
        "busStops": [
            {
                "id": b.id,
                "city": b.city,
                "stopName": b.stop_name,
                "operator": b.operator,
                "routesServed": b.routes_served,
                "latitude": b.latitude,
                "longitude": b.longitude,
                "nearbyPlace": b.nearby_place,
            }
            for b in bus_stops
        ],
    }


@router.post("/incidents")
def report_incident(
    payload: IncidentCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    coords = CITY_COORDINATES.get(payload.city.strip().lower(), (28.6139, 77.2090))
    lat = payload.latitude if payload.latitude is not None else coords[0]
    lon = payload.longitude if payload.longitude is not None else coords[1]

    inc = IncidentReport(
        user_id=current_user.id if current_user else None,
        location_name=payload.locationName.strip(),
        city=payload.city.strip(),
        state=payload.state or "India",
        date=payload.date,
        time=payload.time,
        category=payload.category,
        description=payload.description.strip(),
        severity=payload.severity.upper(),
        image_url=payload.imageUrl,
        latitude=lat,
        longitude=lon,
        status="APPROVED",
        source_type="USER_REPORT",
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)

    # Section 19: Do NOT expose sensitive reporter information publicly
    return {
        "message": "Incident report submitted and integrated into the AI Safety Risk Engine.",
        "incident": {
            "id": inc.id,
            "locationName": inc.location_name,
            "city": inc.city,
            "state": inc.state,
            "date": inc.date,
            "time": inc.time,
            "category": inc.category,
            "description": inc.description,
            "severity": inc.severity,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "status": inc.status,
            "reporterPrivacy": "Anonymized Verified Traveler",
        },
    }


@router.get("/incidents")
def list_incidents(city: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(IncidentReport).filter(IncidentReport.status == "APPROVED")
    if city and city.strip():
        q = q.filter(IncidentReport.city.ilike(f"%{city.strip()}%"))
    if category and category.strip() and category.lower() != "all":
        q = q.filter(IncidentReport.category.ilike(f"%{category.strip()}%"))

    rows = q.order_by(IncidentReport.created_at.desc()).limit(50).all()
    return {
        "total": len(rows),
        "incidents": [
            {
                "id": r.id,
                "locationName": r.location_name,
                "city": r.city,
                "state": r.state,
                "date": r.date,
                "time": r.time,
                "category": r.category,
                "description": r.description,
                "severity": r.severity,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "status": r.status,
                "reporterPrivacy": "Anonymized Verified Traveler",
            }
            for r in rows
        ],
    }
