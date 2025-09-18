from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from bson import ObjectId
#calculate_age to this import line
from utils.validation import validate_voter_id, validate_aadhaar, validate_indian_phone, calculate_age   

admin_bp = Blueprint('admin_bp', __name__)   

@admin_bp.route('/voters', methods=['GET', 'POST'])
def manage_voters():
    mongo = current_app.mongo
    if request.method == 'POST':
        data = request.json
        errors = []

        # Validation
        if not validate_voter_id(data.get('voter_id', '')):
            errors.append("Invalid Voter ID format (must be ABC1234567).")
        if not validate_aadhaar(data.get('aadhar_number', '')):
            errors.append("Invalid Aadhaar number (must be 12 digits).")
        if not validate_indian_phone(data.get('phone_number', '')):
            errors.append("Invalid Indian mobile number (must be 10 digits starting with 6-9).")
        
        # Check for address
        if not data.get('address'):
            errors.append("Address is a required field.")

        if errors:
            return jsonify({"error": "Validation failed", "details": errors}), 400        

        # Duplicate Check
        existing = mongo.db.voters.find_one({
            "$or": [
                {"voter_id": data['voter_id'].upper()},
                {"aadhar_number": data['aadhar_number']},
                {"phone_number": data['phone_number']}
            ]
        })
        if existing:
            return jsonify({"error": "A voter with this Voter ID, Aadhaar, or Phone Number already exists."}), 409

        #  Create New Voter 
        new_voter_data = {
            "voter_id": data['voter_id'].upper(),
            "aadhar_number": data['aadhar_number'],
            "phone_number": data['phone_number'],
            "full_name": data['full_name'],
            "date_of_birth": data['date_of_birth'],
            "constituency": data['constituency'],
            "polling_station": data['polling_station'],
            "address": data['address'], 
            "age": calculate_age(data['date_of_birth']), 
            "created_at": datetime.utcnow(),
            "has_voted": False
        }
        
        mongo.db.voters.insert_one(new_voter_data)     
        return jsonify({"status": "voter_added"}), 201

    # GET request
    voters = list(mongo.db.voters.find().sort("created_at", -1))
    for voter in voters:
        voter['_id'] = str(voter['_id'])     
    return jsonify(voters)


@admin_bp.route('/voters/<voter_id>', methods=['DELETE'])
def delete_voter(voter_id):
   
    mongo = current_app.mongo
    result = mongo.db.voters.delete_one({"_id": ObjectId(voter_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Voter not found"}), 404
    return jsonify({"status": "voter_deleted"})

@admin_bp.route('/booths', methods=['GET', 'POST'])
def manage_booths():
   
    mongo = current_app.mongo
    if request.method == 'POST':
        data = request.json
        data['created_at'] = datetime.utcnow()
        mongo.db.booths.insert_one(data)     
        return jsonify({"status": "booth_added"}), 201

    # GET request
    booths = list(mongo.db.booths.find().sort("created_at", -1))
    for booth in booths:
        booth['_id'] = str(booth['_id'])     
    return jsonify(booths)    
# from flask import Blueprint, request, jsonify, current_app
# from datetime import datetime
# from bson import ObjectId
# from utils.validation import validate_voter_id, validate_aadhaar, validate_indian_phone

# admin_bp = Blueprint('admin_bp', __name__)

# @admin_bp.route('/voters', methods=['GET', 'POST'])
# def manage_voters():
#     mongo = current_app.mongo
#     if request.method == 'POST':
#         data = request.json
#         errors = []
#         if not validate_voter_id(data.get('voter_id', '')):
#             errors.append("Invalid Voter ID format (must be ABC1234567).")
#         if not validate_aadhaar(data.get('aadhar_number', '')):
#             errors.append("Invalid Aadhaar number (must be 12 digits).")
#         if not validate_indian_phone(data.get('phone_number', '')):
#             errors.append("Invalid Indian mobile number (must be 10 digits starting with 6-9).")
        
#         if errors:
#             return jsonify({"error": "Validation failed", "details": errors}), 400

#         # Check for duplicates
#         existing = mongo.db.voters.find_one({
#             "$or": [
#                 {"voter_id": data['voter_id'].upper()},
#                 {"aadhar_number": data['aadhar_number']},
#                 {"phone_number": data['phone_number']}
#             ]
#         })
#         if existing:
#             return jsonify({"error": "A voter with this Voter ID, Aadhaar, or Phone Number already exists."}), 409

#         # Create new voter
#         data['voter_id'] = data['voter_id'].upper()
#         data['created_at'] = datetime.utcnow()
#         data['has_voted'] = False
#         mongo.db.voters.insert_one(data)
#         return jsonify({"status": "voter_added"}), 201

#     # GET request
#     voters = list(mongo.db.voters.find().sort("created_at", -1))
#     for voter in voters:
#         voter['_id'] = str(voter['_id'])
#     return jsonify(voters)

# @admin_bp.route('/voters/<voter_id>', methods=['DELETE'])
# def delete_voter(voter_id):
#     mongo = current_app.mongo
#     result = mongo.db.voters.delete_one({"_id": ObjectId(voter_id)})
#     if result.deleted_count == 0:
#         return jsonify({"error": "Voter not found"}), 404
#     return jsonify({"status": "voter_deleted"})

# @admin_bp.route('/booths', methods=['GET', 'POST'])
# def manage_booths():
#     mongo = current_app.mongo
#     if request.method == 'POST':
#         data = request.json
#         data['created_at'] = datetime.utcnow()
#         mongo.db.booths.insert_one(data)
#         return jsonify({"status": "booth_added"}), 201

#     # GET request
#     booths = list(mongo.db.booths.find().sort("created_at", -1))
#     for booth in booths:
#         booth['_id'] = str(booth['_id'])
#     return jsonify(booths)