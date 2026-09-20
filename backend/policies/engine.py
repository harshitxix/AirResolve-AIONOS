from models.data_models import Booking, Customer, Entitlements, PolicyEvaluationResult

def evaluate_disruption(booking: Booking, customer: Customer) -> PolicyEvaluationResult:
    """
    Evaluates the disruption and calculates deterministic entitlements based on closed-world policies.
    """
    entitlements = Entitlements()
    applied_policies = []
    notes = []

    # 1. Cancellation Policy
    if booking.status.lower() == "cancelled":
        if booking.is_airline_caused:
            entitlements.free_rebooking = True
            entitlements.refund_eligible = True
            applied_policies.append("Cancellation Rebooking Rule")
            notes.append("Customer is eligible for free rebooking on next available flight within 24h OR full refund.")
        else:
            notes.append("Cancellation is not airline-caused. Standard waiver may not apply.")

    # 2. Delay Policy
    if booking.delay_hours is not None and booking.delay_hours > 0:
        delay = booking.delay_hours
        
        if delay < 3:
            entitlements.meal_voucher = True
            applied_policies.append("Delay < 3 Hours Rule")
            notes.append("Customer is eligible for ₹500 meal voucher.")
            
        elif 3 <= delay <= 5:
            entitlements.meal_voucher = True
            entitlements.lounge_access = True
            applied_policies.append("Delay > 3 Hours Rule")
            notes.append("Customer is eligible for meal voucher and lounge access.")
            
        elif delay > 5:
            entitlements.meal_voucher = True
            entitlements.lounge_access = True
            entitlements.hotel_accommodation = True
            entitlements.hotel_scope = "delayed hours only"
            applied_policies.append("Delay > 5 Hours Rule")
            notes.append("Customer is eligible for meal voucher, lounge access, and hotel accommodation (ONLY for delayed hours, NOT a full night's stay).")

    # 3. Loyalty Policy
    if customer.loyalty_tier in ["Gold", "Platinum"]:
        entitlements.priority_rebooking = True
        applied_policies.append(f"{customer.loyalty_tier} Loyalty Rule")
        notes.append("Customer gets priority rebooking and first access to next available seats. No additional compensation beyond standard policy.")

    return PolicyEvaluationResult(
        entitlements=entitlements,
        applicable_policies=applied_policies,
        notes=notes
    )

def check_fare_waiver_authority(fare_difference: float) -> bool:
    """
    Checks if the agent has authority to waive the given fare difference.
    Agent cannot waive fare differences ABOVE ₹1,500 without supervisor approval.
    """
    # 1500 limit is inclusive (above 1500 is not allowed)
    return fare_difference <= 1500.0
