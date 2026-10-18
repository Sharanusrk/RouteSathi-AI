from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database.db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER", nullable=False)  # USER | ADMIN
    phone = Column(String(30), nullable=True)
    home_city = Column(String(100), default="Bangalore")
    preferences_json = Column(Text, default="{}")
    saved_places_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    itineraries = relationship("Itinerary", back_populates="user", cascade="all, delete-orphan")
    incident_reports = relationship("IncidentReport", back_populates="user")
    pdf_uploads = relationship("PdfUpload", back_populates="uploader")


class State(Base):
    __tablename__ = "states"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(10), nullable=False)
    region = Column(String(50), nullable=False)  # North, South, East, West, Central, North-East, UT
    capital = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    best_season = Column(String(100), default="October to March")
    avg_safety_score = Column(Float, default=80.0)

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")
    places = relationship("TouristPlace", back_populates="state_rel", cascade="all, delete-orphan")
    weather_records = relationship("WeatherData", back_populates="state_rel")


class District(Base):
    __tablename__ = "districts"
    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    crime_index = Column(Float, default=25.0)  # Derived from NCRB district crime dataset (0-100)
    safety_tier = Column(String(20), default="LOW")  # LOW | MEDIUM | HIGH risk
    description = Column(Text, nullable=True)

    state = relationship("State", back_populates="districts")
    places = relationship("TouristPlace", back_populates="district_rel", cascade="all, delete-orphan")
    hotels = relationship("Hotel", back_populates="district_rel", cascade="all, delete-orphan")
    restaurants = relationship("Restaurant", back_populates="district_rel", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, index=True, nullable=False)
    icon = Column(String(50), default="Compass")
    description = Column(String(255), nullable=True)

    place_links = relationship("PlaceCategory", back_populates="category", cascade="all, delete-orphan")


class TouristPlace(Base):
    __tablename__ = "tourist_places"
    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(180), index=True, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(120), index=True, nullable=False)
    city = Column(String(120), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String(80), index=True, nullable=False)
    sub_category = Column(String(255), nullable=True)  # Comma-separated multi-categories
    description = Column(Text, nullable=False)
    history = Column(Text, nullable=False)
    best_time = Column(String(120), default="Morning (09:00 AM - 12:00 PM)")
    best_season = Column(String(120), default="October - March")
    opening_time = Column(String(20), default="09:00")
    closing_time = Column(String(20), default="18:00")
    weekly_off = Column(String(40), default="None")
    average_visit_duration = Column(Float, default=2.0)  # in hours
    entry_fee = Column(Float, default=0.0)  # INR
    rating = Column(Float, default=4.5)
    popularity = Column(Float, default=85.0)  # 0-100
    crowd_score = Column(Float, default=50.0)  # 0-100
    safety_score = Column(Float, default=82.0)  # 0-100 (higher = safer)
    weather_sensitivity = Column(String(30), default="MEDIUM")  # LOW (Indoor) | MEDIUM | HIGH (Outdoor/Trek/Water)
    activities = Column(Text, default="Sightseeing, Photography, Cultural Walk")
    family_friendly = Column(Boolean, default=True)
    couple_friendly = Column(Boolean, default=True)
    solo_friendly = Column(Boolean, default=True)
    senior_friendly = Column(Boolean, default=True)
    nearest_metro = Column(String(150), nullable=True)
    nearest_metro_distance_km = Column(Float, default=1.2)
    nearest_bus_stop = Column(String(150), nullable=True)
    nearest_airport = Column(String(150), nullable=True)
    nearest_railway = Column(String(150), nullable=True)
    daily_budget_low = Column(Float, default=1200.0)
    daily_budget_mid = Column(Float, default=2800.0)
    daily_budget_luxury = Column(Float, default=7500.0)
    local_food_recommendations = Column(Text, nullable=True)
    safety_notes = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    data_source = Column(String(200), default="ProjectCapstone/Dataset/Indian Tourism Dataset")

    state_rel = relationship("State", back_populates="places")
    district_rel = relationship("District", back_populates="places")
    category_links = relationship("PlaceCategory", back_populates="place", cascade="all, delete-orphan")
    history_record = relationship("PlaceHistory", back_populates="place", uselist=False, cascade="all, delete-orphan")
    crowd_records = relationship("CrowdData", back_populates="place", cascade="all, delete-orphan")
    incidents = relationship("IncidentReport", back_populates="place")
    risk_predictions = relationship("RiskPrediction", back_populates="place", cascade="all, delete-orphan")


class PlaceCategory(Base):
    __tablename__ = "place_categories"
    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("tourist_places.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)

    place = relationship("TouristPlace", back_populates="category_links")
    category = relationship("Category", back_populates="place_links")


class PlaceHistory(Base):
    __tablename__ = "place_history"
    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("tourist_places.id", ondelete="CASCADE"), unique=True, nullable=False)
    history_text = Column(Text, nullable=False)  # 100-150 words verified history
    establishment_year = Column(String(60), default="Historical")
    dynasty_or_era = Column(String(120), nullable=True)
    source_citation = Column(String(255), default="ASI / Ministry of Tourism / ProjectCapstone Dataset")

    place = relationship("TouristPlace", back_populates="history_record")


