import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_DIR = Path(os.getenv("DATASET_DIR", str(BASE_DIR / "Dataset")))
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data")))
PDF_DATASET_DIR = DATA_DIR / "pdf_datasets"
UPLOAD_DIR = DATA_DIR / "uploads"
EXPORT_DIR = DATA_DIR / "exports"

# Robust ML models directory resolution
env_ml = os.getenv("ML_MODELS_DIR")
if env_ml:
    ML_MODELS_DIR = Path(env_ml)
elif (BASE_DIR / "ml" / "models").exists():
    ML_MODELS_DIR = BASE_DIR / "ml" / "models"
elif (Path(__file__).resolve().parent.parent / "models").exists():
    ML_MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
else:
    ML_MODELS_DIR = BASE_DIR / "ml" / "models"

for d in [DATASET_DIR, DATA_DIR, PDF_DATASET_DIR, UPLOAD_DIR, EXPORT_DIR, ML_MODELS_DIR]:
    try:
        d.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'safetrip_ai.db'}")
# Fix for hosted PostgreSQL providers like Render / Heroku that still use postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "safetrip-ai-mca-capstone-secret-key-2026-secure")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
MAX_PDF_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB limit

# Configurable Recommendation Weights (Section 8)
DEFAULT_RECOMMENDATION_WEIGHTS = {
    "preference_match": 0.20,
    "budget_match": 0.15,
    "safety": 0.15,
    "weather_suitability": 0.10,
    "crowd_suitability": 0.10,
    "distance": 0.10,
    "rating": 0.10,
    "time_suitability": 0.10,
}

# Configurable Multi-Factor Risk Calculation Weights (Section 34)
DEFAULT_RISK_WEIGHTS = {
    "weather_risk": 0.20,
    "crowd_risk": 0.15,
    "time_risk": 0.15,
    "route_risk": 0.20,
    "location_risk": 0.15,
    "scam_risk": 0.15,
}

# Configurable Transport Fare Tables (INR) - Labeled Clearly as Estimated Dataset when Live API is unavailable (Section 11 & 47)
TRANSPORT_FARE_CONFIG = {
    "data_label": "Estimated fare (Configurable Research Dataset)",
    "walking": {
        "base_fare": 0,
        "per_km": 0,
        "avg_speed_kmh": 4.5,
    },
    "metro": {
        "base_fare": 10,
        "slabs": [
            (2, 10),
            (5, 20),
            (12, 30),
            (21, 40),
            (32, 50),
            (999, 60),
        ],
        "avg_speed_kmh": 32.0,
    },
    "bus": {
        "base_fare": 10,
        "per_km": 1.8,
        "ac_multiplier": 1.5,
        "avg_speed_kmh": 20.0,
    },
    "auto": {
        "base_fare": 30,
        "base_km": 1.5,
        "per_km": 15.0,
        "night_surcharge_pct": 25,
        "avg_speed_kmh": 24.0,
    },
    "cab": {
        "base_fare": 60,
        "per_km_mini": 14.0,
        "per_km_sedan": 18.0,
        "per_km_suv": 24.0,
        "avg_speed_kmh": 28.0,
    },
    "intercity_bus": {
        "non_ac_per_km": 1.4,
        "ac_sleeper_per_km": 2.4,
        "avg_speed_kmh": 50.0,
    },
    "train": {
        "sleeper_per_km": 0.65,
        "ac_3tier_per_km": 1.65,
        "ac_2tier_per_km": 2.40,
        "rajdhani_vande_bharat_per_km": 2.95,
        "avg_speed_kmh": 68.0,
    },
    "flight": {
        "base_airport_fee": 1450,
        "per_km_economy": 2.65,
        "avg_speed_kmh": 650.0,
        "boarding_buffer_mins": 90,
    },
}

# Complete Tourist Categories (Section 5)
TOURISM_CATEGORIES = [
    "Temple", "Historical", "Beach", "Hill Station", "Museum",
    "Couple", "Family", "Adventure", "Nature", "Wildlife",
    "Waterfall", "Fort", "Palace", "Lake", "Religious",
    "Spiritual", "Cultural", "Heritage", "Food", "Shopping",
    "Photography", "Trekking", "Camping", "Amusement Park", "Art Gallery"
]
