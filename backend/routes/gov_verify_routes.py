from flask import Blueprint, request, jsonify
import time
import re

gov_verify_bp = Blueprint('gov_verify_bp', __name__)

# --- SIMULATED GOVERNMENT API LOGIC ---
# In a real-world scenario, these functions would make secure API calls.
# Here, we simulate them with logic to return different results for testing.

def simulate_uidai_verification(aadhar_number, full_name):
    """Simulates a call to the UIDAI database for Aadhaar verification."""
    time.sleep(1.2) # Simulate network delay

    # 1. Format Check
    if not re.match(r'^\d{12}$', aadhar_number):
        return {"status": "INVALID", "message": "Aadhaar format is incorrect (must be 12 digits)."}

    # 2. Simulation Logic (based on Aadhaar number patterns for testing)
    last_digit = int(aadhar_number[-1])
    
    if last_digit == 0:
        return {"status": "FORGED", "message": "Aadhaar number not found in UIDAI database.", "confidence": 0.95}
    elif last_digit <= 2:
        return {"status": "SUSPICIOUS", "message": "Data mismatch. Name or DOB does not match Aadhaar record.", "confidence": 0.60}
    
    return {"status": "VERIFIED", "message": "Aadhaar details successfully verified with UIDAI.", "confidence": 0.99}


def simulate_eci_verification(voter_id, full_name):
    """Simulates a call to the Election Commission of India database."""
    time.sleep(0.8) # Simulate network delay
    
    # 1. Format Check
    if not re.match(r'^[A-Z]{3}\d{7}$', voter_id):
        return {"status": "INVALID", "message": "Voter ID format is incorrect (e.g., ABC1234567)."}

    # 2. Simulation Logic
    if voter_id.startswith("XXX"):
        return {"status": "FORGED", "message": "Voter ID does not exist in the electoral roll.", "confidence": 0.98}
    elif voter_id.startswith("SUS"):
        return {"status": "SUSPICIOUS", "message": "Voter ID is valid but flagged for inactivity.", "confidence": 0.70}
    
    return {"status": "VERIFIED", "message": "Voter ID successfully verified with ECI electoral roll.", "confidence": 0.98}


@gov_verify_bp.route('/verify-government-ids', methods=['POST'])
def verify_ids():
    data = request.json
    aadhar_number = data.get('aadhar_number')
    voter_id = data.get('voter_id').upper()
    full_name = data.get('full_name')

    if not aadhar_number or not voter_id:
        return jsonify({"error": "Aadhaar and Voter ID are required."}), 400

    # Get results from our simulated services
    aadhar_result = simulate_uidai_verification(aadhar_number, full_name)
    eci_result = simulate_eci_verification(voter_id, full_name)

    # Determine overall status
    overall_status = "VERIFIED"
    if aadhar_result['status'] in ["FORGED", "INVALID"] or eci_result['status'] in ["FORGED", "INVALID"]:
        overall_status = "REJECTED"
    elif aadhar_result['status'] == "SUSPICIOUS" or eci_result['status'] == "SUSPICIOUS":
        overall_status = "FLAGGED_FOR_REVIEW"

    # Prepare final report
    response = {
        "success": True,
        "overall_status": overall_status,
        "verification_report": {
            "uidai_aadhaar": aadhar_result,
            "eci_voter_id": eci_result
        },
        "timestamp": time.time()
    }
    
    return jsonify(response)