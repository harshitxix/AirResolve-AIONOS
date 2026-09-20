import json
import os
from dotenv import load_dotenv
# Load .env from backend directory and working directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path)
load_dotenv()

from typing import TypedDict, Dict
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from agent.state import AgentState
from agent.prompts import SYSTEM_PROMPT, INTENT_PROMPT
from tools.customer_tools import lookup_customer
from tools.booking_tools import lookup_booking
from tools.action_tools import (
    initiate_refund, request_rebooking, issue_meal_voucher, 
    provide_lounge_access, arrange_hotel, create_escalation, create_audit_record
)
from policies.engine import evaluate_disruption, check_fare_waiver_authority
from models.data_models import Customer, Booking


def _get_content_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
            elif hasattr(part, "text"):
                text_parts.append(part.text)
        return "".join(text_parts)
    return str(content)

# We instantiate a lightweight wrapper for the LLM
def get_llm():
    model_name = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")
    api_key = os.environ.get("GOOGLE_API_KEY")
    return ChatGoogleGenerativeAI(model=model_name, api_key=api_key, temperature=0)

def understand_intent(state: AgentState) -> AgentState:
    llm = get_llm()
    prompt = INTENT_PROMPT.format(user_input=state["user_input"])
    # In a real app we'd parse JSON reliably, using output parsers or structured output
    # For now we ask the model for JSON and strip backticks.
    response = llm.invoke([HumanMessage(content=prompt)])
    content = _get_content_text(response.content).strip()
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
        
    try:
        parsed = json.loads(content)
        state["intent"] = parsed.get("intent")
        state["requested_action"] = parsed.get("requested_action")
        
        entities = parsed.get("entities", {})
        if entities.get("customer_name") and not state.get("customer"):
            cust = lookup_customer(entities["customer_name"])
            if cust:
                state["customer"] = cust
        
        if entities.get("pnr") and not state.get("booking"):
            book = lookup_booking(entities["pnr"])
            if book:
                state["booking"] = book
                
        # If the customer provides a PNR and we have no customer, link it
        if state.get("booking") and not state.get("customer"):
            cust = lookup_customer(state["booking"].customer)
            if cust:
                state["customer"] = cust
                
    except Exception as e:
        state["intent"] = "unclear_request"
        
    return state

def evaluate_policy(state: AgentState) -> AgentState:
    if state.get("booking") and state.get("customer"):
        result = evaluate_disruption(state["booking"], state["customer"])
        state["policy_result"] = result
    return state

def validate_action(state: AgentState) -> AgentState:
    state["requires_escalation"] = False
    state["escalation_reason"] = None
    
    intent = state.get("intent")
    entitlements = state.get("policy_result").entitlements if state.get("policy_result") else None
    
    if not entitlements:
        return state
        
    if intent == "legal_threat" or intent == "complaint":
        state["requires_escalation"] = True
        state["escalation_reason"] = "Legal threat or formal complaint"
        return state
        
    if intent == "fare_difference":
        # For assignment, assume we mock the parsing of a fare difference, or the test handles it.
        # Let's say we check if fare difference is > 1500.
        # In a real implementation we'd extract this exact amount.
        pass
        
    if intent == "hotel_accommodation" and not entitlements.hotel_accommodation:
        state["requires_escalation"] = True
        state["escalation_reason"] = "Hotel requested but delay < 5 hours"
    
    if intent == "refund" and not entitlements.refund_eligible:
        state["requires_escalation"] = True
        state["escalation_reason"] = "Refund requested but not eligible (non-airline caused or not cancelled)"

    # Example checks could go here. Let's keep it simple.
    
    # Check fare difference manually based on a hardcoded keyword for demo purposes, 
    # or rely on the LLM to extract requested fare diff.
    return state

def execute_action(state: AgentState) -> AgentState:
    if not state.get("actions_taken"):
        state["actions_taken"] = []
        
    intent = state.get("intent")
    pnr = state.get("booking").pnr if state.get("booking") else "UNKNOWN"
    customer_name = state.get("customer").name if state.get("customer") else "UNKNOWN"
    
    if state.get("requires_escalation"):
        esc = create_escalation(customer_name, pnr, state.get("escalation_reason"), intent, "Multiple", "Supervisor approval required")
        state["actions_taken"].append(esc)
    else:
        if intent == "refund":
            res = initiate_refund(pnr)
            state["actions_taken"].append(res)
            create_audit_record(customer_name, pnr, intent, "Cancellation Rebooking Rule", "EXECUTE", "Eligible for refund", "Refund initiated")
        elif intent == "rebooking":
            res = request_rebooking(pnr, "Next Available", "Within 24h")
            state["actions_taken"].append(res)
            create_audit_record(customer_name, pnr, intent, "Cancellation Rebooking Rule", "EXECUTE", "Eligible for rebooking", "Rebooked")
        elif intent == "meal_voucher":
            res = issue_meal_voucher(pnr)
            state["actions_taken"].append(res)
            create_audit_record(customer_name, pnr, intent, "Delay Rule", "EXECUTE", "Eligible for meal", "Meal voucher issued")
        elif intent == "lounge_access":
            res = provide_lounge_access(pnr)
            state["actions_taken"].append(res)
            create_audit_record(customer_name, pnr, intent, "Delay Rule", "EXECUTE", "Eligible for lounge", "Lounge access granted")
        elif intent == "hotel_accommodation" and state["policy_result"].entitlements.hotel_accommodation:
            res = arrange_hotel(pnr)
            state["actions_taken"].append(res)
            create_audit_record(customer_name, pnr, intent, "Delay > 5 Hours Rule", "EXECUTE", "Eligible for hotel", "Hotel arranged")

    return state

def generate_response(state: AgentState) -> AgentState:
    llm = get_llm()
    customer_info = state.get("customer").model_dump_json() if state.get("customer") else "Unknown"
    booking_info = state.get("booking").model_dump_json() if state.get("booking") else "Unknown"
    policy_info = state.get("policy_result").model_dump_json() if state.get("policy_result") else "Unknown"
    actions_info = json.dumps(state.get("actions_taken", []))
    
    sys_prompt = SYSTEM_PROMPT.format(
        customer=customer_info,
        booking=booking_info,
        policy_result=policy_info,
        actions_taken=actions_info,
        requires_escalation=state.get("requires_escalation", False),
        escalation_reason=state.get("escalation_reason", "None")
    )
    
    messages = []
    messages.append(SystemMessage(content=sys_prompt))
    for m in state.get("messages", []):
        messages.append(HumanMessage(content=m["content"]) if m["role"] == "user" else SystemMessage(content=m["content"]))
    
    messages.append(HumanMessage(content=state["user_input"]))
    
    response = llm.invoke(messages)
    agent_text = _get_content_text(response.content)
    state["agent_response"] = agent_text
    
    if not state.get("messages"):
        state["messages"] = []
    state["messages"].append({"role": "user", "content": state["user_input"]})
    state["messages"].append({"role": "agent", "content": agent_text})
    
    return state

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("understand", understand_intent)
    workflow.add_node("evaluate", evaluate_policy)
    workflow.add_node("validate", validate_action)
    workflow.add_node("execute", execute_action)
    workflow.add_node("respond", generate_response)
    
    workflow.set_entry_point("understand")
    workflow.add_edge("understand", "evaluate")
    workflow.add_edge("evaluate", "validate")
    workflow.add_edge("validate", "execute")
    workflow.add_edge("execute", "respond")
    workflow.add_edge("respond", END)
    
    return workflow.compile()

