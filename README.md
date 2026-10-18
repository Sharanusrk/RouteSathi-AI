# SafeTrip AI – An Intelligent AI-Based Indian Tourism Safety, Recommendation and Trip Planning System

> **MCA Final-Year Major Project / IEEE Research-Ready Production Web Application**  
> **Domain:** Artificial Intelligence, Machine Learning, Geoinformatics & Smart Indian Tourism  

---

## 1. Project Overview & Problem Statement

Tourists traveling across India face fragmented information when planning trips: popular travel portals focus on hotel/ticket booking but ignore **real-time safety risks, weather-activity hazards, crowd congestion, local scam/tout hotspots, night-travel vulnerability, and station-to-station local transit (Metro/Bus/Auto/Cab)**.

**SafeTrip AI** solves this by unifying:
1. **All-India Coverage (28 States + 8 Union Territories, 84+ Districts, 309+ Verified Tourist Places)** with deep canonical coverage of Delhi, Karnataka (Mysuru/Bengaluru), Rajasthan, Kerala, Goa, Himachal Pradesh, Tamil Nadu, Maharashtra, Uttar Pradesh, and more.
2. **4 Trained Supervised Machine Learning Models (`.pkl`)** using Scikit-Learn (`Random Forest`, `Decision Tree`, and `Logistic Regression` benchmarked via 5-fold cross-validation) trained on the datasets in `ProjectCapstone/Dataset/`.
3. **Explainable Hybrid AI Recommendation Engine** with user-configurable weights (`w1..w8`) and human-readable `"Why Recommended"` explanations.
4. **Dynamic Geo-Clustered Day-by-Day Trip Planner & Timeline Generator** that groups nearby attractions on the same day, enforces monument opening/closing hours, schedules meals, computes attraction-to-attraction distances, and estimates multi-modal transit costs.
5. **6-Factor AI Safety & Safer Alternative Engine** combining Weather Risk, Crowd Risk, Time-of-Day Risk, Route Risk, Location Safety, and Scam/Incident Risk—automatically recommending safer indoor/daytime alternatives when risk is elevated.
6. **NetworkX + OSRM Dual Route Analyzer** comparing **Route A (Shortest Distance)** vs **Route B (AI Safe Route)** on an interactive Leaflet/OpenStreetMap map.
7. **9-Step PDF Dataset Ingestion, Validation & Admin Approval Pipeline** (`pypdf`) + **ReportLab Multi-Page PDF Itinerary Exporter**.

---

## 2. System Architecture & Folder Structure

