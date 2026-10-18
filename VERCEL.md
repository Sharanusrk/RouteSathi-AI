# Deploying SafeTrip AI to Vercel

The root `vercel.toml` config deploys the Vite frontend and FastAPI backend as two Vercel services on one domain. `/api/*` and the API documentation paths go to FastAPI; other paths go to the frontend.

## Before the first production deploy

1. Connect a persistent PostgreSQL database to the Vercel project (for example, through a Vercel Marketplace Postgres provider).
2. Set `DATABASE_URL` to the provider's PostgreSQL connection string and `JWT_SECRET_KEY` to a newly generated secret in the Vercel project environment variables. Do not use the development values from `backend/.env.example` in production.
3. Deploy from the repository root with the Vercel CLI, or import the repository in Vercel. Use the repository root as the project root so `vercel.toml` can configure both services.

The backend accepts PostgreSQL URLs and uses the `psycopg2-binary` driver. Its default SQLite database is for local development; Vercel function files are not durable storage. PDF uploads and generated exports currently use local folders, so those files need object storage before relying on them in production.

## Local VS Code setup

Open **Terminal → Run Task…** and choose **SafeTrip: Start all**. To install dependencies in a fresh checkout, run **SafeTrip: Install backend dependencies** and **SafeTrip: Install frontend dependencies** first.
