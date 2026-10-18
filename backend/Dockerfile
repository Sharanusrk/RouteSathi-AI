# Multi-platform Python base image
FROM python:3.11-slim

WORKDIR /app

# Set Python environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy ML models, datasets, and backend application source
COPY ml /app/ml
COPY Dataset /app/Dataset
COPY backend /app/backend

# Create directory structure for SQLite DB, uploads, exports
RUN mkdir -p /app/data/pdf_datasets /app/data/uploads /app/data/exports

WORKDIR /app/backend

EXPOSE 8000

CMD ["python", "run.py"]
