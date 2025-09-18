import re
from datetime import datetime

def validate_aadhaar(aadhaar):
    """Validates 12-digit Aadhaar number format."""
    return aadhaar.isdigit() and len(aadhaar) == 12

def validate_voter_id(voter_id):
    """Validates Indian Voter ID format (e.g., ABC1234567)."""
    return re.match(r'^[A-Z]{3}[0-9]{7}$', voter_id.upper()) is not None

def validate_indian_phone(phone):
    """Validates 10-digit Indian mobile number format."""
    return re.match(r'^[6-9]\d{9}$', phone) is not None

def calculate_age(dob_str):
    """Calculates age from a 'YYYY-MM-DD' date string."""
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d')
        today = datetime.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except (ValueError, TypeError):
        return 0