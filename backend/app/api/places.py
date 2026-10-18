import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.config import TOURISM_CATEGORIES
from app.database.db import get_db
from app.models.entities import State, District, TouristPlace, Hotel, Restaurant, MetroStation, BusStop
from app.routing.engine import calculate_local_transport_options
from app.safety.engine import compute_comprehensive_safety_risk
from app.weather.service import fetch_weather_for_coordinates

router = APIRouter(prefix="/api", tags=["States, Districts & Tourist Places"])


def serialize_place(p: TouristPlace) -> dict:
    return {
        "id": p.id,
        "state_id": p.state_id,
        "district_id": p.district_id,
        "name": p.name,
        "state": p.state,
        "district": p.district,
        "city": p.city,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "coordinates": {"latitude": p.latitude, "longitude": p.longitude},
        "category": p.category,
        "subCategory": [c.strip() for c in (p.sub_category or p.category).split(",") if c.strip()],
        "description": p.description,
        "history": p.history,
        "bestTime": p.best_time,
        "bestSeason": p.best_season,
        "openingTime": p.opening_time,
        "closingTime": p.closing_time,
        "weeklyOff": p.weekly_off,
        "averageVisitDuration": p.average_visit_duration,
        "entryFee": p.entry_fee,
        "rating": p.rating,
        "popularity": p.popularity,
        "crowdScore": p.crowd_score,
        "crowdLevel": "Low" if (p.crowd_score or 50) < 45 else ("Moderate" if (p.crowd_score or 50) < 72 else "High"),
        "safetyScore": p.safety_score,
        "safetyLevel": "LOW" if (p.safety_score or 80) >= 78 else ("MEDIUM" if (p.safety_score or 80) >= 55 else "HIGH"),
        "weatherSensitivity": p.weather_sensitivity,
        "activities": [a.strip() for a in (p.activities or "").split(",") if a.strip()],
        "familyFriendly": p.family_friendly,
        "coupleFriendly": p.couple_friendly,
        "soloFriendly": p.solo_friendly,
        "seniorFriendly": p.senior_friendly,
        "nearestMetro": p.nearest_metro,
        "nearestBusStop": p.nearest_bus_stop,
        "nearestAirport": p.nearest_airport,
        "nearestRailway": p.nearest_railway,
        "dailyBudgetLow": p.daily_budget_low,
        "dailyBudgetMid": p.daily_budget_mid,
        "dailyBudgetLuxury": p.daily_budget_luxury,
        "localFoodRecommendations": p.local_food_recommendations,
        "safetyNotes": p.safety_notes,
        "imageUrl": p.image_url,
        "dataSource": p.data_source,
    }


@router.get("/categories")
def list_categories():
    return {"categories": TOURISM_CATEGORIES}


@router.get("/states")
def list_states(db: Session = Depends(get_db)):
    states = db.query(State).order_by(State.name.asc()).all()
    place_counts = dict(
        db.query(TouristPlace.state_id, func.count(TouristPlace.id)).group_by(TouristPlace.state_id).all()
    )
    district_counts = dict(
        db.query(District.state_id, func.count(District.id)).group_by(District.state_id).all()
    )
    return {
        "total": len(states),
        "states": [
            {
                "id": s.id,
                "name": s.name,
                "code": s.code,
                "region": s.region,
                "capital": s.capital,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "description": s.description,
                "bestSeason": s.best_season,
                "avgSafetyScore": s.avg_safety_score,
                "districtsCount": district_counts.get(s.id, 0),
                "placesCount": place_counts.get(s.id, 0),
            }
            for s in states
        ],
    }


