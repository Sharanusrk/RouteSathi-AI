import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.entities import User, Itinerary, ItineraryDay, ItineraryPlace
from app.pdf.generator import generate_itinerary_pdf_bytes
from app.recommendation.engine import rank_tourist_places, generate_dynamic_day_wise_itinerary
from app.utils.security import get_optional_user

router = APIRouter(prefix="/api", tags=["AI Recommendations & Trip Planner"])


class RecommendationPreferences(BaseModel):
    crowdPreference: Optional[str] = "low"
    safetyPriority: Optional[str] = "high"
    travelMode: Optional[str] = "public"


class RecommendationRequest(BaseModel):
    startLocation: Optional[str] = "Bangalore"
    destination: Optional[str] = "Delhi"
    state: Optional[str] = None
    district: Optional[str] = None
    days: Optional[int] = 3
    budget: Optional[float] = 15000.0
    travelers: Optional[int] = 2
    date: Optional[str] = "2026-10-15"
    preferredStartTime: Optional[str] = "09:00"
    travelPreference: Optional[str] = "Couple & Historical"
    categories: Optional[List[str]] = ["Historical", "Couple", "Museum", "Food"]
    preferences: Optional[RecommendationPreferences] = None
    customWeights: Optional[Dict[str, float]] = None


class TripPlanRequest(BaseModel):
    startLocation: Optional[str] = "Bangalore"
    destination: str = "Delhi"
    days: int = 3
    budget: float = 15000.0
    travelers: int = 2
    date: Optional[str] = "2026-10-15"
    preferredStartTime: Optional[str] = "09:00"
    travelPreference: Optional[str] = "Historical & Couple"
    categories: Optional[List[str]] = ["Historical", "Museum", "Couple", "Food"]


@router.post("/recommendations")
def get_ai_recommendations(payload: RecommendationRequest, db: Session = Depends(get_db)):
    prefs = payload.preferences or RecommendationPreferences()
    res = rank_tourist_places(
        db=db,
        destination=payload.destination,
        state=payload.state,
        district=payload.district,
        start_location=payload.startLocation or "Bangalore",
        days=max(1, min(15, payload.days or 3)),
        budget=payload.budget or 15000.0,
        travelers=max(1, payload.travelers or 2),
        travel_date=payload.date or "2026-10-15",
        preferred_start_time=payload.preferredStartTime or "09:00",
        categories=payload.categories,
        travel_preference=payload.travelPreference or "Balanced",
        crowd_preference=prefs.crowdPreference or "low",
        safety_priority=prefs.safetyPriority or "high",
        custom_weights=payload.customWeights,
    )
    return res


