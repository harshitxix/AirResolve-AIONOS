from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class Customer(BaseModel):
    name: str
    loyalty_tier: Literal["Gold", "Platinum", "Silver", "Basic"]
    booking_reference: str
    email: str
    phone: str
    travel_history_flights_12m: int
    prior_complaint: Optional[str] = None

class Flight(BaseModel):
    route: str
    date: str
    scheduled_departure: str
    status: str

class Booking(BaseModel):
    pnr: str
    customer: str
    flight: str
    route: str
    date: str
    scheduled_departure: str
    status: str
    reason: Optional[str] = None
    is_airline_caused: bool = False
    return_flight: Optional[Flight] = None
    delay_hours: Optional[int] = None
    new_departure: Optional[str] = None

class Entitlements(BaseModel):
    free_rebooking: bool = False
    refund_eligible: bool = False
    meal_voucher: bool = False
    lounge_access: bool = False
    hotel_accommodation: bool = False
    hotel_scope: Optional[str] = None
    priority_rebooking: bool = False

class PolicyEvaluationResult(BaseModel):
    entitlements: Entitlements
    applicable_policies: List[str]
    notes: List[str] = []
