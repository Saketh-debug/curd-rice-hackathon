# 🛡️ SOAR Platform (Security Orchestration, Automation, and Response)

An intelligent, next-generation Security Operations Center (SOC) platform powered by **Machine Learning (Multi-Class XGBoost)**, **Reinforcement Learning (Contextual Bandit)**, and **AI SOC Assistance**.

---

## 🚀 Key Features

- **🌐 Dual SOC Portals**:
  - **Client Portal (Portal A - Monitoring & Command)**:
    - Real-time system health and automation rate metrics
    - Command Center with live telemetry stream
    - Interactive Global Threat Geospatial Map (Leaflet)
    - Full network packet event inspection stream
  - **Admin Portal (Portal B - Analyst Review & Policy Control)**:
    - Analyst Incident Queue for borderline threats
    - Human-in-the-Loop (HITL) Decision Feedback: Analysts can manually BLOCK or IGNORE threats
    - **Adaptive Contextual Bandit**: Reinforcement learning model that shifts confidence thresholds dynamically based on analyst feedback
    - Policy Configuration & Decision Timeline
    - Security Audit Reports & CSV Export
- **🤖 Master AI SOC Assistant**:
  - Floating AI widget available on all screens
  - Real-time streaming incident analysis, IP query inspection, and SOC advisory
- **⚡ Resilient Architecture**:
  - Auto-fallback between PostgreSQL and SQLite
  - Automatic synthetic telemetry generation (CIC-IDS2017 schema) if dataset logs are missing
  - Modular FastAPI backend with full Swagger/OpenAPI documentation

---

## 📁 Project Structure

```
Soar_Platform/
├── frontend/               # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Reusable components & Master AI Floating Widget
│   │   ├── features/
│   │   │   ├── client/     # Portal A (Monitoring, Map, Event Stream)
│   │   │   └── admin/      # Portal B (Queue, Policy, Compliance, Timeline)
│   │   └── api/            # Axios API client configured for backend
├── server/                 # FastAPI Backend & ML Models
│   ├── ai/                 # Master AI routing, RAG, and LLM streaming
│   ├── main.py             # FastAPI entrypoint & background traffic simulator
│   ├── database.py         # SQLAlchemy models (PostgreSQL / SQLite fallback)
│   ├── bandit_model.joblib # Trained Adaptive Bandit model
│   ├── multiclass_xgboost_ids.joblib # 7-class attack detector
│   ├── feature_columns.json# 52 network flow features (CIC-IDS2017)
│   └── generate_simulation_log.py # Synthetic traffic packet generator
├── run_backend.bat / .ps1  # Quick start script for backend
├── run_frontend.bat / .ps1 # Quick start script for frontend
└── venv/                   # Python virtual environment
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: 3.10+ (tested on Python 3.11)

### 2. Running the Backend
From the root directory, simply run:
```powershell
.\run_backend.ps1
```
*Or using command line directly:*
```powershell
.\venv\Scripts\activate
cd server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI server will start on **`http://localhost:8000`**.
API documentation is available at **`http://localhost:8000/docs`**.

### 3. Running the Frontend
In a separate terminal, run:
```powershell
.\run_frontend.ps1
```
*Or using npm directly:*
```powershell
cd frontend
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## ⚙️ Configuration & Database

The backend automatically detects database connectivity:
1. If PostgreSQL is running on `localhost:5432` with credentials in `.env`, it connects to PostgreSQL.
2. If PostgreSQL is not active, it automatically falls back to a local SQLite database (`server/idsdashboard.db`) with zero manual setup required.

To customize the database URL, copy `server/.env.example` to `server/.env`:
```ini
DATABASE_URL=sqlite:///./idsdashboard.db
```
To configure frontend API endpoint, copy `frontend/.env.example` to `frontend/.env`:
```ini
VITE_API_BASE_URL=http://localhost:8000/api
```
