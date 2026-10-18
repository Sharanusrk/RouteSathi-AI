-- SafeTrip AI - Relational Database Schema (PostgreSQL / MySQL Compatible)
-- 22 Core Tables with Foreign Key Constraints

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'USER' NOT NULL,
    phone VARCHAR(30),
    home_city VARCHAR(100) DEFAULT 'Bangalore',
    preferences_json TEXT DEFAULT '{}',
    saved_places_json TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) NOT NULL,
    region VARCHAR(50) NOT NULL,
    capital VARCHAR(100),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    best_season VARCHAR(100) DEFAULT 'October to March',
    avg_safety_score DOUBLE PRECISION DEFAULT 80.0
);

CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    crime_index DOUBLE PRECISION DEFAULT 25.0,
    safety_tier VARCHAR(20) DEFAULT 'LOW',
    description TEXT
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT 'Compass',
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tourist_places (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(180) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    category VARCHAR(80) NOT NULL,
    sub_category VARCHAR(255),
    description TEXT NOT NULL,
    history TEXT NOT NULL,
    best_time VARCHAR(120) DEFAULT 'Morning (09:00 AM - 12:00 PM)',
    best_season VARCHAR(120) DEFAULT 'October - March',
    opening_time VARCHAR(20) DEFAULT '09:00',
    closing_time VARCHAR(20) DEFAULT '18:00',
    weekly_off VARCHAR(40) DEFAULT 'None',
    average_visit_duration DOUBLE PRECISION DEFAULT 2.0,
    entry_fee DOUBLE PRECISION DEFAULT 0.0,
    rating DOUBLE PRECISION DEFAULT 4.5,
    popularity DOUBLE PRECISION DEFAULT 85.0,
    crowd_score DOUBLE PRECISION DEFAULT 50.0,
    safety_score DOUBLE PRECISION DEFAULT 82.0,
    weather_sensitivity VARCHAR(30) DEFAULT 'MEDIUM',
    activities TEXT,
    family_friendly BOOLEAN DEFAULT TRUE,
    couple_friendly BOOLEAN DEFAULT TRUE,
    solo_friendly BOOLEAN DEFAULT TRUE,
    senior_friendly BOOLEAN DEFAULT TRUE,
    nearest_metro VARCHAR(150),
    nearest_metro_distance_km DOUBLE PRECISION DEFAULT 1.2,
    nearest_bus_stop VARCHAR(150),
    nearest_airport VARCHAR(150),
    nearest_railway VARCHAR(150),
    daily_budget_low DOUBLE PRECISION DEFAULT 1200.0,
    daily_budget_mid DOUBLE PRECISION DEFAULT 2800.0,
    daily_budget_luxury DOUBLE PRECISION DEFAULT 7500.0,
    local_food_recommendations TEXT,
    safety_notes TEXT,
    image_url VARCHAR(500),
    data_source VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS place_categories (
    id SERIAL PRIMARY KEY,
    place_id INTEGER NOT NULL REFERENCES tourist_places(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS place_history (
    id SERIAL PRIMARY KEY,
    place_id INTEGER UNIQUE NOT NULL REFERENCES tourist_places(id) ON DELETE CASCADE,
    history_text TEXT NOT NULL,
    establishment_year VARCHAR(60),
    dynasty_or_era VARCHAR(120),
    source_citation VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS transport_routes (
    id SERIAL PRIMARY KEY,
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    mode VARCHAR(40) NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    duration_hours DOUBLE PRECISION NOT NULL,
    estimated_fare_inr DOUBLE PRECISION NOT NULL,
    departure_window VARCHAR(80),
    data_type VARCHAR(50) DEFAULT 'ESTIMATED_DATASET',
    route_details TEXT
);

CREATE TABLE IF NOT EXISTS metro_stations (
    id SERIAL PRIMARY KEY,
    city VARCHAR(80) NOT NULL,
    network_name VARCHAR(100) NOT NULL,
    station_name VARCHAR(120) NOT NULL,
    line_name VARCHAR(80) NOT NULL,
    line_color VARCHAR(30) DEFAULT '#2563eb',
    station_order INTEGER DEFAULT 1,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_interchange BOOLEAN DEFAULT FALSE,
    connected_lines VARCHAR(150),
    nearby_attractions VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bus_stops (
    id SERIAL PRIMARY KEY,
    city VARCHAR(80) NOT NULL,
    stop_name VARCHAR(150) NOT NULL,
    operator VARCHAR(80),
    routes_served VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    nearby_place VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    city VARCHAR(100) NOT NULL,
    tier VARCHAR(40) DEFAULT 'Mid-Range',
    price_per_night DOUBLE PRECISION NOT NULL,
    rating DOUBLE PRECISION DEFAULT 4.3,
    safety_score DOUBLE PRECISION DEFAULT 88.0,
    amenities VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    city VARCHAR(100) NOT NULL,
    cuisine VARCHAR(150) NOT NULL,
    signature_dish VARCHAR(180),
    avg_cost_for_two DOUBLE PRECISION NOT NULL,
    rating DOUBLE PRECISION DEFAULT 4.4,
    hygiene_score DOUBLE PRECISION DEFAULT 86.0,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
    state_name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    season VARCHAR(40) NOT NULL,
    avg_temp_c DOUBLE PRECISION NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    humidity_pct DOUBLE PRECISION DEFAULT 65.0,
    condition VARCHAR(80),
    source VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS crowd_data (
    id SERIAL PRIMARY KEY,
    place_id INTEGER NOT NULL REFERENCES tourist_places(id) ON DELETE CASCADE,
    day_type VARCHAR(30) NOT NULL,
    season VARCHAR(40) NOT NULL,
    time_slot VARCHAR(40) NOT NULL,
    crowd_level VARCHAR(30) NOT NULL,
    occupancy_index DOUBLE PRECISION DEFAULT 55.0
);

CREATE TABLE IF NOT EXISTS incident_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    place_id INTEGER REFERENCES tourist_places(id) ON DELETE SET NULL,
    location_name VARCHAR(180) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    date VARCHAR(30) NOT NULL,
    time VARCHAR(30) NOT NULL,
    category VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL,
    image_url VARCHAR(500),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(30) DEFAULT 'APPROVED',
    source_type VARCHAR(50) DEFAULT 'USER_REPORT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_predictions (
    id SERIAL PRIMARY KEY,
    place_id INTEGER REFERENCES tourist_places(id) ON DELETE CASCADE,
    destination VARCHAR(150) NOT NULL,
    activity VARCHAR(100),
    weather_risk DOUBLE PRECISION NOT NULL,
    crowd_risk DOUBLE PRECISION NOT NULL,
    time_risk DOUBLE PRECISION NOT NULL,
    route_risk DOUBLE PRECISION NOT NULL,
    location_risk DOUBLE PRECISION NOT NULL,
    scam_risk DOUBLE PRECISION NOT NULL,
    overall_score DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    explanation TEXT NOT NULL,
    safer_alternative TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itineraries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    start_location VARCHAR(100) DEFAULT 'Bangalore',
    destination VARCHAR(120) NOT NULL,
    state VARCHAR(100),
    days INTEGER NOT NULL,
    budget DOUBLE PRECISION NOT NULL,
    travelers INTEGER DEFAULT 2,
    start_date VARCHAR(30),
    preferred_start_time VARCHAR(20) DEFAULT '09:00',
    travel_preference VARCHAR(80) DEFAULT 'Balanced',
    categories_json TEXT DEFAULT '[]',
    budget_breakdown_json TEXT DEFAULT '{}',
    risk_summary_json TEXT DEFAULT '{}',
    transport_summary_json TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_days (
    id SERIAL PRIMARY KEY,
    itinerary_id INTEGER NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    theme_title VARCHAR(180) NOT NULL,
    daily_cost_estimate DOUBLE PRECISION DEFAULT 0.0,
    weather_summary VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS itinerary_places (
    id SERIAL PRIMARY KEY,
    itinerary_day_id INTEGER NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    place_id INTEGER REFERENCES tourist_places(id) ON DELETE SET NULL,
    place_name VARCHAR(180) NOT NULL,
    visit_order INTEGER NOT NULL,
    activity_type VARCHAR(60) DEFAULT 'ATTRACTION',
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    duration_hrs DOUBLE PRECISION DEFAULT 1.5,
    entry_fee_inr DOUBLE PRECISION DEFAULT 0.0,
    distance_from_prev_km DOUBLE PRECISION DEFAULT 0.0,
    transport_mode VARCHAR(60),
    travel_time_mins DOUBLE PRECISION DEFAULT 20.0,
    travel_cost_inr DOUBLE PRECISION DEFAULT 40.0,
    metro_info VARCHAR(255),
    bus_info VARCHAR(255),
    cab_auto_estimate VARCHAR(255),
    crowd_level VARCHAR(30),
    weather_suitability VARCHAR(60),
    safety_risk VARCHAR(30),
    route_risk VARCHAR(30),
    recommendation_note TEXT,
    short_history TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS ml_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    target_task VARCHAR(150) NOT NULL,
    selected_algorithm VARCHAR(80) NOT NULL,
    version VARCHAR(40) DEFAULT 'v1.0.0',
    dataset_source VARCHAR(255) NOT NULL,
    dataset_size INTEGER NOT NULL,
    features_json TEXT NOT NULL,
    missing_values_handled INTEGER DEFAULT 0,
    duplicates_removed INTEGER DEFAULT 0,
    train_accuracy DOUBLE PRECISION NOT NULL,
    val_accuracy DOUBLE PRECISION NOT NULL,
    precision_score DOUBLE PRECISION NOT NULL,
    recall_score DOUBLE PRECISION NOT NULL,
    f1_score DOUBLE PRECISION NOT NULL,
    roc_auc DOUBLE PRECISION DEFAULT 0.0,
    confusion_matrix_json TEXT NOT NULL,
    feature_importance_json TEXT NOT NULL,
    comparison_metrics_json TEXT NOT NULL,
    selection_rationale TEXT,
    file_path VARCHAR(255) NOT NULL,
    trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    source VARCHAR(255) NOT NULL,
    license VARCHAR(120),
    download_date VARCHAR(40),
    record_count INTEGER DEFAULT 0,
    missing_values_count INTEGER DEFAULT 0,
    features_list TEXT,
    file_path VARCHAR(300) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pdf_uploads (
    id SERIAL PRIMARY KEY,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    dataset_source VARCHAR(255),
    status VARCHAR(40) DEFAULT 'EXTRACTED_PENDING_REVIEW',
    extracted_text_preview TEXT,
    extracted_records_count INTEGER DEFAULT 0,
    valid_records_count INTEGER DEFAULT 0,
    invalid_records_count INTEGER DEFAULT 0,
    extracted_json TEXT DEFAULT '[]',
    validation_errors_json TEXT DEFAULT '[]',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP
);