class TransportRoute(Base):
    __tablename__ = "transport_routes"
    id = Column(Integer, primary_key=True, index=True)
    origin_city = Column(String(100), index=True, nullable=False)
    destination_city = Column(String(100), index=True, nullable=False)
    mode = Column(String(40), nullable=False)  # Flight | Train | Bus | Cab | Metro
    service_name = Column(String(150), nullable=False)
    distance_km = Column(Float, nullable=False)
    duration_hours = Column(Float, nullable=False)
    estimated_fare_inr = Column(Float, nullable=False)
    departure_window = Column(String(80), default="Multiple daily departures")
    data_type = Column(String(50), default="ESTIMATED_DATASET")  # ESTIMATED_DATASET | LIVE_API
    route_details = Column(Text, nullable=True)


class MetroStation(Base):
    __tablename__ = "metro_stations"
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(80), index=True, nullable=False)
    network_name = Column(String(100), nullable=False)  # Delhi Metro (DMRC), Namma Metro, Mumbai Metro, etc.
    station_name = Column(String(120), index=True, nullable=False)
    line_name = Column(String(80), nullable=False)
    line_color = Column(String(30), default="#2563eb")
    station_order = Column(Integer, default=1)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_interchange = Column(Boolean, default=False)
    connected_lines = Column(String(150), nullable=True)
    nearby_attractions = Column(String(255), nullable=True)


class BusStop(Base):
    __tablename__ = "bus_stops"
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(80), index=True, nullable=False)
    stop_name = Column(String(150), nullable=False)
    operator = Column(String(80), default="State City Transport (DTC / BMTC / BEST / MTC)")
    routes_served = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    nearby_place = Column(String(150), nullable=True)


class Hotel(Base):
    __tablename__ = "hotels"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(160), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    tier = Column(String(40), default="Mid-Range")  # Budget | Mid-Range | Luxury
    price_per_night = Column(Float, nullable=False)
    rating = Column(Float, default=4.3)
    safety_score = Column(Float, default=88.0)
    amenities = Column(String(255), default="WiFi, AC, 24x7 Security, CCTV, Verified Desk")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    district_rel = relationship("District", back_populates="hotels")


class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(160), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    cuisine = Column(String(150), nullable=False)
    signature_dish = Column(String(180), nullable=True)
    avg_cost_for_two = Column(Float, nullable=False)
    rating = Column(Float, default=4.4)
    hygiene_score = Column(Float, default=86.0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    district_rel = relationship("District", back_populates="restaurants")


class WeatherData(Base):
    __tablename__ = "weather_data"
    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=True)
    state_name = Column(String(100), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=True)
    season = Column(String(40), nullable=False)  # Winter | Summer | Monsoon | Post-Monsoon
    avg_temp_c = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    humidity_pct = Column(Float, default=65.0)
    condition = Column(String(80), default="Clear / Pleasant")
    source = Column(String(150), default="IMD / Daily Rainfall Data India (2009-2024)")

    state_rel = relationship("State", back_populates="weather_records")


class CrowdData(Base):
    __tablename__ = "crowd_data"
    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("tourist_places.id", ondelete="CASCADE"), nullable=False, index=True)
    day_type = Column(String(30), nullable=False)  # Weekday | Weekend | Holiday
    season = Column(String(40), nullable=False)  # Peak | Off-Season | Shoulder
    time_slot = Column(String(40), nullable=False)  # Morning | Afternoon | Evening | Night
    crowd_level = Column(String(30), nullable=False)  # Low | Moderate | High
    occupancy_index = Column(Float, default=55.0)

    place = relationship("TouristPlace", back_populates="crowd_records")


class IncidentReport(Base):
    __tablename__ = "incident_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    place_id = Column(Integer, ForeignKey("tourist_places.id", ondelete="SET NULL"), nullable=True)
    location_name = Column(String(180), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=True)
    date = Column(String(30), nullable=False)
    time = Column(String(30), nullable=False)
    category = Column(String(60), nullable=False)  # Scam | Theft | Harassment | Unsafe route | Transport issue | Fraud | Crowd issue | Other
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="MEDIUM", nullable=False)  # LOW | MEDIUM | HIGH
    image_url = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(30), default="APPROVED")  # APPROVED | PENDING | REJECTED
    source_type = Column(String(50), default="USER_REPORT")  # USER_REPORT | NCRB_HISTORICAL
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="incident_reports")
    place = relationship("TouristPlace", back_populates="incidents")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("tourist_places.id", ondelete="CASCADE"), nullable=True)
    destination = Column(String(150), nullable=False)
    activity = Column(String(100), nullable=True)
    weather_risk = Column(Float, nullable=False)
    crowd_risk = Column(Float, nullable=False)
    time_risk = Column(Float, nullable=False)
    route_risk = Column(Float, nullable=False)
    location_risk = Column(Float, nullable=False)
    scam_risk = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)  # LOW | MEDIUM | HIGH
    explanation = Column(Text, nullable=False)
    safer_alternative = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    place = relationship("TouristPlace", back_populates="risk_predictions")


