from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import random
from bson import ObjectId
from utils.validation import calculate_age
from utils.sms import send_sms

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/authenticate', methods=['POST'])
def authenticate_voter():
    data = request.json
    mongo = current_app.mongo
    
    voter = mongo.db.voters.find_one({
        "voter_id": data['voter_id'].upper(),
        "aadhar_number": data['aadhar_number'],
        "phone_number": data['phone_number']
    })

    if not voter:
        return jsonify({"error": "Voter not found. Please check your credentials."}), 404

    if calculate_age(voter.get('date_of_birth')) < 18:
        return jsonify({"error": "Voter is not eligible to vote (under 18)."}), 403

    if voter.get('has_voted'):
        voter['_id'] = str(voter['_id']) # Convert ObjectId for JSON response
        return jsonify({"status": "already_voted", "voter": voter}), 200

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    mongo.db.voters.update_one({"_id": voter['_id']}, {"$set": {"otp_code": otp, "otp_expires_at": expires_at}})
    
    send_sms(voter['phone_number'], f"Your Voter Authentication OTP is {otp}. It is valid for 5 minutes.")
    
    return jsonify({
        "status": "otp_sent",
        "voter_id": str(voter['_id']),
        "message": f"OTP sent to mobile ending in ******{voter['phone_number'][-4:]}",
        "otp_for_testing": otp # Included for easy testing. Remove in production.
    })

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    mongo = current_app.mongo
    
    voter = mongo.db.voters.find_one({"_id": ObjectId(data['voter_id'])})

    if not voter or 'otp_code' not in voter:
        return jsonify({"error": "Invalid request or session."}), 400

    if datetime.utcnow() > voter.get('otp_expires_at', datetime.min):
        return jsonify({"error": "OTP has expired. Please try again."}), 410

    if data['otp'] != voter['otp_code']:
        return jsonify({"error": "Invalid OTP provided."}), 400

    # Clear OTP after successful verification
    mongo.db.voters.update_one({"_id": voter['_id']}, {"$unset": {"otp_code": "", "otp_expires_at": ""}})

    voter['_id'] = str(voter['_id'])
    return jsonify({"status": "verified", "voter": voter})
# In auth_routes.py

@auth_bp.route('/vote', methods=['POST'])
def record_vote():
    mongo = current_app.mongo
    data = request.json
    voter_id_str = data.get('voterId') 

    if not voter_id_str:
        return jsonify({"error": "Voter ID is missing"}), 400

    try:
        voter_object_id = ObjectId(voter_id_str)

        # First, check if the voter has already voted
        voter_check = mongo.db.voters.find_one({"_id": voter_object_id})
        if voter_check and voter_check.get("has_voted"):
            voter_check['_id'] = str(voter_check['_id'])
            return jsonify(voter_check), 200 # Return the already-voted data

        # If not voted, perform the update
        result = mongo.db.voters.update_one(
            {"_id": voter_object_id},
            {
                "$set": {
                    "has_voted": True,
                    "voting_timestamp": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"error": "Voter not found or vote could not be recorded."}), 404

        # Fetch the fully updated voter to return
        updated_voter = mongo.db.voters.find_one({"_id": voter_object_id})
        
        # Send SMS confirmation 
        if updated_voter:
            confirmation_id = f"VT{datetime.now().strftime('%Y%m%d%H%M%S')}"
            send_sms(updated_voter['phone_number'], f"Your vote has been successfully recorded. Confirmation ID: {confirmation_id}.")
        
        # Convert the ObjectId to a string for the JSON response
        updated_voter['_id'] = str(updated_voter['_id'])
        
        # Return the complete, updated voter object to the frontend
        return jsonify(updated_voter), 200

    except Exception as e:
        print(f"Error in /vote endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
# @auth_bp.route('/vote', methods=['POST'])
# def record_vote():
#     data = request.json
#     mongo = current_app.mongo
    
#     result = mongo.db.voters.update_one(
#         {"_id": ObjectId(data['voterId']), "has_voted": {"$ne": True}},  # ✅ Changed to 'voterId'
#         {"$set": {"has_voted": True, "voting_timestamp": datetime.utcnow()}}
#     )

#     if result.modified_count == 0:
#         return jsonify({"error": "Vote could not be recorded. Voter may have already voted or is invalid."}), 409

#     voter = mongo.db.voters.find_one({"_id": ObjectId(data['voterId'])})  # ✅ Changed to 'voterId'
#     if voter:
#         confirmation_id = f"VT{datetime.now().strftime('%Y%m%d%H%M%S')}"
#         send_sms(voter['phone_number'], f"Your vote has been successfully recorded. Your confirmation ID is {confirmation_id}.")

#     return jsonify({"status": "vote_recorded", "message": "Vote successfully recorded!"})
# Add this import at the top of the file
# from bson import ObjectId

# ... (keep your existing login_voter function) ...

# # ADD THIS ENTIRE NEW FUNCTION AT THE END OF THE FILE
# @auth_bp.route('/vote', methods=['POST'])
# def record_vote():
#     mongo = current_app.mongo
#     data = request.json
#     voter_id = data.get('voterId')

#     if not voter_id:
#         return jsonify({"error": "Voter ID is missing"}), 400

#     try:
#         # Find the voter by their unique MongoDB _id and update them
#         result = mongo.db.voters.update_one(
#             {"_id": ObjectId(voter_id)},
#             {
#                 "$set": {
#                     "has_voted": True,
#                     "voting_timestamp": datetime.utcnow()
#                 }
#             }
#         )

#         if result.matched_count == 0:
#             return jsonify({"error": "Voter not found in database"}), 404
        
#         # Find the updated voter to return to the frontend
#         updated_voter = mongo.db.voters.find_one({"_id": ObjectId(voter_id)})
#         updated_voter['_id'] = str(updated_voter['_id']) # Convert ObjectId for JSON

#         return jsonify(updated_voter), 200

#     except Exception as e:
#         print(f"Error recording vote: {e}")
#         return jsonify({"error": "An internal error occurred"}), 500
# @auth_bp.route('/vote', methods=['POST'])
# def record_vote():
#     data = request.json
#     mongo = current_app.mongo
    
#     result = mongo.db.voters.update_one(
#         {"_id": ObjectId(data['voter_id']), "has_voted": {"$ne": True}},
#         {"$set": {"has_voted": True, "voting_timestamp": datetime.utcnow()}}
#     )

#     if result.modified_count == 0:
#         return jsonify({"error": "Vote could not be recorded. Voter may have already voted or is invalid."}), 409

#     voter = mongo.db.voters.find_one({"_id": ObjectId(data['voter_id'])})
#     if voter:
#         confirmation_id = f"VT{datetime.now().strftime('%Y%m%d%H%M%S')}"
#         send_sms(voter['phone_number'], f"Your vote has been successfully recorded. Your confirmation ID is {confirmation_id}.")

#     return jsonify({"status": "vote_recorded", "message": "Vote successfully recorded!"})