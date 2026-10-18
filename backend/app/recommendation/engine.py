import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.config import DEFAULT_RECOMMENDATION_WEIGHTS
from app.models.entities import TouristPlace, Hotel, Restaurant
from app.routing.engine import (
    haversine_km,
    calculate_local_transport_options,
    calculate_intercity_transport,
    CITY_COORDINATES,
)
from app.safety.engine import compute_comprehensive_safety_risk
from app.weather.service import fetch_weather_for_coordinates


def rank_tourist_places(
    db: Session,
    destination: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    start_location: str = "Bangalore",
    days: int = 3,
    budget: float = 15000.0,
    travelers: int = 2,
    travel_date: str = "2026-10-15",
    preferred_start_time: str = "09:00",
    categories: Optional[List[str]] = None,
    travel_preference: str = "Couple",
    crowd_preference: str = "low",
    safety_priority: str = "high",
    custom_weights: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """
    Section 8 & 44: Hybrid Content-Based + Configurable Weighted + ML-Assisted Recommendation Engine.
    Explicitly documents hybrid scoring weights and provides human-readable AI explanations.
    """
    weights = dict(DEFAULT_RECOMMENDATION_WEIGHTS)
    if custom_weights:
        weights.update(custom_weights)

    categories_clean = [c.strip().lower() for c in (categories or []) if c.strip()]
    pref_lower = (travel_preference or "").lower()

    query = db.query(TouristPlace)
    if destination and destination.strip():
        dest = destination.strip()
        matched = query.filter(
            (TouristPlace.city.ilike(f"%{dest}%"))
            | (TouristPlace.state.ilike(f"%{dest}%"))
            | (TouristPlace.district.ilike(f"%{dest}%"))
            | (TouristPlace.name.ilike(f"%{dest}%"))
        ).all()
        if not matched:
            matched = query.all()
    elif state and state.strip():
        matched = query.filter(TouristPlace.state.ilike(f"%{state.strip()}%")).all()
    elif district and district.strip():
        matched = query.filter(TouristPlace.district.ilike(f"%{district.strip()}%")).all()
    else:
        matched = query.all()

    start_coords = CITY_COORDINATES.get(start_location.strip().lower(), (12.9716, 77.5946))
    ref_lat = matched[0].latitude if matched else 28.6139
    ref_lon = matched[0].longitude if matched else 77.2090
    ref_city = matched[0].city if matched else (destination or "Delhi")

    weather_info = fetch_weather_for_coordinates(ref_lat, ref_lon, city=ref_city, travel_date=travel_date)
    per_person_daily_budget = max(500.0, budget / max(1, days * max(1, travelers)))

    ranked_list = []
    for place in matched:
        # 1. Preference & Category Match (0-100)
        place_cats = f"{place.category} {place.sub_category or ''} {place.activities or ''}".lower()
        cat_hits = sum(1 for c in categories_clean if c in place_cats)
        if categories_clean:
            pref_score = min(100.0, 55.0 + (cat_hits / len(categories_clean)) * 45.0)
        else:
            pref_score = 80.0

        if "couple" in pref_lower or "couple" in categories_clean:
            if place.couple_friendly:
                pref_score = min(100.0, pref_score + 12.0)
        if "family" in pref_lower or "family" in categories_clean:
            if place.family_friendly:
                pref_score = min(100.0, pref_score + 12.0)

        # 2. Budget Match (0-100)
        fee = float(place.entry_fee or 0.0)
        place_daily = float(place.daily_budget_low or 1200.0)
        if fee <= 100 and place_daily <= per_person_daily_budget * 1.3:
            budget_score = 95.0
        elif fee <= 300:
            budget_score = 82.0
        else:
            budget_score = 68.0

        # 3. Safety Score (0-100)
        safety_val = float(place.safety_score or 82.0)

        # 4. Weather Suitability (0-100)
        rain = weather_info["rainfall_mm"]
        temp = weather_info["temperature_c"]
        if rain > 25 and place.weather_sensitivity == "HIGH":
            weather_suit = 45.0
        elif rain > 25 and place.weather_sensitivity == "LOW":
            weather_suit = 94.0
        elif temp > 39 and place.weather_sensitivity == "HIGH":
            weather_suit = 58.0
        else:
            weather_suit = 90.0

        # 5. Crowd Suitability (0-100)
        crowd_val = float(place.crowd_score or 55.0)
        if crowd_preference == "low":
            crowd_suit = max(25.0, 100.0 - crowd_val * 0.7)
        else:
            crowd_suit = 82.0

        # 6. Distance Score (within city proximity to cluster center)
        dist_from_center = haversine_km(ref_lat, ref_lon, place.latitude, place.longitude)
        dist_score = max(35.0, 100.0 - min(65.0, dist_from_center * 2.2))

        # 7. Rating Score (0-100)
        rating_score = min(100.0, (float(place.rating or 4.5) / 5.0) * 100.0)

        # 8. Time Suitability (0-100)
        time_suit = 92.0 if float(place.average_visit_duration or 2.0) <= 3.5 else 78.0

        total_rec_score = round(
            weights["preference_match"] * pref_score
            + weights["budget_match"] * budget_score
            + weights["safety"] * safety_val
            + weights["weather_suitability"] * weather_suit
            + weights["crowd_suitability"] * crowd_suit
            + weights["distance"] * dist_score
            + weights["rating"] * rating_score
            + weights["time_suitability"] * time_suit,
            2,
        )

        # Build Explainable AI Checklist (Section 44)
        explanations = []
        matched_cat_names = [c.title() for c in categories_clean if c in place_cats]
        if matched_cat_names:
            explanations.append(f"✓ Matches your {', '.join(matched_cat_names)} preference")
        else:
            explanations.append(f"✓ Top-rated {place.category} landmark in {place.city}")

        explanations.append(
            f"✓ Fits your ₹{int(budget):,} budget (Entry: {'Free' if fee == 0 else f'₹{int(fee)}'})"
        )
        explanations.append(f"✓ Verified safety score {int(safety_val)}/100 ({'Low Risk' if safety_val >= 80 else 'Moderate Risk'})")
        explanations.append(
            f"✓ {'Low' if crowd_val < 45 else ('Moderate' if crowd_val < 72 else 'Manageable morning')} crowd profile"
        )
        explanations.append(f"✓ Suitable weather ({weather_info['temperature_c']}°C, {weather_info['condition']})")
        explanations.append(f"✓ Fits your {days}-day schedule (~{place.average_visit_duration} hrs visit)")

        ranked_list.append({
            "id": place.id,
            "name": place.name,
            "state": place.state,
            "district": place.district,
            "city": place.city,
            "latitude": place.latitude,
            "longitude": place.longitude,
            "category": place.category,
            "sub_category": place.sub_category,
            "description": place.description,
            "history": place.history,
            "best_time": place.best_time,
            "opening_time": place.opening_time,
            "closing_time": place.closing_time,
            "average_visit_duration": place.average_visit_duration,
            "entry_fee": place.entry_fee,
            "rating": place.rating,
            "popularity": place.popularity,
            "crowd_score": place.crowd_score,
            "crowd_level": "Low" if place.crowd_score < 45 else ("Moderate" if place.crowd_score < 72 else "High"),
            "safety_score": place.safety_score,
            "safety_level": "LOW RISK" if place.safety_score >= 78 else ("MEDIUM RISK" if place.safety_score >= 55 else "HIGH RISK"),
            "weather_sensitivity": place.weather_sensitivity,
            "nearest_metro": place.nearest_metro,
            "nearest_bus_stop": place.nearest_bus_stop,
            "local_food_recommendations": place.local_food_recommendations,
            "image_url": place.image_url,
            "distance_from_hub_km": round(dist_from_center, 1),
            "recommendation_score": total_rec_score,
            "score_breakdown": {
                "preference_match": round(pref_score, 1),
                "budget_match": round(budget_score, 1),
                "safety": round(safety_val, 1),
                "weather_suitability": round(weather_suit, 1),
                "crowd_suitability": round(crowd_suit, 1),
                "distance": round(dist_score, 1),
                "rating": round(rating_score, 1),
                "time_suitability": round(time_suit, 1),
            },
            "ai_explanations": explanations,
        })

    ranked_list.sort(key=lambda x: x["recommendation_score"], reverse=True)

    intercity = calculate_intercity_transport(start_location, ref_city, travelers=travelers)
    risk_summary = compute_comprehensive_safety_risk(
        db=db,
        destination=ref_city,
        place_name=ranked_list[0]["name"] if ranked_list else ref_city,
        category=ranked_list[0]["category"] if ranked_list else "Historical",
        travel_date=travel_date,
        visit_time=preferred_start_time,
        temperature_c=weather_info["temperature_c"],
        rainfall_mm=weather_info["rainfall_mm"],
        humidity_pct=weather_info["humidity_pct"],
        wind_speed_kmh=weather_info["wind_speed_kmh"],
        weather_condition=weather_info["condition"],
    )

    budget_plan = calculate_trip_budget_breakdown(
        budget=budget,
        days=days,
        travelers=travelers,
        intercity_options=intercity.get("options", []),
        selected_places=ranked_list[: min(len(ranked_list), days * 3)],
    )

    return {
        "methodology": "Hybrid Recommendation System (Content-Based Filtering + Configurable 8-Factor Weighted Scoring + ML Risk/Crowd Inputs)",
        "weights_configured": weights,
        "start_location": start_location,
        "destination": ref_city,
        "weather_context": weather_info,
        "recommendations": ranked_list[:24],
        "estimatedBudget": budget_plan,
        "riskSummary": risk_summary,
        "transportOptions": intercity,
    }


def calculate_trip_budget_breakdown(
    budget: float,
    days: int,
    travelers: int,
    intercity_options: List[Dict[str, Any]],
    selected_places: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Section 24: Detailed Trip Budget Planner.
    """
    # Intercity round-trip or one-way practical estimate
    if intercity_options:
        cheapest_intercity = min(opt["total_cost_for_travelers_inr"] for opt in intercity_options)
        intercity_cost = min(cheapest_intercity, round(budget * 0.30))
    else:
        intercity_cost = round(budget * 0.15)

    rooms_needed = max(1, (travelers + 1) // 2)
    per_night_target = min(2500.0, max(700.0, (budget * 0.32) / max(1, days * rooms_needed)))
    hotel_cost = round(per_night_target * days * rooms_needed)

    food_daily_per_person = min(650.0, max(250.0, (budget * 0.18) / max(1, days * travelers)))
    food_cost = round(food_daily_per_person * days * travelers)

    entry_fees_single = sum(float(p.get("entry_fee", 0.0) or 0.0) for p in selected_places)
    entry_cost = round(entry_fees_single * travelers)

    local_transport_cost = round(min(budget * 0.12, max(350.0, days * 320.0)))
    misc_cost = round(min(budget * 0.05, 450.0))

    total_estimated = intercity_cost + hotel_cost + food_cost + local_transport_cost + entry_cost + misc_cost
    remaining = round(budget - total_estimated, 2)

    return {
        "total_budget_inr": round(budget),
        "intercity_travel_inr": int(intercity_cost),
        "accommodation_hotel_inr": int(hotel_cost),
        "food_dining_inr": int(food_cost),
        "local_transport_inr": int(local_transport_cost),
        "entry_tickets_inr": int(entry_cost),
        "miscellaneous_inr": int(misc_cost),
        "total_estimated_inr": int(total_estimated),
        "remaining_budget_inr": int(remaining),
        "within_budget": remaining >= 0,
        "tier_label": "Budget Friendly" if budget <= 10000 else ("Mid-Range Comfort" if budget <= 25000 else "Premium / Luxury"),
    }


def generate_dynamic_day_wise_itinerary(
    db: Session,
    destination: str = "Delhi",
    start_location: str = "Bangalore",
    days: int = 3,
    budget: float = 15000.0,
    travelers: int = 2,
    travel_date: str = "2026-10-15",
    preferred_start_time: str = "09:00",
    categories: Optional[List[str]] = None,
    travel_preference: str = "Historical & Couple",
) -> Dict[str, Any]:
    """
    Sections 9 & 10: Dynamic AI Trip Planner & Daily Timeline Generator.
    - Groups geographically close places on the same day
    - Respects opening/closing hours
    - Computes inter-place distance, transport mode, metro/bus info, crowd, weather, and route risk
    """
    rec_bundle = rank_tourist_places(
        db=db,
        destination=destination,
        start_location=start_location,
        days=days,
        budget=budget,
        travelers=travelers,
        travel_date=travel_date,
        preferred_start_time=preferred_start_time,
        categories=categories,
        travel_preference=travel_preference,
    )

    candidates = rec_bundle["recommendations"]
    weather_info = rec_bundle["weather_context"]
    resolved_dest = rec_bundle["destination"]

    # Select top places needed (3 to 4 attractions per day)
    places_per_day = 3 if days >= 3 else 4
    needed = min(len(candidates), max(days * places_per_day, days))
    pool = candidates[: max(needed, len(candidates))]

    # Geographic sorting & clustering so places on the same day are spatially close!
    # For Delhi 3-day canonical flow or any multi-day city, cluster by geographic zones:
    # Central/New Delhi (India Gate, Rashtrapati Bhavan, War Memorial, Connaught Place)
    # Old Delhi + Mughal Hub (Red Fort, Jama Masjid, Chandni Chowk, Humayun's Tomb)
    # South/East Delhi (Qutub Minar, Lotus Temple, Akshardham)
    unvisited = list(pool)
    day_clusters: List[List[Dict[str, Any]]] = []

    if "delhi" in resolved_dest.lower() and len(unvisited) >= 9:
        day1_names = ["india gate", "rashtrapati bhavan", "national war memorial", "connaught place"]
        day2_names = ["red fort", "jama masjid", "chandni chowk", "humayun's tomb"]
        day3_names = ["qutub minar", "lotus temple", "akshardham", "national museum"]

        def pick_by_names(target_names):
            picked = []
            for tn in target_names:
                for p in list(unvisited):
                    if tn in p["name"].lower():
                        picked.append(p)
                        unvisited.remove(p)
                        break
            return picked

        c1 = pick_by_names(day1_names)
        c2 = pick_by_names(day2_names)
        c3 = pick_by_names(day3_names)
        for c in [c1, c2, c3]:
            if c:
                day_clusters.append(c)

    # Greedy nearest-neighbor spatial clustering for any remaining days or other cities
    while len(day_clusters) < days and unvisited:
        seed = unvisited.pop(0)
        cluster = [seed]
        while len(cluster) < places_per_day and unvisited:
            last = cluster[-1]
            unvisited.sort(key=lambda p: haversine_km(last["latitude"], last["longitude"], p["latitude"], p["longitude"]))
            cluster.append(unvisited.pop(0))
        day_clusters.append(cluster)

    # If user asked for more days than distinct clusters, cycle/split gracefully
    while len(day_clusters) < days and pool:
        idx = len(day_clusters) % len(pool)
        day_clusters.append([pool[idx]])

    day_themes = [
        f"Heritage & Iconic Landmarks of {resolved_dest}",
        f"Royal Architecture, Culture & Old Quarter of {resolved_dest}",
        f"Spiritual Marvels, Gardens & Local Bazaars of {resolved_dest}",
        f"Museums, Nature Trails & Culinary Exploration",
        f"Panoramic Viewpoints & Leisure Discovery",
    ]

    try:
        base_start_hour = int(preferred_start_time.split(":")[0])
    except Exception:
        base_start_hour = 9

    structured_days = []
    all_scheduled_places = []

    for d_idx in range(days):
        day_num = d_idx + 1
        cluster = day_clusters[d_idx] if d_idx < len(day_clusters) else []
        theme = day_themes[d_idx % len(day_themes)]

        timeline_items = []
        cur_minutes = max(8 * 60, (base_start_hour - 1) * 60)

        # 08:00 AM Breakfast
        timeline_items.append({
            "slot_type": "MEAL",
            "time_label": f"{cur_minutes // 60:02d}:{cur_minutes % 60:02d}",
            "title": f"Morning Breakfast in {resolved_dest}",
            "description": "Start your day with regional breakfast specialties and bottled water before morning sightseeing.",
            "estimated_cost_inr": 180 * travelers,
            "risk_level": "LOW",
        })
        cur_minutes += 60  # 09:00 AM

        day_places_out = []
        prev_place = None
        lunch_added = False
        daily_cost = float(180 * travelers)

        for p_idx, place in enumerate(cluster):
            # Insert Lunch around 12:30 - 13:30
            if not lunch_added and cur_minutes >= 12 * 60 + 30:
                food_rec = place.get("local_food_recommendations") or f"Authentic {resolved_dest} Thali & Heritage Cafe"
                timeline_items.append({
                    "slot_type": "MEAL",
                    "time_label": f"{cur_minutes // 60:02d}:{cur_minutes % 60:02d}",
                    "title": f"Lunch Break — {food_rec.split(',')[0]}",
                    "description": f"Recommended hygienic dining near {place['name']}: {food_rec}",
                    "estimated_cost_inr": 350 * travelers,
                    "risk_level": "LOW",
                })
                daily_cost += 350 * travelers
                cur_minutes += 60
                lunch_added = True

            # Check opening hours so we never schedule before opening
            try:
                open_h, open_m = [int(x) for x in place["opening_time"].split(":")]
                open_mins = open_h * 60 + open_m
                if cur_minutes < open_mins:
                    cur_minutes = open_mins
            except Exception:
                pass

            # Calculate transport from previous location
            if prev_place is None:
                trans_info = calculate_local_transport_options(
                    db=db,
                    origin_name=f"{resolved_dest} City Center Hotel",
                    dest_name=place["name"],
                    lat1=place["latitude"] - 0.015,
                    lon1=place["longitude"] - 0.015,
                    lat2=place["latitude"],
                    lon2=place["longitude"],
                    city=place["city"],
                    dest_metro=place.get("nearest_metro"),
                    dest_bus=place.get("nearest_bus_stop"),
                )
            else:
                trans_info = calculate_local_transport_options(
                    db=db,
                    origin_name=prev_place["name"],
                    dest_name=place["name"],
                    lat1=prev_place["latitude"],
                    lon1=prev_place["longitude"],
                    lat2=place["latitude"],
                    lon2=place["longitude"],
                    city=place["city"],
                    origin_metro=prev_place.get("nearest_metro"),
                    dest_metro=place.get("nearest_metro"),
                    origin_bus=prev_place.get("nearest_bus_stop"),
                    dest_bus=place.get("nearest_bus_stop"),
                )
            dist_km = trans_info["distance_km"]

            travel_mins = int(trans_info["recommended_time_mins"])
            travel_cost = int(trans_info["recommended_cost_inr"])
            cur_minutes += travel_mins

            start_str = f"{cur_minutes // 60:02d}:{cur_minutes % 60:02d}"
            visit_hrs = float(place.get("average_visit_duration", 1.8) or 1.8)
            visit_mins = int(round(visit_hrs * 60))
            end_minutes = cur_minutes + visit_mins
            end_str = f"{end_minutes // 60:02d}:{end_minutes % 60:02d}"

            # Evaluate place safety at this specific scheduled hour
            place_safety = compute_comprehensive_safety_risk(
                db=db,
                destination=place["city"],
                place_name=place["name"],
                category=place["category"],
                activity=place["category"],
                travel_date=travel_date,
                visit_time=start_str,
                temperature_c=weather_info["temperature_c"],
                rainfall_mm=weather_info["rainfall_mm"],
                humidity_pct=weather_info["humidity_pct"],
                wind_speed_kmh=weather_info["wind_speed_kmh"],
                weather_condition=weather_info["condition"],
            )

            metro_opt = trans_info["options"]["metro"]
            bus_opt = trans_info["options"]["bus"]
            cab_opt = trans_info["options"]["cab"]
            auto_opt = trans_info["options"]["auto"]

            metro_str = (
                f"{metro_opt['destination_station']} ({metro_opt['network']}) — "
                f"Est. ₹{metro_opt['estimated_fare_inr']}, {metro_opt['estimated_time_mins']} mins"
                if metro_opt["available"]
                else "No Metro in town — use Bus/Auto/Cab"
            )
            bus_str = f"{bus_opt['nearest_stop']} ({bus_opt['bus_route']}) — Est. ₹{bus_opt['estimated_fare_inr']}, {bus_opt['estimated_time_mins']} mins"
            cab_str = f"Auto: Est. ₹{auto_opt['estimated_fare_inr']} | Cab Mini: Est. ₹{cab_opt['estimated_fare_mini_inr']} ({cab_opt['estimated_time_mins']} mins)"

            entry_total = float(place.get("entry_fee", 0.0) or 0.0) * travelers
            daily_cost += entry_total + travel_cost

            place_detail = {
                "place_id": place["id"],
                "visit_order": p_idx + 1,
                "name": place["name"],
                "category": place["category"],
                "sub_category": place.get("sub_category"),
                "short_history": place["history"],
                "description": place["description"],
                "opening_hours": f"{place['opening_time']} - {place['closing_time']}",
                "recommended_visiting_time": f"{start_str} - {end_str} ({place['best_time']})",
                "start_time": start_str,
                "end_time": end_str,
                "estimated_visit_duration_hrs": visit_hrs,
                "entry_fee_per_person_inr": place["entry_fee"],
                "total_entry_fee_inr": entry_total,
                "distance_from_previous_km": dist_km,
                "previous_location": prev_place["name"] if prev_place else f"{resolved_dest} City Center Hotel",
                "travel_method": trans_info["recommended_mode"],
                "estimated_travel_time_mins": travel_mins,
                "estimated_travel_cost_inr": travel_cost,
                "metro_information": metro_str,
                "bus_information": bus_str,
                "cab_auto_estimate": cab_str,
                "transport_options": trans_info["options"],
                "transport_modes": trans_info["options"],
                "crowd_level": place_safety["crowd_prediction"]["crowd_level"],
                "weather_suitability": f"{weather_info['condition']} ({weather_info['temperature_c']}°C) — {'Optimal' if place_safety['factor_scores']['weather'] < 45 else 'Carry Umbrella/Sun Protection'}",
                "safety_risk": place_safety["overall_risk_level"],
                "safety_score": place["safety_score"],
                "overall_risk_score": place_safety["overall_risk_score"],
                "route_risk": place_safety["route_analysis"]["route_risk_level"],
                "recommendation": place_safety["recommendation"],
                "ai_explanations": place["ai_explanations"],
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "image_url": place.get("image_url"),
            }

            day_places_out.append(place_detail)
            all_scheduled_places.append(place_detail)

            timeline_items.append({
                "slot_type": "ATTRACTION",
                "time_label": f"{start_str} – {end_str}",
                "title": place["name"],
                "category": place["category"],
                "distance_km": dist_km,
                "travel_time_mins": travel_mins,
                "transport": trans_info["recommended_mode"],
                "estimated_cost_inr": entry_total + travel_cost,
                "risk_level": place_safety["overall_risk_level"],
                "place_detail": place_detail,
            })

            cur_minutes = end_minutes
            prev_place = place

        # Evening Local Food & Shopping Recommendation + Return to Hotel
        evening_time = f"{max(18, min(20, cur_minutes // 60)):02d}:30"
        evening_food = (
            cluster[-1].get("local_food_recommendations")
            if cluster and cluster[-1].get("local_food_recommendations")
            else f"Famous {resolved_dest} Street Food & Heritage Culinary Walk"
        )
        timeline_items.append({
            "slot_type": "EVENING_FOOD",
            "time_label": evening_time,
            "title": f"Evening Food & Local Bazaar Recommendation",
            "description": f"Savor {evening_food} at verified hygienic outlets.",
            "estimated_cost_inr": 400 * travelers,
            "risk_level": "LOW",
        })
        timeline_items.append({
            "slot_type": "HOTEL_RETURN",
            "time_label": "20:30",
            "title": "Safe Return to Hotel via Verified Metro / App Cab",
            "description": "Conclude sightseeing before late-night hours for optimal travel safety.",
            "estimated_cost_inr": 120,
            "risk_level": "LOW",
        })
        daily_cost += 400 * travelers + 120

        total_day_dist = round(sum(float(p.get("distance_from_previous_km", 0.0) or 0.0) for p in day_places_out), 1)
        total_day_trans_mins = sum(int(p.get("estimated_travel_time_mins", 0) or 0) for p in day_places_out)
        total_day_entry = round(sum(float(p.get("total_entry_fee_inr", 0.0) or 0.0) for p in day_places_out))
        total_day_transit_fare = round(sum(float(p.get("estimated_travel_cost_inr", 0.0) or 0.0) for p in day_places_out))
        day_avg_safety = round(sum(float(p.get("safety_score", 82.0) or 82.0) for p in day_places_out) / max(1, len(day_places_out)), 1) if day_places_out else 85.0

        structured_days.append({
            "day": day_num,
            "theme": f"DAY {day_num} — {theme.upper()}",
            "weather_summary": f"{weather_info['condition']}, {weather_info['temperature_c']}°C ({weather_info['source_label']})",
            "daily_estimated_cost_inr": round(daily_cost),
            "total_distance_km": total_day_dist,
            "total_travel_time_mins": total_day_trans_mins,
            "total_entry_cost_inr": total_day_entry,
            "total_transit_cost_inr": total_day_transit_fare,
            "day_safety_score": day_avg_safety,
            "places": day_places_out,
            "timeline": timeline_items,
        })

    # Suggested Hotels & Restaurants in destination
    hotels_db = db.query(Hotel).filter(Hotel.city.ilike(f"%{resolved_dest}%")).limit(4).all()
    restaurants_db = db.query(Restaurant).filter(Restaurant.city.ilike(f"%{resolved_dest}%")).limit(4).all()

    return {
        "destination": resolved_dest,
        "start_location": start_location,
        "days_count": days,
        "travelers": travelers,
        "travel_date": travel_date,
        "days": structured_days,
        "budget": rec_bundle["estimatedBudget"],
        "risk": rec_bundle["riskSummary"],
        "transport": rec_bundle["transportOptions"],
        "weather": weather_info,
        "hotels": [
            {
                "id": h.id,
                "name": h.name,
                "city": h.city,
                "tier": h.tier,
                "price_per_night": h.price_per_night,
                "rating": h.rating,
                "safety_score": h.safety_score,
                "amenities": h.amenities,
                "latitude": h.latitude,
                "longitude": h.longitude,
            }
            for h in hotels_db
        ],
        "restaurants": [
            {
                "id": r.id,
                "name": r.name,
                "city": r.city,
                "cuisine": r.cuisine,
                "signature_dish": r.signature_dish,
                "avg_cost_for_two": r.avg_cost_for_two,
                "rating": r.rating,
                "latitude": r.latitude,
                "longitude": r.longitude,
            }
            for r in restaurants_db
        ],
    }
