# Outreach Pulse — Field Workforce & Grievance Intelligence Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.11-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57?logo=sqlite&logoColor=white)](https://www.sqlalchemy.org/)
[![Recharts](https://img.shields.io/badge/Charts-Recharts%20%2B%20Framer%20Motion-FF6384)](https://recharts.org/)

**Outreach Pulse** is an executive-grade operational intelligence dashboard designed for industrial manufacturing hubs and field operations (e.g., Okhla, Tiruppur, Peenya, Surat). It provides real-time visibility into worker enrollment, retention risk, grievance resolution lifecycles, and demographic distributions with Tableau-inspired executive visualization and single-page PDF export capabilities.

---

## 🌟 Key Features

- **Executive Tableau Dashboard**:
  - Curated Plum & Rose theme (`#6C1E37`, `#842846`, `#A94363`, `#C96C88`) with real-time KPI ribbons (Total Enrollees, Attrition Rate, Active Workforce, Average Age, Gender Ratio).
  - Age distribution histograms with configurable bin sizes (`1 Yr`, `2 Yrs`, `5 Yrs`).
  - Attrition by Department & Job Role donut charts.
  - Job Role vs. Risk Level cross-tab matrix heatmap with graduated cell shading.
  - Multi-ring radial gauge display for departmental attrition rate benchmark comparisons.

- **Automated CSV Ingestion & Fuzzy Matching**:
  - Drag-and-drop file upload for field attendance registers and grievance logs.
  - Levenshtein distance column header matching (`thefuzz`) to map non-standard field registers (`emp_name`, `center_loc`, etc.) to canonical database schemas.
  - Automated validation queue for missing or malformed rows.

- **High-Fidelity PDF & Print Export**:
  - Dedicated landscape `@media print` CSS engine calibrated for single-sheet executive briefings (`A4` / `US Letter` landscape).
  - Automatic exclusion of navigation bars, filter menus, and action buttons during print.
  - Built-in preview modal with quick export presets (Print / Save as PDF, Executive One-Pager, Data Tables).

- **Grievance Resolution Lifecycle Tracking**:
  - Multi-tier severity tracking (Severity 1 to 4) for workplace safety, wage issues, and harassment claims.
  - Status classification (`Open`, `In Progress`, `Resolved`) with turnaround time analytics.

---

## 🏗️ Project Architecture

```
AIDER/
├── backend/                         # FastAPI application & database layer
│   ├── database.py                  # SQLAlchemy ORM models (Enrollee, Grievance, UploadBatch)
│   ├── main.py                      # REST endpoints & CORS configuration
│   ├── requirements.txt             # Python dependencies
│   ├── seed.py                      # Synthetic data generation script
│   └── services.py                  # Fuzzy column matching & ReportLab PDF generator
│
├── frontend/                        # React 19 + TypeScript + Vite application
│   ├── public/                      # Static assets & public sample CSVs
│   ├── src/
│   │   ├── App.tsx                  # Main executive dashboard & state manager
│   │   ├── index.css                # Design tokens, Tableau styling & print media rules
│   │   └── main.tsx                 # React entry point
│   ├── package.json                 # Node dependencies & build scripts
│   └── vite.config.ts               # Vite configuration
│
├── sample_field_register.csv        # Ready-to-import sample worker attendance register
├── sample_worker_grievances.csv     # Ready-to-import sample grievance log
└── README.md                        # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18+` (v20+ recommended)
- **Python**: `v3.10+` (v3.11 recommended)
- **Package Managers**: `npm` and `pip` (or `uv`)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the SQLite database with initial records
python seed.py

# Launch FastAPI development server
python main.py
```
> The API server will start at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
> The web interface will run at `http://localhost:5173`.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/overview` | Retrieves aggregate metrics (total enrollees, active, grievances, resolved). | `centre` (optional) |
| `GET` | `/api/dashboard/enrollees` | Lists enrollees with assigned risk scores and statuses. | `centre` (optional) |
| `GET` | `/api/dashboard/grievances` | Lists logged grievances with status, severity, and category. | `centre` (optional) |
| `POST` | `/api/upload` | Ingests a `.csv` or `.xlsx` file using fuzzy column resolution. | `file` (multipart/form-data) |
| `GET` | `/api/reports/monthly` | Streams a generated monthly summary PDF report. | None |

---

## 📄 Sample Data Formats

The repository includes two pre-formatted sample datasets for testing:

1. **Worker Register (`sample_field_register.csv`)**:
   ```csv
   Name,Centre,Trade,AttendanceRate,RiskScore,Age,Gender,Status
   Asha Devi,Okhla Ph-1,Sewing Machine Operator,42,High,24,Female,Active
   Sunita Mehra,Tiruppur Hub,Quality Inspector,78,Low,31,Female,Active
   ```

2. **Grievance Log (`sample_worker_grievances.csv`)**:
   ```csv
   Reporter,Centre,Category,Severity,Status,ResolutionDays
   Kavita Singh,Okhla Ph-1,Unpaid Wages & Overtime,4,Open,14
   Mohammed Farooq,Okhla Ph-1,Verbal Abuse & Harassment,3,In Progress,7
   ```

---

## 🖨️ PDF & Printing Guide

To export an executive summary sheet:
1. Click **Export PDF** in the top navigation bar or press `Ctrl + P` / `Cmd + P`.
2. Select **"Save as PDF"** as the destination.
3. Ensure the print settings are configured to:
   - **Layout**: Landscape
   - **Paper Size**: A4 or Letter
   - **Margins**: Minimum / None (or Default)
   - **Options**: Enable **"Background graphics"** for accurate card and chart color rendering.

---

## 🛠️ Tech Stack & Libraries

- **Frontend**: React 19, TypeScript, Vite, Recharts, Framer Motion, Lucide React
- **Styling**: Vanilla CSS Design System with Tableau Palette tokens and `@media print` engine
- **Backend**: FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic
- **Data & Ingestion**: Pandas, TheFuzz, ReportLab