```text
ProjectCapstone/
├── Dataset/                                      # Primary Training & Tourism Datasets
│   ├── India Tourism Structured JSON Dataset/    # 100 multi-place circuits across India
│   ├── Indian Crime Dataset (NCRB Derived)/      # Crime & scam risk training features
│   ├── Indian Road Accident Dataset (2022–2025)/ # Route & accident risk training features
│   ├── Rainfall in India (1901–2015)/            # Historical Indian meteorological data
│   ├── Tourist Footfall Dataset/                 # Crowd prediction training features
│   └── SafeTrip_AI_Indian_Tourism_Safety_Dataset.pdf # Structured PDF tourism dataset
├── backend/                                      # FastAPI + SQLAlchemy + Scikit-Learn Backend
│   ├── app/
│   │   ├── api/                                  # Modular REST API Routers
│   │   │   ├── auth.py                           # JWT Auth (/api/auth/login, /register, /me)
│   │   │   ├── places.py                         # States, Districts, Places, Smart NL Search
│   │   │   ├── recommendations.py                # Hybrid AI Ranking, Trip Planner, PDF Export
│   │   │   ├── safety_transport.py               # 6-Factor Risk, Crowd, Weather, Route A/B, Metro
│   │   │   └── admin_ml_pdf.py                   # 9-Step PDF Pipeline, ML Evaluation, Admin CRUD
│   │   ├── database/
│   │   │   ├── db.py                             # SQLAlchemy Engine & Session
│   │   │   ├── schema.sql                        # Complete 22-Table Relational SQL DDL
│   │   │   └── seed.py                           # Automatic Seeder (36 States/UTs, 309+ Places)
│   │   ├── ml/
│   │   │   ├── pipeline.py                       # RF vs DT vs LR Training & Serialization
│   │   │   └── predictor.py                      # Real-Time .pkl Model Inference Engine
│   │   ├── models/
│   │   │   └── entities.py                       # 22 SQLAlchemy ORM Entities
│   │   ├── pdf/
│   │   │   ├── parser.py                         # 9-Step pypdf Extraction & Validation
│   │   │   └── generator.py                      # ReportLab PDF Itinerary Generator
│   │   ├── recommendation/
│   │   │   └── engine.py                         # Hybrid Scoring & Geo-Clustered Day Planner
│   │   ├── routing/
│   │   │   └── engine.py                         # NetworkX + OSRM Safe Route & Multi-Modal Fares
│   │   ├── safety/
│   │   │   └── engine.py                         # 6-Factor Safety Engine & Safer Alternatives
│   │   ├── utils/
│   │   │   ├── security.py                       # PBKDF2-SHA256 + PyJWT Role-Based Security
│   │   │   └── validators.py                     # Coordinate Bounds, Fee & Time Validators
│   │   ├── weather/
│   │   │   └── service.py                        # Live Open-Meteo API + Climatological Fallback
│   │   ├── config.py                             # Configurable Weights & Tariff Tables
│   │   └── main.py                               # FastAPI Application Entrypoint
│   ├── models/                                   # Serialized .pkl Models Mirror
│   ├── requirements.txt
│   └── run.py                                    # Uvicorn Server Launcher (Port 8000)
├── frontend/                                     # React 19 + Vite + Tailwind CSS + Leaflet
│   ├── src/
│   │   ├── components/                           # Navbar.jsx, PlaceCard.jsx
│   │   ├── context/                              # AuthContext.jsx, TripContext.jsx
│   │   ├── pages/                                # 12 Complete Production Pages
│   │   ├── services/                             # api.js REST Client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── ml/
│   └── models/                                   # Primary Serialized Scikit-Learn Models (.pkl)
│       ├── crowd_model.pkl
│       ├── weather_risk_model.pkl
│       ├── scam_risk_model.pkl
│       └── route_risk_model.pkl
├── data/
│   ├── safetrip_ai.db                            # SQLite Relational Database (22 Tables)
│   └── pdf_datasets/                             # Uploaded & Sample PDF Datasets
└── README.md
```

---

## 3. Honest AI vs. Algorithmic Module Demarcation

To maintain strict academic and engineering transparency, SafeTrip AI clearly distinguishes between supervised Machine Learning models, hybrid weighted scoring formulas, and deterministic graph/spatial algorithms:

| System Module | Technical Method Used | Artifact / Location |
| :--- | :--- | :--- |
| **1. Crowd Level Prediction** | Supervised ML (`RandomForestClassifier` vs `DecisionTree` vs `LogisticRegression`) | `ml/models/crowd_model.pkl` |
| **2. Weather-Activity Risk** | Supervised ML + Domain Safety Guardrails (e.g., Trekking/Beach in heavy rain) | `ml/models/weather_risk_model.pkl` |
| **3. Scam & Incident Risk** | Supervised ML trained on NCRB crime indices + community incident telemetry | `ml/models/scam_risk_model.pkl` |
| **4. Road & Route Risk** | Supervised ML trained on Indian Road Accident Dataset (2022–2025) | `ml/models/route_risk_model.pkl` |
| **5. Place Recommendation** | Explainable 8-Factor Hybrid Content-Based + Configurable Weighted Scoring | `backend/app/recommendation/engine.py` |
| **6. Safe Route Engine (Route A vs B)** | NetworkX Multi-Objective Graph Pathfinding + OSRM Street Geometry | `backend/app/routing/engine.py` |
| **7. Day-Wise Trip Scheduler** | Nearest-Neighbor Spatial Geo-Clustering + Opening-Hours Constraint Solver | `backend/app/recommendation/engine.py` |
| **8. Transport Fare Calculator** | Distance-Tiered Tariff Estimator explicitly labeled as **`Estimated Data`** | `backend/app/routing/engine.py` |

---

## 4. Quick Start & Execution Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### Step 1: Start the FastAPI Backend Server (Port 8000)
```powershell
cd c:\Users\Sai\Desktop\ProjectCapstone\backend
pip install -r requirements.txt
python run.py
```
- The backend automatically creates `data/safetrip_ai.db`, seeds all **36 States & UTs**, **84 Districts**, **309+ Tourist Places**, Metro stations, Bus stops, Hotels, Restaurants, Incident Reports, and trains/verifies all **4 `.pkl` ML models**.
- Swagger OpenAPI Documentation is live at: `http://localhost:8000/docs`

