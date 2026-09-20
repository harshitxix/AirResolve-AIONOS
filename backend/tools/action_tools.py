from typing import Dict, Any
from datetime import datetime
import json
import os

AUDIT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'audit_log.json')

def _ensure_audit_file():
    if not os.path.exists(AUDIT_FILE):
        with open(AUDIT_FILE, 'w') as f:
            json.dump([], f)

def create_audit_record(customer: str, pnr: str, intent: str, policy_checked: str, decision: str, reason: str, action: str) -> Dict[str, Any]:
    _ensure_audit_file()
    record = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "customer": customer,
        "pnr": pnr,
        "intent": intent,
        "policy_checked": policy_checked,
        "decision": decision,
        "reason": reason,
        "action": action
    }
    
    with open(AUDIT_FILE, 'r+') as f:
        logs = json.load(f)
        logs.append(record)
        f.seek(0)
        json.dump(logs, f, indent=2)
        
    return record

def create_escalation(customer: str, pnr: str, reason: str, requested_action: str, policy_reference: str, agent_message: str) -> Dict[str, Any]:
    escalation = {
        "status": "ESCALATED",
        "reason": reason,
        "customer": customer,
        "pnr": pnr,
        "requested_action": requested_action,
        "policy_reference": policy_reference,
        "agent_message": agent_message,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    create_audit_record(customer, pnr, "escalation", policy_reference, "ESCALATE", reason, "Supervisor approval required")
    return escalation

def initiate_refund(pnr: str, amount: str = "full", method: str = "original payment method") -> Dict[str, Any]:
    return {"status": "SUCCESS", "action": "Refund initiated", "amount": amount, "method": method, "timeframe": "7 business days"}

def request_rebooking(pnr: str, route: str, date: str) -> Dict[str, Any]:
    return {"status": "SUCCESS", "action": "Rebooked on next available flight within 24h", "route": route, "date": date}

def issue_meal_voucher(pnr: str) -> Dict[str, Any]:
    return {"status": "SUCCESS", "action": "Meal voucher issued (₹500)"}

def provide_lounge_access(pnr: str) -> Dict[str, Any]:
    return {"status": "SUCCESS", "action": "Lounge access granted"}

def arrange_hotel(pnr: str) -> Dict[str, Any]:
    return {"status": "SUCCESS", "action": "Hotel accommodation arranged for delayed hours only"}

