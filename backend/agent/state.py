from typing import TypedDict, List, Optional, Any, Dict
from models.data_models import Customer, Booking, PolicyEvaluationResult

class AgentState(TypedDict):
    # Conversation History
    messages: List[Dict[str, str]]
    
    # State entities
    customer: Optional[Customer]
    booking: Optional[Booking]
    intent: Optional[str]
    disruption_type: Optional[str]
    requested_action: Optional[str]
    delay_hours: Optional[int]
    
    # Policy Evaluation
    policy_result: Optional[PolicyEvaluationResult]
    allowed_action: Optional[str]
    
    # Escalation
    requires_escalation: bool
    escalation_reason: Optional[str]
    
    # Audit
    actions_taken: List[Dict[str, Any]]
    
    # Agent output
    agent_response: Optional[str]
    
    # Current input
    user_input: str