class Itinerary(Base):
    __tablename__ = "itineraries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    start_location = Column(String(100), default="Bangalore")
    destination = Column(String(120), index=True, nullable=False)
    state = Column(String(100), nullable=True)
    days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    travelers = Column(Integer, default=2)
    start_date = Column(String(30), nullable=True)
    preferred_start_time = Column(String(20), default="09:00")
    travel_preference = Column(String(80), default="Balanced")
    categories_json = Column(Text, default="[]")
    budget_breakdown_json = Column(Text, default="{}")
    risk_summary_json = Column(Text, default="{}")
    transport_summary_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="itineraries")
    day_plans = relationship("ItineraryDay", back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryDay.day_number")


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"
    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    theme_title = Column(String(180), nullable=False)
    daily_cost_estimate = Column(Float, default=0.0)
    weather_summary = Column(String(200), nullable=True)

    itinerary = relationship("Itinerary", back_populates="day_plans")
    scheduled_places = relationship("ItineraryPlace", back_populates="day_plan", cascade="all, delete-orphan", order_by="ItineraryPlace.visit_order")


class ItineraryPlace(Base):
    __tablename__ = "itinerary_places"
    id = Column(Integer, primary_key=True, index=True)
    itinerary_day_id = Column(Integer, ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False, index=True)
    place_id = Column(Integer, ForeignKey("tourist_places.id", ondelete="SET NULL"), nullable=True)
    place_name = Column(String(180), nullable=False)
    visit_order = Column(Integer, nullable=False)
    activity_type = Column(String(60), default="ATTRACTION")  # ATTRACTION | MEAL | TRANSIT
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    duration_hrs = Column(Float, default=1.5)
    entry_fee_inr = Column(Float, default=0.0)
    distance_from_prev_km = Column(Float, default=0.0)
    transport_mode = Column(String(60), default="Metro / Cab")
    travel_time_mins = Column(Float, default=20.0)
    travel_cost_inr = Column(Float, default=40.0)
    metro_info = Column(String(255), nullable=True)
    bus_info = Column(String(255), nullable=True)
    cab_auto_estimate = Column(String(255), nullable=True)
    crowd_level = Column(String(30), default="Moderate")
    weather_suitability = Column(String(60), default="Suitable")
    safety_risk = Column(String(30), default="LOW")
    route_risk = Column(String(30), default="LOW")
    recommendation_note = Column(Text, nullable=True)
    short_history = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    day_plan = relationship("ItineraryDay", back_populates="scheduled_places")


class MlModelRecord(Base):
    __tablename__ = "ml_models"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), index=True, nullable=False)  # crowd_model | weather_risk_model | scam_risk_model | route_risk_model
    target_task = Column(String(150), nullable=False)
    selected_algorithm = Column(String(80), nullable=False)  # Random Forest | Decision Tree | Logistic Regression
    version = Column(String(40), default="v1.0.0")
    dataset_source = Column(String(255), nullable=False)
    dataset_size = Column(Integer, nullable=False)
    features_json = Column(Text, nullable=False)
    missing_values_handled = Column(Integer, default=0)
    duplicates_removed = Column(Integer, default=0)
    train_accuracy = Column(Float, nullable=False)
    val_accuracy = Column(Float, nullable=False)
    precision_score = Column(Float, nullable=False)
    recall_score = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    roc_auc = Column(Float, default=0.0)
    confusion_matrix_json = Column(Text, nullable=False)
    feature_importance_json = Column(Text, nullable=False)
    comparison_metrics_json = Column(Text, nullable=False)  # Full comparison of RF, DT, LR
    selection_rationale = Column(Text, nullable=True)
    file_path = Column(String(255), nullable=False)
    trained_at = Column(DateTime, default=datetime.utcnow)


class DatasetRegistry(Base):
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    source = Column(String(255), nullable=False)
    license = Column(String(120), default="Open Government Data License India / CC BY 4.0")
    download_date = Column(String(40), default="2026-01-15")
    record_count = Column(Integer, default=0)
    missing_values_count = Column(Integer, default=0)
    features_list = Column(Text, nullable=True)
    file_path = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)


class PdfUpload(Base):
    __tablename__ = "pdf_uploads"
    id = Column(Integer, primary_key=True, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    dataset_source = Column(String(255), default="Uploaded PDF Tourism Dataset")
    status = Column(String(40), default="EXTRACTED_PENDING_REVIEW")  # EXTRACTED_PENDING_REVIEW | APPROVED | REJECTED
    extracted_text_preview = Column(Text, nullable=True)
    extracted_records_count = Column(Integer, default=0)
    valid_records_count = Column(Integer, default=0)
    invalid_records_count = Column(Integer, default=0)
    extracted_json = Column(Text, default="[]")
    validation_errors_json = Column(Text, default="[]")
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

    uploader = relationship("User", back_populates="pdf_uploads")