### Step 2: Start the React + Vite Frontend (Port 5173)
```powershell
cd c:\Users\Sai\Desktop\ProjectCapstone\frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.
- Complete Production Deployment Guide: see [`DEPLOYMENT.md`](DEPLOYMENT.md).

### Alternative: 1-Command Production Start via Docker Compose
```bash
docker compose up --build -d
```
- Frontend: `http://localhost` (or `http://localhost:5173`)
- Backend API Docs: `http://localhost:8000/docs`

---

## 5. Demo Accounts (Role-Based Access Control)

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Tourist / User** | `user@safetrip.ai` | `user123` | Plan AI Trips, Save Places, Download PDF Itineraries, Report Incidents |
| **System Admin** | `admin@safetrip.ai` | `admin123` | Full Admin Console, Add/Delete Places, Approve PDF Datasets, Retrain ML Models |

---

## 6. End-to-End Verification & Viva Test Cases

1. **Test Case 1 — Natural Language Smart Search:**  
   Query `"Historical places in Delhi"` or `"Historical places in Mysore"` on `/explore` → Parser extracts category `Historical` + location `Delhi`/`Mysore` and returns matching monuments with safety & crowd badges.
2. **Test Case 2 — Canonical 3-Day Delhi Geo-Clustered Trip Plan:**  
   Generate a 3-Day Delhi itinerary (`₹15,000`, 2 travelers) on `/planner` →
   - **Day 1 (Central/New Delhi):** India Gate, Rashtrapati Bhavan, National War Memorial, Connaught Place
   - **Day 2 (Old Delhi & Mughal Hub):** Red Fort, Jama Masjid, Chandni Chowk, Humayun's Tomb
   - **Day 3 (South/East Delhi):** Qutub Minar, Lotus Temple, Akshardham
3. **Test Case 3 — Opening Hours & Daily Timeline Enforcement:**  
   Verify that each day starts with `08:00` Breakfast, schedules attractions only within their valid `opening_time–closing_time`, inserts a midday Lunch Break, and concludes with an evening safe return to the hotel.
4. **Test Case 4 — Weather-Activity Risk & Safer Alternative System:**  
   On `/safety`, select `Trekking` or `Beach` or late-night `22:30` visit time → Risk level elevates to `MEDIUM`/`HIGH` and the **Safer Alternative System** recommends indoor museums/palaces and morning `08:30 AM – 11:30 AM` windows.
5. **Test Case 5 — Route A (Shortest) vs. Route B (AI Safe Route):**  
   On `/map`, select `India Gate` to `Red Fort (Lal Qila)` → Map renders **Route A (Red Dashed, Higher Risk)** vs **Route B (Emerald Solid, AI Recommended Safe Corridor)** with distance, duration, and risk reduction metrics.
6. **Test Case 6 — Honest Data Labeling (`Estimated Data` vs `Live API`):**  
   On `/transport`, inspect Local Metro/Bus/Cab and Intercity Train/Flight options → All formula-computed fares display explicit **`Estimated fare` / `ESTIMATED_DATA`** badges.
7. **Test Case 7 — Privacy-Preserving Incident Reporting:**  
   Submit a `Scam` alert on `/incidents` → Report is saved to SQLite, integrated into Scam Risk scoring, and displayed publicly as `"Anonymized Verified Traveler"`.
8. **Test Case 8 — 9-Step PDF Dataset Ingestion & Approval:**  
   On `/pdf`, click **"Parse ProjectCapstone PDF Dataset"** → Extracts records via `pypdf`, validates Indian coordinate bounds (`6°N–38°N, 68°E–98°E`), allows inline cell editing, and requires explicit **Approve & Commit** before DB insertion.
9. **Test Case 9 — Multi-Page PDF Itinerary Export:**  
   Click **"Download Full PDF Itinerary"** on `/planner` → Downloads a formatted `ReportLab` PDF containing trip summary, itemized budget table, day-by-day timeline, transport/metro notes, and emergency helplines (`112`, `1363`, `1091`).
10. **Test Case 10 — ML Model Evaluation & Live Retraining:**  
    Open `/ml-dashboard` → Inspect Accuracy, Precision, Recall, F1-Score, 3×3 Confusion Matrix, and Feature Importance across Random Forest, Decision Tree, and Logistic Regression for all 4 `.pkl` models.

