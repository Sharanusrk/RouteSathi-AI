import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import Base, engine, SessionLocal
from app.database.seed import seed_database
from app.api import auth, places, recommendations, safety_transport, admin_ml_pdf


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if os.getenv("VERCEL"):
            from app.database.vercel_seed import seed_vercel_database
            seed_vercel_database(db)
        else:
            seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="SafeTrip AI – Intelligent Tourism Safety, Recommendation & Trip Planning API",
    description=(
        "MCA Final-Year Major Project API combining Hybrid AI Tourism Recommendation, "
        "Dynamic Day-by-Day Trip Planning, Multi-Factor AI Safety & Risk Prediction, "
        "Crowd & Weather Risk ML Models, NetworkX/OSRM Safe Routing, Multi-Modal Transport, "
        "and 9-Stage PDF Dataset Ingestion & PDF Itinerary Export."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(places.router)
app.include_router(recommendations.router)
app.include_router(safety_transport.router)
app.include_router(admin_ml_pdf.router)


if os.getenv("VERCEL"):
    # Vercel promotes these built files to its CDN and falls back to index.html
    # for client-side routes while FastAPI routes retain priority.
    app.frontend("/", directory="frontend/dist", fallback="index.html")
else:
    @app.get("/")
    def root():
        return {
            "name": "SafeTrip AI API",
            "tagline": "Plan Smarter. Travel Safer. Explore India.",
            "status": "operational",
            "docs_url": "/docs",
        }
