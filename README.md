# AirResolve AI

AirResolve AI is a customer-facing airline disruption resolution agent, built for the AIONOS Agentic AI Factory Assignment.

## Features

- **Closed-World Adherence**: Strictly adheres to the supplied dataset and avoids hallucination.
- **Deterministic Policy Engine**: Policy decisions are calculated deterministically to ensure accuracy, while LLMs handle intent extraction and conversational empathy.
- **Action Validation**: Hard guardrails to escalate requests that exceed the agent's authority (e.g., fare differences > ₹1,500, non-airline disruptions).
- **Beautiful UI**: Modern glassmorphic frontend built with React, Vite, and Tailwind CSS.

## Architecture

Please see `docs/architecture.md` for a detailed system design.

## How to Run Locally

### Backend
1. Navigate to `backend/`
2. Run `python -m venv venv`
3. Activate the virtual environment (`.\venv\Scripts\activate` on Windows, `source venv/bin/activate` on Mac/Linux)
4. Run `pip install -r requirements.txt`
5. Create a `.env` file in `backend/` and add `GOOGLE_API_KEY=your_gemini_api_key`
6. Start the server: `python main.py` or `uvicorn main:app --reload`
The backend will run on `http://localhost:8000`

### Frontend
1. Navigate to `frontend/`
2. Run `npm install`
3. Run `npm run dev`
4. Open the application in your browser (usually `http://localhost:5173`)

## Demo
Use the three quick-load demo buttons in the UI to seamlessly present the scenarios for Priya, Arvind, and Meher.
