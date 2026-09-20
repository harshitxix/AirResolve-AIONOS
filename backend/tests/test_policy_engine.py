import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.data_models import Customer, Booking, PolicyEvaluationResult
from policies.engine import evaluate_disruption, check_fare_waiver_authority

def test_priya_cancellation_eligible():
    customer = Customer(name="Priya", loyalty_tier="Gold", booking_reference="SK4821X", email="p@example.com", phone="123", travel_history_flights_12m=6)
    booking = Booking(pnr="SK4821X", customer="Priya", flight="SK-204", route="Delhi-Goa", date="2026-09-23", scheduled_departure="18:40", status="Cancelled", is_airline_caused=True)
    
    result = evaluate_disruption(booking, customer)
    assert result.entitlements.free_rebooking is True
    assert result.entitlements.refund_eligible is True
    assert result.entitlements.priority_rebooking is True

def test_arvind_4_hour_delay():
    customer = Customer(name="Arvind", loyalty_tier="Silver", booking_reference="TR1190B", email="a@example.com", phone="123", travel_history_flights_12m=3)
    booking = Booking(pnr="TR1190B", customer="Arvind", flight="SK-118", route="MUM-BLR", date="2026-09-23", scheduled_departure="07:10", status="Delayed 4 hours", delay_hours=4, is_airline_caused=True)
    
    result = evaluate_disruption(booking, customer)
    assert result.entitlements.meal_voucher is True
    assert result.entitlements.lounge_access is True
    assert result.entitlements.hotel_accommodation is False

def test_meher_6_hour_delay():
    customer = Customer(name="Meher", loyalty_tier="Platinum", booking_reference="WL7742", email="m@example.com", phone="123", travel_history_flights_12m=10)
    booking = Booking(pnr="WL7742", customer="Meher", flight="SK-305", route="DEL-HYD", date="2026-09-23", scheduled_departure="14:00", status="Delayed 6 hours", delay_hours=6, is_airline_caused=True)
    
    result = evaluate_disruption(booking, customer)
    assert result.entitlements.meal_voucher is True
    assert result.entitlements.lounge_access is True
    assert result.entitlements.hotel_accommodation is True
    assert result.entitlements.hotel_scope == "delayed hours only"
    assert result.entitlements.priority_rebooking is True

def test_fare_waiver_authority():
    assert check_fare_waiver_authority(1000) is True
    assert check_fare_waiver_authority(1500) is True
    assert check_fare_waiver_authority(1501) is False
    assert check_fare_waiver_authority(2000) is False

