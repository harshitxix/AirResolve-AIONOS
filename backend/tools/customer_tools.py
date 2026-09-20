import json
import os
from typing import Optional
from models.data_models import Customer

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def load_customers() -> dict:
    with open(os.path.join(DATA_DIR, 'customers.json'), 'r') as f:
        return json.load(f)

def lookup_customer(identifier: str) -> Optional[Customer]:
    """
    Looks up a customer by name, email, phone, or booking reference.
    """
    data = load_customers()
    for c_data in data.get("customers", []):
        if (identifier.lower() in c_data["name"].lower() or 
            identifier.lower() == c_data["email"].lower() or 
            identifier == c_data["phone"] or 
            identifier.upper() == c_data["booking_reference"].upper()):
            return Customer(**c_data)
    return None
