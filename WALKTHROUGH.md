# CyberVision AI — Project Execution Walkthrough

This walkthrough provides complete instructions to configure, run, and verify the **CyberVision AI** Threat Intelligence and Vulnerability Management platform.

---

## 1. System Architecture Overview

CyberVision AI consists of two primary applications working together:

1. **Backend Service (`backend/`)**:
   - Built with **FastAPI**, **APScheduler**, and **Firebase Admin SDK**.
   - Handles automated threat scraping (NVD API, RSS feeds), threat intelligence processing, analytics, and notification dispatching.
   - Default Port: `8000`.

2. **Frontend Web App (`frontend/`)**:
   - Built with **Next.js 16**, **React 19**, **Tailwind CSS**, and **Chart.js**.
   - Provides a real-time Security Operations Center (SOC) dashboard for viewing threat metrics, active vulnerabilities, analyst notes, and generating reports.
   - Default Port: `3000`.

---

## 2. Prerequisites & Environment Setup

Before starting, ensure you have the following installed on your system:

- **Python 3.10+** (with `pip` and `venv`)
- **Node.js v18+** or **v20+** (with `npm`)
- **Firebase Service Account Credentials**: JSON file located at root (e.g. `cybervisionai-35391-firebase-adminsdk-fbsvc-8862f9826d.json`)

---

## 3. Step-by-Step Execution Guide

### Phase A: Starting the Backend API

1. **Open Terminal** and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Activate Virtual Environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

3. **Install Required Python Dependencies** (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify Environment Variables (`.env`)**:
   Ensure `backend/.env` contains valid parameters:
   ```env
   ENV=development
   DEBUG=True
   FIREBASE_PROJECT_ID=cybervisionai-35391
   FIREBASE_CREDENTIALS_PATH=d:/cybervision/cybervisionai-35391-firebase-adminsdk-fbsvc-8862f9826d.json
   NVD_API_KEY=ffe133eb-5c4d-4039-b5aa-338912a17059
   ```

5. **Launch Backend Server**:
   ```bash
   python main.py
   ```
   *Alternatively, run with Uvicorn directly:*
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Verify Backend Health**:
   - Visit `http://localhost:8000/` in your browser. Expected output:
     ```json
     {
       "status": "online",
       "service": "CyberVision AI",
       "version": "1.0.0",
       "database": "connected"
     }
     ```
   - Interactive API Docs are accessible at `http://localhost:8000/docs`.

---

### Phase B: Starting the Frontend Dashboard

1. **Open a New Terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **Install Node Modules**:
   ```bash
   npm install
   ```

3. **Launch Next.js Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Dashboard**:
   - Open `http://localhost:3000` in your web browser to view the SOC dashboard.

---

## 4. Verification & Testing

| Service / Test | Location / Command | Expected Output |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | CyberVision AI interactive dashboard UI |
| **Backend API Health** | `http://localhost:8000/` | `{"status": "online", "database": "connected"}` |
| **OpenAPI / Swagger Docs** | `http://localhost:8000/docs` | Interactive Swagger endpoint explorer |
| **Backend Unit Tests** | `cd backend && pytest` | Executes test suite for threat repositories & scrapers |

---

## 5. Troubleshooting Common Issues

- **Firebase Credentials File Error**:
  If backend fails with `FileNotFoundError`, verify `FIREBASE_CREDENTIALS_PATH` in `backend/.env` points to your absolute service account `.json` file.

- **Port 8000 or 3000 In Use**:
  If port 8000 is occupied, launch uvicorn on another port: `uvicorn main:app --port 8001 --reload` and update `API_BASE_URL` in `frontend/utils/api.ts`.

---

## 6. PDF Document

A downloadable PDF document has been generated and saved to:
`CyberVision_AI_Execution_Guide.pdf`
