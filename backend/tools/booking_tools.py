import json
import os
from typing import Optional
from models.data_models import Booking

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def load_bookings() -> dict:
    with open(os.path.join(DATA_DIR, 'bookings.json'), 'r') as f:
        return json.load(f)

def lookup_booking(pnr: str) -> Optional[Booking]:
    """
    Looks up a booking by PNR.
    """
    data = load_bookings()
    for b_data in data.get("bookings", []):
        if b_data["pnr"].upper() == pnr.upper():
            return Booking(**b_data)
    return None
