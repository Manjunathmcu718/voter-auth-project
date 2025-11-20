from flask import Blueprint, request, jsonify
import time

gov_verify_bp = Blueprint('gov_verify', __name__)

def verify_aadhar_with_uidai(aadhar_number, full_name, date_of_birth):
    """Simulated UIDAI Aadhaar verification"""
    time.sleep(1)  # Simulate API delay
    
    # Basic format validation
    if not aadhar_number or len(aadhar_number) != 12 or not aadhar_number.isdigit():
        return {
            "status": "INVALID",
            "message": "Invalid Aadhaar number format",
            "confidence": 0.0
        }
    
    # For demo purposes, accept all valid format Aadhaar numbers
    # In production, this would call real UIDAI API
    return {
        "status": "VERIFIED",
        "message": "Aadhaar verified with UIDAI database",
        "confidence": 0.98,
        "verified_fields": ["number", "name_match", "dob_match"]
    }

def verify_voter_id_with_eci(voter_id, full_name):
    """Simulated ECI Voter ID verification"""
    time.sleep(0.8)  # Simulate API delay
    
    # Basic format validation (3 letters + 7 digits)
    import re
    if not voter_id or not re.match(r'^[A-Z]{3}\d{7}$', voter_id):
        return {
            "status": "INVALID",
            "message": "Invalid Voter ID format",
            "confidence": 0.0
        }
    
    # For demo purposes, accept all valid format Voter IDs
    # In production, this would call real ECI API
    return {
        "status": "VERIFIED",
        "message": "Voter ID verified with Election Commission database",
        "confidence": 0.96,
        "verified_fields": ["voter_id", "name_match", "constituency_match"]
    }

def calculate_data_integrity_score(aadhar_number, voter_id, full_name):
    """Calculate data integrity score"""
    score = 100
    issues = []

    # Check for common fraud patterns
    if len(set(aadhar_number)) == 1:
        score -= 30
        issues.append("Aadhaar contains repeated digits")

    if '000' in voter_id or '999' in voter_id:
        score -= 20
        issues.append("Voter ID contains suspicious patterns")

    if not full_name or len(full_name) < 3:
        score -= 15
        issues.append("Invalid name format")

    return {
        "score": max(score, 0),
        "issues": issues,
        "grade": "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D"
    }

def calculate_overall_status(results):
    """Calculate overall verification status"""
    aadhar_status = results['aadhar_verification']['status']
    voter_status = results['voter_id_verification']['status']
    data_score = results['data_integrity_score']['score']

    if aadhar_status == "FORGED" or voter_status == "FORGED" or data_score < 50:
        return {
            "status": "REJECTED",
            "message": "Identity verification failed - suspected fraud"
        }

    if aadhar_status == "SUSPICIOUS" or voter_status == "SUSPICIOUS" or data_score < 70:
        return {
            "status": "FLAGGED_FOR_REVIEW",
            "message": "Identity verification requires manual review"
        }

    return {
        "status": "VERIFIED",
        "message": "All identity documents verified successfully"
    }

@gov_verify_bp.route('/api/gov-verify', methods=['POST'])
def verify_government_ids():
    try:
        data = request.get_json()
        
        aadhar_number = data.get('aadhar_number')
        voter_id = data.get('voter_id')
        full_name = data.get('full_name')
        date_of_birth = data.get('date_of_birth')

        if not aadhar_number or not voter_id:
            return jsonify({'error': 'Missing required fields'}), 400

        # Perform verification
        verification_results = {
            'aadhar_verification': verify_aadhar_with_uidai(aadhar_number, full_name, date_of_birth),
            'voter_id_verification': verify_voter_id_with_eci(voter_id, full_name),
            'data_integrity_score': calculate_data_integrity_score(aadhar_number, voter_id, full_name)
        }

        # Calculate overall status
        overall_status = calculate_overall_status(verification_results)

        return jsonify({
            'success': True,
            'verification_results': verification_results,
            'overall_status': overall_status
        }), 200

    except Exception as e:
        print(f"Government verification error: {e}")
        return jsonify({'error': str(e)}), 500
# from flask import Blueprint, request, jsonify
# import time
# import re

# gov_verify_bp = Blueprint('gov_verify_bp', __name__)

# # --- SIMULATED GOVERNMENT API LOGIC ---
# # In a real-world scenario, these functions would make secure API calls.
# # Here, we simulate them with logic to return different results for testing.

# def simulate_uidai_verification(aadhar_number, full_name):
#     """Simulates a call to the UIDAI database for Aadhaar verification."""
#     time.sleep(1.2) # Simulate network delay

#     # 1. Format Check
#     if not re.match(r'^\d{12}$', aadhar_number):
#         return {"status": "INVALID", "message": "Aadhaar format is incorrect (must be 12 digits)."}

#     # 2. Simulation Logic (based on Aadhaar number patterns for testing)
#     last_digit = int(aadhar_number[-1])
    
#     if last_digit == 0:
#         return {"status": "FORGED", "message": "Aadhaar number not found in UIDAI database.", "confidence": 0.95}
#     elif last_digit <= 2:
#         return {"status": "SUSPICIOUS", "message": "Data mismatch. Name or DOB does not match Aadhaar record.", "confidence": 0.60}
    
#     return {"status": "VERIFIED", "message": "Aadhaar details successfully verified with UIDAI.", "confidence": 0.99}


# def simulate_eci_verification(voter_id, full_name):
#     """Simulates a call to the Election Commission of India database."""
#     time.sleep(0.8) # Simulate network delay
    
#     # 1. Format Check
#     if not re.match(r'^[A-Z]{3}\d{7}$', voter_id):
#         return {"status": "INVALID", "message": "Voter ID format is incorrect (e.g., ABC1234567)."}

#     # 2. Simulation Logic
#     if voter_id.startswith("XXX"):
#         return {"status": "FORGED", "message": "Voter ID does not exist in the electoral roll.", "confidence": 0.98}
#     elif voter_id.startswith("SUS"):
#         return {"status": "SUSPICIOUS", "message": "Voter ID is valid but flagged for inactivity.", "confidence": 0.70}
    
#     return {"status": "VERIFIED", "message": "Voter ID successfully verified with ECI electoral roll.", "confidence": 0.98}


# @gov_verify_bp.route('/verify-government-ids', methods=['POST'])
# def verify_ids():
#     data = request.json
#     aadhar_number = data.get('aadhar_number')
#     voter_id = data.get('voter_id').upper()
#     full_name = data.get('full_name')

#     if not aadhar_number or not voter_id:
#         return jsonify({"error": "Aadhaar and Voter ID are required."}), 400

#     # Get results from our simulated services
#     aadhar_result = simulate_uidai_verification(aadhar_number, full_name)
#     eci_result = simulate_eci_verification(voter_id, full_name)

#     # Determine overall status
#     overall_status = "VERIFIED"
#     if aadhar_result['status'] in ["FORGED", "INVALID"] or eci_result['status'] in ["FORGED", "INVALID"]:
#         overall_status = "REJECTED"
#     elif aadhar_result['status'] == "SUSPICIOUS" or eci_result['status'] == "SUSPICIOUS":
#         overall_status = "FLAGGED_FOR_REVIEW"

#     # Prepare final report
#     response = {
#         "success": True,
#         "overall_status": overall_status,
#         "verification_report": {
#             "uidai_aadhaar": aadhar_result,
#             "eci_voter_id": eci_result
#         },
#         "timestamp": time.time()
#     }
    
#     return jsonify(response)