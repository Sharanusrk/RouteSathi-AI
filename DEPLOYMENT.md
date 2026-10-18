# SafeTrip AI — Complete Production Deployment Guide

This guide covers all recommended methods to deploy **SafeTrip AI** (FastAPI backend, React Vite frontend, SQLite/PostgreSQL database, and 4 Scikit-Learn ML models).

---

## 📋 Architecture & Ports Summary

| Component | Technology | Default Port | Internal / Public URL |
| :--- | :--- | :--- | :--- |
| **Backend API** | FastAPI + Uvicorn + Scikit-Learn | `8000` | `http://localhost:8000` (Docs: `/docs`) |
| **Frontend UI** | React 18 + Vite + Tailwind + Leaflet | `80` (Docker) / `5173` (Dev) | `http://localhost` or `http://localhost:5173` |
| **Database** | SQLite (Default) or PostgreSQL | File / `5432` | `data/safetrip_ai.db` |
| **ML Inference** | Joblib (`.pkl` models) | Embedded | In-memory prediction engine |

---

## 🚀 Option 1: Docker Compose (Recommended for Any VPS / AWS EC2 / Local Server)

Docker Compose provides a single-command, isolated deployment where Nginx serves the React SPA and proxies all `/api` traffic directly to the FastAPI container without CORS headaches.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine + Docker Compose Plugin (Linux).

### 1. Build and Start All Containers
From the root directory (`ProjectCapstone/`):
```bash
docker compose up --build -d
```

### 2. Verify Deployment
- **Frontend Web App:** Open `http://localhost` (or `http://localhost:5173`)
- **Backend API & Swagger Docs:** Open `http://localhost:8000/docs`
- **Check Container Status:**
  ```bash
  docker compose ps
  ```
- **View Live Logs:**
  ```bash
  docker compose logs -f
  ```

### 3. Stop Containers
```bash
docker compose down
```
*(Your SQLite database, uploaded PDFs, and generated itineraries persist safely inside the `safetrip_data` Docker volume).*

---

## ☁️ Option 2: Free Cloud Deployment (Render + Vercel)

This is the easiest zero-cost deployment method for academic reviews, portfolio demonstrations, and external viva showcases.

### Part A: Deploy Backend on Render (Web Service)
1. Push your repository to **GitHub** (public or private).
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Fill in the service configuration:
   - **Name:** `safetrip-backend` (or your choice)
   - **Region:** Singapore / Frankfurt / Oregon (closest to your audience)
   - **Root Directory:** Leave blank (or `backend` if deploying only backend code)
   - **Environment:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd backend && python run.py
     ```
5. In **Environment Variables**, add:
   - `JWT_SECRET_KEY`: `your-secure-random-secret-key-2026`
   - `PORT`: `8000`
   - `DATABASE_URL`: `sqlite:///../data/safetrip_ai.db` *(or attach a free PostgreSQL database)*
6. Click **Deploy Web Service**.
7. Once live, Render gives you a public URL:  
   👉 `https://safetrip-backend.onrender.com` (Test it at `https://safetrip-backend.onrender.com/docs`).

---

### Part B: Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Select your GitHub repository.
3. In project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `frontend`
4. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_BASE`
   - **Value:** `https://safetrip-backend.onrender.com` *(your live Render backend URL, without trailing slash)*
5. Click **Deploy**.
6. Vercel generates your live frontend URL:  
   👉 `https://safetrip-ai.vercel.app`.

---

## 🐧 Option 3: Ubuntu Linux VPS (AWS EC2 / DigitalOcean / Linode)

For a traditional Linux virtual server with Nginx, Systemd daemon, and free Let's Encrypt SSL.

### 1. Update Server & Install Prerequisites
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx git curl
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/ProjectCapstone.git /var/www/safetrip
cd /var/www/safetrip
```

### 3. Setup Python Virtual Environment & Install Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 4. Create Systemd Service for Backend
Create `/etc/systemd/system/safetrip.service`:
```ini
[Unit]
Description=SafeTrip AI FastAPI Backend Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/safetrip/backend
Environment="PATH=/var/www/safetrip/.venv/bin"
Environment="PORT=8000"
Environment="HOST=127.0.0.1"
ExecStart=/var/www/safetrip/.venv/bin/python run.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable safetrip
sudo systemctl start safetrip
sudo systemctl status safetrip
```

### 5. Build Frontend Production Files
```bash
cd /var/www/safetrip/frontend
npm install
npm run build
```

### 6. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/safetrip`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # or your VPS public IP

    # Frontend Static Files
    location / {
        root /var/www/safetrip/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger Documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }
}
```
Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/safetrip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. (Optional) Enable Free HTTPS with SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📱 Option 4: Local LAN / Wi-Fi Demo (College Viva & Live Presentations)

To let professors, examiners, or team members access SafeTrip AI directly on their phones/laptops over the same Wi-Fi network:

### 1. Find Your Local IP Address
In PowerShell:
```powershell
ipconfig
```
Look for **IPv4 Address** (e.g., `192.168.1.35`).

### 2. Start the Backend
```powershell
cd backend
python run.py
```
*(Backend binds to `0.0.0.0:8000`, accepting connections across the local network).*

### 3. Start the Frontend with Host Exposure
```powershell
cd frontend
npm run dev -- --host
```
Vite will output:
```text
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.35:5173/
```
Now anyone on the same Wi-Fi can open `http://192.168.1.35:5173` on their smartphone or laptop and interact with the application in real time!

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Tourist User** | `user@safetrip.ai` | `user123` | AI Trip Planner, Interactive Map, Incident Reporting, PDF Export |
| **System Admin** | `admin@safetrip.ai` | `admin123` | ML Benchmarks, Admin CRUD, 9-Step PDF Pipeline Approvals |

---

## 🛠️ Production Verification Checklist

- [x] **CORS:** FastAPI CORS middleware accepts external origins.
- [x] **SPA Routing:** Nginx & Vercel rewrites forward non-asset URLs to `index.html`.
- [x] **Data Persistence:** Database file `data/safetrip_ai.db` is stored outside temporary directories.
- [x] **ML Models:** 4 `.pkl` models load seamlessly from disk or fall back automatically.
- [x] **External APIs:** Live weather & OSRM routing gracefully fall back to internal models if offline.
