"""Small, idempotent seed for serverless deployments.

The full local seed imports datasets, parses PDFs, and trains ML models. Vercel
functions should only seed the curated rows needed by the app, using batched
ORM operations and the persistent Neon database.
"""
from sqlalchemy.orm import Session

from app.config import TOURISM_CATEGORIES
from app.database.seed import ALL_36_STATES_UTS, CURATED_GRANULAR_PLACES
from app.models.entities import (
    Category,
    CrowdData,
    District,
    PlaceCategory,
    PlaceHistory,
    State,
    TouristPlace,
)


def seed_vercel_database(db: Session) -> None:
    states = {state.name.lower(): state for state in db.query(State).all()}
    for name, code, region, capital, lat, lon, description in ALL_36_STATES_UTS:
        states.setdefault(
            name.lower(),
            State(
                name=name,
                code=code,
                region=region,
                capital=capital,
                latitude=lat,
                longitude=lon,
                description=description,
                avg_safety_score=84.0,
            ),
        )
    db.add_all([state for state in states.values() if state.id is None])
    db.flush()

    categories = {category.name.lower(): category for category in db.query(Category).all()}
    for name in TOURISM_CATEGORIES:
        categories.setdefault(
            name.lower(),
            Category(
                name=name,
                icon="Compass",
                description=f"Explore verified {name} destinations across India",
            ),
        )
    db.add_all([category for category in categories.values() if category.id is None])
    db.flush()

    districts = {
        (district.state_id, district.name.lower()): district
        for district in db.query(District).all()
    }
    place_specs = []
    for item in CURATED_GRANULAR_PLACES:
        state = states.get(item["state"].lower(), states["delhi"])
        district_name = item["district"].split(",")[0].strip() or state.capital or state.name
        key = (state.id, district_name.lower())
        district = districts.get(key)
        if district is None:
            district = District(
                state_id=state.id,
                name=district_name,
                latitude=item["latitude"],
                longitude=item["longitude"],
                crime_index=30.0,
                safety_tier="LOW",
                description=f"Tourism & cultural district of {district_name} in {state.name}.",
            )
            districts[key] = district
            place_specs.append((item, state, district))
        else:
            place_specs.append((item, state, district))

    db.add_all([district for district in districts.values() if district.id is None])
    db.flush()

    existing_places = {
        (place.name.lower(), place.city.lower())
        for place in db.query(TouristPlace.name, TouristPlace.city).all()
    }
    new_places = []
    new_place_items = []
    for item, state, district in place_specs:
        key = (item["name"].lower(), item["city"].lower())
        if key in existing_places:
            continue
        existing_places.add(key)
        new_place_items.append(item)
        new_places.append(
            TouristPlace(
                state_id=state.id,
                district_id=district.id,
                name=item["name"],
                state=state.name,
                district=district.name,
                city=item["city"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                category=item["category"],
                sub_category=item["sub_category"],
                description=item["description"],
                history=item["history"],
                best_time=item["best_time"],
                opening_time=item["opening_time"],
                closing_time=item["closing_time"],
                average_visit_duration=item["average_visit_duration"],
                entry_fee=item["entry_fee"],
                rating=item["rating"],
                popularity=item["popularity"],
                crowd_score=item["crowd_score"],
                safety_score=item["safety_score"],
                weather_sensitivity=item["weather_sensitivity"],
                nearest_metro=item.get("nearest_metro"),
                nearest_bus_stop=item.get("nearest_bus_stop"),
                local_food_recommendations=item.get("local_food_recommendations"),
                couple_friendly="couple" in item["sub_category"].lower(),
                family_friendly=True,
                solo_friendly=True,
                senior_friendly=True,
                data_source="SafeTrip AI curated tourism dataset",
            )
        )

    db.add_all(new_places)
    db.flush()

    history_rows = []
    category_links = []
    crowd_rows = []
    for place, item in zip(new_places, new_place_items):
        history_rows.append(
            PlaceHistory(
                place_id=place.id,
                history_text=item["history"],
                establishment_year="Historical Monument",
                dynasty_or_era="Indian Heritage",
                source_citation="ASI / ProjectCapstone curated dataset",
            )
        )
        for category_name in {value.strip().lower() for value in item["sub_category"].split(",")}:
            category = categories.get(category_name)
            if category is not None:
                category_links.append(PlaceCategory(place_id=place.id, category_id=category.id))
        crowd_rows.extend([
            CrowdData(place_id=place.id, day_type="Weekday", season="Peak", time_slot="Morning", crowd_level="Low", occupancy_index=max(20, item["crowd_score"] - 20)),
            CrowdData(place_id=place.id, day_type="Weekend", season="Peak", time_slot="Evening", crowd_level="High" if item["crowd_score"] > 60 else "Moderate", occupancy_index=min(95, item["crowd_score"] + 15)),
        ])

    db.add_all(history_rows + category_links + crowd_rows)
    db.commit()