@router.post("/trips/plan")
def create_trip_plan(
    payload: TripPlanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    days_clamped = max(1, min(14, payload.days))
    plan = generate_dynamic_day_wise_itinerary(
        db=db,
        destination=payload.destination,
        start_location=payload.startLocation or "Bangalore",
        days=days_clamped,
        budget=payload.budget,
        travelers=max(1, payload.travelers),
        travel_date=payload.date or "2026-10-15",
        preferred_start_time=payload.preferredStartTime or "09:00",
        categories=payload.categories,
        travel_preference=payload.travelPreference or "Historical & Couple",
    )

    # Persist Itinerary in Database
    itin = Itinerary(
        user_id=current_user.id if current_user else None,
        title=f"{days_clamped}-Day {plan['destination']} SafeTrip AI Plan",
        start_location=plan["start_location"],
        destination=plan["destination"],
        days=days_clamped,
        budget=payload.budget,
        travelers=payload.travelers,
        start_date=payload.date or "2026-10-15",
        preferred_start_time=payload.preferredStartTime or "09:00",
        travel_preference=payload.travelPreference or "Balanced",
        categories_json=json.dumps(payload.categories or []),
        budget_breakdown_json=json.dumps(plan["budget"]),
        risk_summary_json=json.dumps(plan["risk"]),
        transport_summary_json=json.dumps(plan["transport"]),
    )
    db.add(itin)
    db.flush()

    for d_obj in plan["days"]:
        day_row = ItineraryDay(
            itinerary_id=itin.id,
            day_number=d_obj["day"],
            theme_title=d_obj["theme"],
            daily_cost_estimate=d_obj["daily_estimated_cost_inr"],
            weather_summary=d_obj["weather_summary"],
        )
        db.add(day_row)
        db.flush()

        for p_obj in d_obj["places"]:
            place_row = ItineraryPlace(
                itinerary_day_id=day_row.id,
                place_id=p_obj.get("place_id"),
                place_name=p_obj["name"],
                visit_order=p_obj["visit_order"],
                activity_type=p_obj.get("category", "ATTRACTION"),
                start_time=p_obj["start_time"],
                end_time=p_obj["end_time"],
                duration_hrs=p_obj["estimated_visit_duration_hrs"],
                entry_fee_inr=p_obj["entry_fee_per_person_inr"],
                distance_from_prev_km=p_obj["distance_from_previous_km"],
                transport_mode=p_obj["travel_method"],
                travel_time_mins=p_obj["estimated_travel_time_mins"],
                travel_cost_inr=p_obj["estimated_travel_cost_inr"],
                metro_info=p_obj["metro_information"],
                bus_info=p_obj["bus_information"],
                cab_auto_estimate=p_obj["cab_auto_estimate"],
                crowd_level=p_obj["crowd_level"],
                weather_suitability=p_obj["weather_suitability"],
                safety_risk=p_obj["safety_risk"],
                route_risk=p_obj["route_risk"],
                recommendation_note=p_obj["recommendation"],
                short_history=p_obj["short_history"],
                latitude=p_obj["latitude"],
                longitude=p_obj["longitude"],
            )
            db.add(place_row)

    db.commit()
    db.refresh(itin)

    plan["tripId"] = itin.id
    return plan


@router.get("/trips")
def list_user_trips(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    q = db.query(Itinerary)
    if current_user:
        trips = q.filter((Itinerary.user_id == current_user.id) | (Itinerary.user_id.is_(None))).order_by(Itinerary.created_at.desc()).limit(20).all()
    else:
        trips = q.order_by(Itinerary.created_at.desc()).limit(10).all()

    out = []
    for t in trips:
        try:
            b_json = json.loads(t.budget_breakdown_json or "{}")
            r_json = json.loads(t.risk_summary_json or "{}")
            cats = json.loads(t.categories_json or "[]")
        except Exception:
            b_json, r_json, cats = {}, {}, []
        out.append({
            "tripId": t.id,
            "title": t.title,
            "startLocation": t.start_location,
            "destination": t.destination,
            "days": t.days,
            "budget": t.budget,
            "travelers": t.travelers,
            "startDate": t.start_date,
            "categories": cats,
            "estimatedCost": b_json.get("total_estimated_inr", t.budget),
            "overallRiskLevel": r_json.get("overall_risk_level", "LOW"),
            "overallRiskScore": r_json.get("overall_risk_score", 24.0),
            "createdAt": t.created_at.isoformat() if t.created_at else None,
        })
    return {"trips": out}


@router.get("/trips/{trip_id}")
def get_trip_by_id(trip_id: int, db: Session = Depends(get_db)):
    itin = db.query(Itinerary).filter(Itinerary.id == trip_id).first()
    if not itin:
        raise HTTPException(status_code=404, detail="Trip itinerary not found")

    days_out = []
    for d in itin.day_plans:
        places_out = []
        for p in d.scheduled_places:
            places_out.append({
                "place_id": p.place_id,
                "visit_order": p.visit_order,
                "name": p.place_name,
                "category": p.activity_type,
                "short_history": p.short_history,
                "opening_hours": "09:00 - 18:00",
                "recommended_visiting_time": f"{p.start_time} - {p.end_time}",
                "start_time": p.start_time,
                "end_time": p.end_time,
                "estimated_visit_duration_hrs": p.duration_hrs,
                "entry_fee_per_person_inr": p.entry_fee_inr,
                "distance_from_previous_km": p.distance_from_prev_km,
                "travel_method": p.transport_mode,
                "estimated_travel_time_mins": p.travel_time_mins,
                "estimated_travel_cost_inr": p.travel_cost_inr,
                "metro_information": p.metro_info,
                "bus_information": p.bus_info,
                "cab_auto_estimate": p.cab_auto_estimate,
                "crowd_level": p.crowd_level,
                "weather_suitability": p.weather_suitability,
                "safety_risk": p.safety_risk,
                "route_risk": p.route_risk,
                "recommendation": p.recommendation_note,
                "latitude": p.latitude,
                "longitude": p.longitude,
            })
        total_day_dist = round(sum(float(p.get("distance_from_previous_km", 0.0) or 0.0) for p in places_out), 1)
        total_day_trans_mins = sum(int(p.get("estimated_travel_time_mins", 0) or 0) for p in places_out)
        total_day_entry = round(sum(float(p.get("entry_fee_per_person_inr", 0.0) or 0.0) for p in places_out) * (itin.travelers or 1))
        total_day_transit_fare = round(sum(float(p.get("estimated_travel_cost_inr", 0.0) or 0.0) for p in places_out))
        day_avg_safety = 85.0

        # Ensure previous_location is populated
        for idx_p, p in enumerate(places_out):
            p["total_entry_fee_inr"] = round(float(p.get("entry_fee_per_person_inr", 0.0) or 0.0) * (itin.travelers or 1))
            if idx_p == 0:
                p["previous_location"] = f"{itin.destination} City Center Hotel"
            else:
                p["previous_location"] = places_out[idx_p - 1]["name"]

        days_out.append({
            "day": d.day_number,
            "theme": d.theme_title,
            "daily_estimated_cost_inr": d.daily_cost_estimate,
            "total_distance_km": total_day_dist,
            "total_travel_time_mins": total_day_trans_mins,
            "total_entry_cost_inr": total_day_entry,
            "total_transit_cost_inr": total_day_transit_fare,
            "day_safety_score": day_avg_safety,
            "weather_summary": d.weather_summary,
            "places": places_out,
        })

    return {
        "tripId": itin.id,
        "title": itin.title,
        "start_location": itin.start_location,
        "destination": itin.destination,
        "days_count": itin.days,
        "travelers": itin.travelers,
        "travel_date": itin.start_date,
        "days": days_out,
        "budget": json.loads(itin.budget_breakdown_json or "{}"),
        "risk": json.loads(itin.risk_summary_json or "{}"),
        "transport": json.loads(itin.transport_summary_json or "{}"),
    }


@router.post("/itinerary/{trip_id}/export-pdf")
def export_saved_itinerary_pdf(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    trip_data = get_trip_by_id(trip_id, db)
    traveler_name = current_user.full_name if current_user else "SafeTrip AI Explorer"
    pdf_bytes = generate_itinerary_pdf_bytes(trip_data, traveler_name=traveler_name)
    filename = f"SafeTrip_AI_{trip_data['destination']}_{trip_data['days_count']}Days_Itinerary.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/itinerary/export-pdf-direct")
def export_direct_itinerary_pdf(
    itinerary_data: Dict[str, Any],
    current_user: Optional[User] = Depends(get_optional_user),
):
    traveler_name = current_user.full_name if current_user else "SafeTrip AI Explorer"
    pdf_bytes = generate_itinerary_pdf_bytes(itinerary_data, traveler_name=traveler_name)
    dest = itinerary_data.get("destination", "India")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="SafeTrip_AI_{dest}_Itinerary.pdf"'},
    )
