# Deploying SafeTrip AI to Vercel

The repository root is a single Vercel FastAPI project. `pyproject.toml` points Vercel to `index.py`; its build script installs the frontend dependencies and builds the Vite app. FastAPI serves the frontend build with client-side route fallback and handles `/api/*` on the same domain.

## Before the first production deploy

1. Connect a persistent PostgreSQL database (Neon's free tier is a suitable starting point).
2. Set `DATABASE_URL` to the provider's PostgreSQL connection string and `JWT_SECRET_KEY` to a newly generated secret in the Vercel project environment variables. Do not use development values from `backend/.env.example` in production.
3. Deploy from the repository root.

The backend accepts PostgreSQL URLs and uses the `psycopg2-binary` driver. Its default SQLite database is for local development; Vercel function files are not durable storage. PDF uploads and generated exports currently use local folders, so those files need object storage before relying on them in production.

## Local VS Code setup

Open **Terminal → Run Task…** and choose **SafeTrip: Start all**. To install dependencies in a fresh checkout, run **SafeTrip: Install backend dependencies** and **SafeTrip: Install frontend dependencies** first.
