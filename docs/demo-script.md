# Demo Script: AirResolve AI (15 Minutes)

## Minute 0–2: Problem and Objective
"Welcome. Today I'm demonstrating AirResolve AI, an agent designed for the AIONOS Agentic AI Factory Assignment. Our objective is to build a customer-facing resolution agent for airline disruptions that adheres strictly to a closed-world dataset. It must not hallucinate, it must understand intent, apply deterministic policy, and escalate when authority is exceeded."

## Minute 2–4: Architecture
"Let's look at the architecture. We use a React frontend talking to a FastAPI backend. The core is orchestrated by LangGraph. We deliberately separated the probabilistic LLM (used for empathy and intent extraction) from the deterministic Policy Engine (used to calculate refunds, vouchers, and escalations). This ensures policy compliance."

## Minute 4–6: Data/Policy Engine
"Our data is stored in JSON files representing the closed-world assignment dataset. Let's look at the `policies/engine.py` script. Here, we calculate exact entitlements based on the disruption status and length of delay. No LLM hallucination is allowed here."

## Minute 6–9: Scenario 1 - Priya
"Let's load the Priya scenario. Her flight is cancelled."
*Click 'Priya (Cancellation)' button in UI.*
1. Send message: "My flight is cancelled. I want a refund."
   - Agent will process a full refund.
2. Send message: "I also want a free business class upgrade for my return flight."
   - Agent will escalate since this is not in the policy.

## Minute 9–11: Scenario 2 - Arvind
"Now Arvind. His flight is delayed 4 hours."
*Click 'Arvind (4h Delay)' button.*
1. Send message: "My flight is delayed. What compensation do I get?"
   - Agent offers meal voucher and lounge access.
2. Send message: "I want a hotel."
   - Agent politely refuses because the policy requires a delay of >5 hours for a hotel.

## Minute 11–13: Scenario 3 - Meher
"Finally, Meher. Her flight is delayed 6 hours."
*Click 'Meher (6h Delay)' button.*
1. Send message: "I need a hotel for the full night."
   - Agent explains she gets a hotel, but only for the delayed hours, not the full night.
2. Send message: "I want to rebook on a higher-fare flight. The difference is ₹2000."
   - Agent escalates, as the fare difference exceeds the ₹1500 authority limit.

## Minute 13–14: Audit Trail
"Notice the Resolution Panel on the right. Every action and escalation is logged automatically into the system audit trail, providing full observability."

## Minute 14–15: Conclusion
"In conclusion, AirResolve AI demonstrates a safe, intermediate-level Agentic AI architecture. It respects guardrails, handles edge cases gracefully, and ensures that deterministic business rules override probabilistic AI mistakes."