@router.get("/cities")
def list_all_indian_cities(state: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(
        TouristPlace.city,
        TouristPlace.district,
        TouristPlace.state,
        func.avg(TouristPlace.latitude).label("lat"),
        func.avg(TouristPlace.longitude).label("lon"),
        func.avg(TouristPlace.safety_score).label("safety"),
        func.count(TouristPlace.id).label("places_count"),
    ).filter(TouristPlace.city.isnot(None))

    if state and state.strip():
        query = query.filter(TouristPlace.state.ilike(f"%{state.strip()}%"))

    rows = (
        query.group_by(TouristPlace.city, TouristPlace.district, TouristPlace.state)
        .order_by(TouristPlace.city.asc())
        .all()
    )

    seen = {}
    for r in rows:
        c_name = (r.city or "").strip()
        if not c_name:
            continue
        key = c_name.lower()
        if key not in seen:
            seen[key] = {
                "city": c_name,
                "district": r.district,
                "state": r.state,
                "latitude": round(float(r.lat or 20.5937), 4),
                "longitude": round(float(r.lon or 78.9629), 4),
                "safetyScore": round(float(r.safety or 85.0), 1),
                "placesCount": int(r.places_count or 1),
            }
        else:
            seen[key]["placesCount"] += int(r.places_count or 1)

    cities_list = sorted(seen.values(), key=lambda x: x["city"].lower())
    return {
        "total": len(cities_list),
        "cities": cities_list,
    }


@router.get("/states/{state_id}/districts")

def list_state_districts(state_id: int, db: Session = Depends(get_db)):
    st = db.query(State).filter(State.id == state_id).first()
    if not st:
        raise HTTPException(status_code=404, detail="State not found")
    districts = db.query(District).filter(District.state_id == state_id).order_by(District.name.asc()).all()
    place_counts = dict(
        db.query(TouristPlace.district_id, func.count(TouristPlace.id))
        .filter(TouristPlace.state_id == state_id)
        .group_by(TouristPlace.district_id)
        .all()
    )
    all_state_places = db.query(TouristPlace).filter(TouristPlace.state_id == state_id).all()
    return {
        "state": {
            "id": st.id,
            "name": st.name,
            "code": st.code,
            "region": st.region,
            "capital": st.capital,
            "description": st.description,
            "latitude": st.latitude,
            "longitude": st.longitude,
        },
        "districts": [
            {
                "id": d.id,
                "name": d.name,
                "state_id": d.state_id,
                "latitude": d.latitude,
                "longitude": d.longitude,
                "crimeIndex": d.crime_index,
                "safetyTier": d.safety_tier,
                "placesCount": place_counts.get(d.id, 0),
            }
            for d in districts
        ],
        "places": [serialize_place(p) for p in all_state_places],
    }


@router.get("/districts/{district_id}/places")
def list_district_places(district_id: int, db: Session = Depends(get_db)):
    dist = db.query(District).filter(District.id == district_id).first()
    if not dist:
        raise HTTPException(status_code=404, detail="District not found")
    places = db.query(TouristPlace).filter(TouristPlace.district_id == district_id).all()
    hotels = db.query(Hotel).filter(Hotel.district_id == district_id).all()
    restaurants = db.query(Restaurant).filter(Restaurant.district_id == district_id).all()
    return {
        "district": {
            "id": dist.id,
            "name": dist.name,
            "state_id": dist.state_id,
            "latitude": dist.latitude,
            "longitude": dist.longitude,
            "crimeIndex": dist.crime_index,
            "safetyTier": dist.safety_tier,
        },
        "places": [serialize_place(p) for p in places],
        "hotels": [
            {"id": h.id, "name": h.name, "city": h.city, "tier": h.tier, "pricePerNight": h.price_per_night, "rating": h.rating, "safetyScore": h.safety_score}
            for h in hotels
        ],
        "restaurants": [
            {"id": r.id, "name": r.name, "city": r.city, "cuisine": r.cuisine, "signatureDish": r.signature_dish, "avgCostForTwo": r.avg_cost_for_two, "rating": r.rating}
            for r in restaurants
        ],
    }


def _parse_natural_language_search(q: str):
    """
    Section 7: Parses queries like:
    - 'Historical places in Delhi'
    - 'Temples in Tamil Nadu'
    - 'Couple places in Bangalore'
    - 'Museums in Mumbai'
    - 'Waterfalls in Kerala'
    - 'Historical places in Mysore'
    """
    q_clean = q.strip()
    m = re.match(r"^([a-zA-Z\s&]+?)\s+(?:places\s+in|in|near|at)\s+([a-zA-Z\s]+)$", q_clean, re.IGNORECASE)
    if m:
        raw_cat = m.group(1).strip().lower()
        raw_loc = m.group(2).strip()
        # Singularize common plurals
        cat_aliases = {
            "temples": "Temple",
            "temple": "Temple",
            "historical": "Historical",
            "historical places": "Historical",
            "museums": "Museum",
            "museum": "Museum",
            "waterfalls": "Waterfall",
            "waterfall": "Waterfall",
            "beaches": "Beach",
            "beach": "Beach",
            "forts": "Fort",
            "fort": "Fort",
            "palaces": "Palace",
            "palace": "Palace",
            "couple": "Couple",
            "couples": "Couple",
            "family": "Family",
            "wildlife": "Wildlife",
            "hill stations": "Hill Station",
            "spiritual": "Spiritual",
            "food": "Food",
            "shopping": "Shopping",
            "nature": "Nature",
            "adventure": "Adventure",
        }
        mapped_cat = cat_aliases.get(raw_cat, raw_cat.title())
        return mapped_cat, raw_loc
    return None, q_clean


@router.get("/places/autocomplete")
def autocomplete_places(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
    term = q.strip()
    if not term:
        return {"suggestions": []}

    suggestions = []
    # Match States
    states = db.query(State).filter(State.name.ilike(f"%{term}%")).limit(4).all()
    for s in states:
        suggestions.append({"type": "State", "label": s.name, "value": s.name, "sublabel": s.region})

    # Match Places / Cities
    places = (
        db.query(TouristPlace)
        .filter(
            (TouristPlace.name.ilike(f"%{term}%"))
            | (TouristPlace.city.ilike(f"%{term}%"))
            | (TouristPlace.district.ilike(f"%{term}%"))
        )
        .limit(8)
        .all()
    )
    seen_cities = set()
    for p in places:
        if p.city.lower() not in seen_cities and term.lower() in p.city.lower():
            seen_cities.add(p.city.lower())
            suggestions.append({"type": "City", "label": p.city, "value": p.city, "sublabel": p.state})
        suggestions.append({
            "type": "Place",
            "id": p.id,
            "label": p.name,
            "value": p.name,
            "sublabel": f"{p.city}, {p.state} • {p.category}",
        })

    # Natural language template suggestions
    if len(term) >= 3:
        suggestions.append({
            "type": "SmartQuery",
            "label": f"Historical places in {term.title()}",
            "value": f"Historical places in {term.title()}",
            "sublabel": "AI Smart Search",
        })

    return {"suggestions": suggestions[:12]}


@router.get("/places")
def search_places(
    q: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    max_entry_fee: Optional[float] = None,
    min_rating: Optional[float] = None,
    min_safety: Optional[float] = None,
    crowd: Optional[str] = None,
    weather_suitability: Optional[str] = None,
    limit: int = 600,
    db: Session = Depends(get_db),
):

    query = db.query(TouristPlace)

    if q and q.strip():
        nl_cat, nl_loc = _parse_natural_language_search(q)
        if nl_cat and nl_loc:
            query = query.filter(
                (TouristPlace.category.ilike(f"%{nl_cat}%"))
                | (TouristPlace.sub_category.ilike(f"%{nl_cat}%"))
                | (TouristPlace.activities.ilike(f"%{nl_cat}%")),
                (TouristPlace.city.ilike(f"%{nl_loc}%"))
                | (TouristPlace.state.ilike(f"%{nl_loc}%"))
                | (TouristPlace.district.ilike(f"%{nl_loc}%"))
                | (TouristPlace.name.ilike(f"%{nl_loc}%")),
            )
        else:
            term = q.strip()
            query = query.filter(
                (TouristPlace.name.ilike(f"%{term}%"))
                | (TouristPlace.city.ilike(f"%{term}%"))
                | (TouristPlace.state.ilike(f"%{term}%"))
                | (TouristPlace.district.ilike(f"%{term}%"))
                | (TouristPlace.category.ilike(f"%{term}%"))
                | (TouristPlace.sub_category.ilike(f"%{term}%"))
            )

    if state and state.strip():
        query = query.filter(TouristPlace.state.ilike(f"%{state.strip()}%"))
    if district and district.strip():
        query = query.filter(TouristPlace.district.ilike(f"%{district.strip()}%"))
    if city and city.strip():
        query = query.filter(TouristPlace.city.ilike(f"%{city.strip()}%"))
    if category and category.strip() and category.lower() != "all":
        cat_term = category.strip()
        query = query.filter(
            (TouristPlace.category.ilike(f"%{cat_term}%"))
            | (TouristPlace.sub_category.ilike(f"%{cat_term}%"))
        )
    if max_entry_fee is not None:
        query = query.filter(TouristPlace.entry_fee <= max_entry_fee)
    if min_rating is not None:
        query = query.filter(TouristPlace.rating >= min_rating)
    if min_safety is not None:
        query = query.filter(TouristPlace.safety_score >= min_safety)
    if crowd and crowd.lower() != "all":
        if crowd.lower() == "low":
            query = query.filter(TouristPlace.crowd_score < 50)
        elif crowd.lower() == "moderate":
            query = query.filter(TouristPlace.crowd_score.between(45, 72))
        elif crowd.lower() == "high":
            query = query.filter(TouristPlace.crowd_score > 70)
    if weather_suitability and weather_suitability.lower() == "indoor":
        query = query.filter(TouristPlace.weather_sensitivity == "LOW")

    results = query.order_by(TouristPlace.popularity.desc(), TouristPlace.rating.desc()).limit(limit).all()
    return {
        "total": len(results),
        "places": [serialize_place(p) for p in results],
    }


@router.get("/places/{place_id}")
def get_place_details(place_id: int, db: Session = Depends(get_db)):
    p = db.query(TouristPlace).filter(TouristPlace.id == place_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Tourist place not found")

    weather = fetch_weather_for_coordinates(p.latitude, p.longitude, city=p.city)
    safety = compute_comprehensive_safety_risk(
        db=db,
        destination=p.city,
        place_name=p.name,
        category=p.category,
        activity=p.category,
        temperature_c=weather["temperature_c"],
        rainfall_mm=weather["rainfall_mm"],
        humidity_pct=weather["humidity_pct"],
        wind_speed_kmh=weather["wind_speed_kmh"],
        weather_condition=weather["condition"],
    )
    local_transit = calculate_local_transport_options(
        db=db,
        origin_name=f"{p.city} City Center / Railway Hub",
        dest_name=p.name,
        lat1=p.latitude - 0.02,
        lon1=p.longitude - 0.02,
        lat2=p.latitude,
        lon2=p.longitude,
        city=p.city,
        dest_metro=p.nearest_metro,
        dest_bus=p.nearest_bus_stop,
    )
    nearby = (
        db.query(TouristPlace)
        .filter(TouristPlace.state == p.state, TouristPlace.id != p.id)
        .limit(4)
        .all()
    )

    data = serialize_place(p)
    data["weather"] = weather
    data["safetyAnalysis"] = safety
    data["transportFromCenter"] = local_transit
    data["nearbyPlaces"] = [serialize_place(np) for np in nearby]
    return data
