import json
import os
import traceback
from dotenv import load_dotenv

# Load environment variables from .env
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from agent.graph import build_graph
from agent.state import AgentState

app = FastAPI(title="AirResolve AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()

class ChatRequest(BaseModel):
    user_input: str
    session_id: str
    customer_context: Optional[dict] = None
    booking_context: Optional[dict] = None
    messages: List[Dict[str, str]] = []

# Global in-memory state store for the assignment demo
SESSION_STORE = {}

@app.get("/")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AirResolve AI Backend"}

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    session_id = request.session_id
    if session_id not in SESSION_STORE:
        SESSION_STORE[session_id] = {
            "messages": [],
            "customer": None,
            "booking": None,
            "actions_taken": []
        }
        
    state = SESSION_STORE[session_id]
    state["user_input"] = request.user_input

    # If frontend supplied customer/booking context and state doesn't have it, hydrate it
    if request.customer_context and not state.get("customer"):
        from models.data_models import Customer
        try:
            state["customer"] = Customer(**request.customer_context)
        except Exception:
            pass

    if request.booking_context and not state.get("booking"):
        from models.data_models import Booking
        try:
            state["booking"] = Booking(**request.booking_context)
        except Exception:
            pass

    try:
        # Run graph
        new_state = graph.invoke(state)
        # Save back to store
        SESSION_STORE[session_id] = new_state

        return {
            "response": new_state.get("agent_response"),
            "customer": new_state.get("customer"),
            "booking": new_state.get("booking"),
            "policy_result": new_state.get("policy_result"),
            "actions_taken": new_state.get("actions_taken", []),
            "requires_escalation": new_state.get("requires_escalation", False),
            "escalation_reason": new_state.get("escalation_reason")
        }
    except Exception as e:
        print("Error during graph execution:", traceback.format_exc())
        return {
            "response": f"I apologize, but I encountered an internal error processing your request: {str(e)}. Please check the server logs.",
            "customer": state.get("customer"),
            "booking": state.get("booking"),
            "policy_result": state.get("policy_result"),
            "actions_taken": state.get("actions_taken", []),
            "requires_escalation": True,
            "escalation_reason": f"System error: {str(e)}"
        }

@app.get("/audit")
def get_audit_logs():
    audit_file = os.path.join(os.path.dirname(__file__), 'data', 'audit_log.json')
    if os.path.exists(audit_file):
        with open(audit_file, 'r') as f:
            return json.load(f)
    return []

@app.post("/load_scenario")
def load_scenario(scenario: str, session_id: str):
    from tools.customer_tools import lookup_customer
    from tools.booking_tools import lookup_booking
    
    SESSION_STORE[session_id] = {
        "messages": [],
        "customer": None,
        "booking": None,
        "actions_taken": []
    }
    
    state = SESSION_STORE[session_id]
    
    if scenario == "priya":
        state["customer"] = lookup_customer("Priya Nair")
        state["booking"] = lookup_booking("SK4821X")
    elif scenario == "arvind":
        state["customer"] = lookup_customer("Arvind Kulkarni")
        state["booking"] = lookup_booking("TR1190B")
    elif scenario == "meher":
        state["customer"] = lookup_customer("Meher Kaur")
        state["booking"] = lookup_booking("WL7742")
        
    return {"status": "success", "customer": state["customer"], "booking": state["booking"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
