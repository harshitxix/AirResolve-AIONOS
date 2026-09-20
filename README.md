# ✈️ AirResolve AI — Autonomous Airline Disruption Resolution Agent

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://air-resolve-aionos.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://render.com/)
[![Orchestration](https://img.shields.io/badge/Orchestrator-LangGraph-FF6F00?style=for-the-badge&logo=python&logoColor=white)](https://python.langchain.com/)

**AirResolve AI** is an autonomous, customer-facing airline disruption resolution agent built for the **AIONOS Agentic AI Factory Assignment**. It combines LLM-driven conversational empathy and intent extraction with a strictly deterministic policy engine and hard guardrails to resolve flight cancellations, delays, rebookings, meal vouchers, and refunds with zero hallucinations.

---

## 🌐 Live Deployment

- 🚀 **Live Web App (Frontend)**: [https://air-resolve-aionos.vercel.app/](https://air-resolve-aionos.vercel.app/)
- ⚙️ **Backend Service**: Hosted on [Render](https://render.com/) (FastAPI + LangGraph + Google Gemini)

---

## 🎯 Key Features & Capabilities

- **Strict Closed-World Adherence**: Adheres exclusively to ground-truth customer records, live booking statuses, and policy definitions without hallucinating mock data.
- **Deterministic Policy Engine**: Entitlement calculations (compensation caps, meal vouchers, hotel accommodations, waiver limits) are evaluated deterministically in code, eliminating LLM arithmetic mistakes or policy drift.
- **Hard Guardrails & Auto-Escalation**:
  - Fare differences > ₹1,500 automatically escalate to a human supervisor.
  - Non-airline disruptions (e.g., severe weather / ATC directives) correctly restrict cash compensation while providing care entitlements.
  - Explicit customer requests for supervisor/legal intervention trigger immediate human escalation with full audit trail logging.
- **Real-Time Context Panel**: The UI displays live customer tier, current PNR status, calculated policy entitlements, and executed tool actions side-by-side with the chat.
- **1-Click Interactive Scenarios**: Pre-configured buttons to instantly test the core test personas:
  1. **Priya Nair (`SK4821X`)**: Flight cancelled due to airline technical issue (eligible for full refund / rebooking + meal voucher).
  2. **Arvind Kulkarni (`TR1190B`)**: Flight cancelled due to severe weather (eligible for free rebooking/refund, but non-airline cause restricts cash compensation).
  3. **Meher Kaur (`WL7742`)**: 6-hour airline operational delay (eligible for meal voucher, lounge access, hotel accommodation, and compensation).

---

## 🏗️ Architecture

```mermaid
flowchart TD
    C[Customer] --> UI[React + Tailwind UI (Vercel)]
    UI --> API[FastAPI Backend (Render)]
    
    subgraph Backend Services
        API --> Graph[LangGraph Orchestrator]
        Graph --> Intent[Intent & Entity Extraction (Gemini)]
        Graph --> Policy[Deterministic Policy Engine]
        Graph --> Tools[Mock Data & Execution Tools]
        
        Tools --> Data[(Closed-World JSON Datastores)]
        
        Policy --> Validator[Guardrail & Action Validator]
        Validator -->|Authorized| Act[Execute Tool: Rebook / Refund / Voucher]
        Validator -->|Exceeds Authority / Rule| Escalate[Escalate to Human Supervisor]
        
        Act --> Audit[(Persistent Audit Log)]
        Escalate --> Audit
    end
```

For complete architectural details, state machine flows, and guardrail specifications, see [`docs/architecture.md`](file:///c:/Users/harsh/OneDrive/Documents/Costumer%20Support%20Agent/airresolve-ai/docs/architecture.md).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons (Deployed on **Vercel**)
- **Backend API**: FastAPI, Pydantic, Uvicorn (Deployed on **Render**)
- **Agent Framework**: LangGraph, LangChain Core, `langchain-google-genai` (Google Gemini 1.5/2.0 Flash)
- **Testing**: Pytest

---

## 💻 Local Development Setup

### 1. Backend

```bash
cd backend
python -m venv venv

# Activate venv:
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create .env file with your API key
echo GOOGLE_API_KEY=your_gemini_api_key > .env

# Run FastAPI server
python main.py
```
The backend will be available at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run backend verification tests with:

```bash
cd backend
pytest tests/
```
