from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from bson import ObjectId
import gridfs
import base64

# Import validation functions and image validator
from utils.validation import validate_voter_id, validate_aadhaar, validate_indian_phone, calculate_age   
from utils.image_validator import VoterImageValidator

admin_bp = Blueprint('admin_bp', __name__)   

@admin_bp.route('/voters', methods=['GET', 'POST'])
def manage_voters():
    mongo = current_app.mongo
    if request.method == 'POST':
        data = request.json
        errors = []

        # Extract image data if provided
        image_data = data.pop('image', None)

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

        # Image validation and processing
        image_id = None
        if image_data:
            try:
                # Validate image
                validator = VoterImageValidator()
                validation_result = validator.validate_image(image_data)
                
                if not validation_result["valid"]:
                    image_errors = validation_result.get("errors", [validation_result.get("error")])
                    return jsonify({
                        "error": "Image validation failed", 
                        "details": image_errors
                    }), 400
                
                # Process and store image
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                
                # Store in GridFS
                fs = gridfs.GridFS(mongo.db)
                image_id = fs.put(
                    image_bytes,
                    filename=f"voter_photo_{data['voter_id'].upper()}",
                    content_type="image/jpeg",
                    voter_id=data['voter_id'].upper(),
                    upload_date=datetime.utcnow()
                )
                
            except Exception as e:
                return jsonify({
                    "error": "Image processing failed", 
                    "details": [str(e)]
                }), 400

        # Create New Voter 
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
            "has_voted": False,
            "image_id": str(image_id) if image_id else None  # Store image reference
        }
        
        result = mongo.db.voters.insert_one(new_voter_data)     
        return jsonify({
            "status": "voter_added", 
            "voter_id": str(result.inserted_id),
            "image_uploaded": image_id is not None
        }), 201

    # GET request - Return all voters
    voters = list(mongo.db.voters.find().sort("created_at", -1))
    for voter in voters:
        voter['_id'] = str(voter['_id'])     
    return jsonify(voters)

@admin_bp.route('/add-voter', methods=['POST'])
def add_voter():
    """Dedicated endpoint for adding voters (alternative to the combined endpoint above)"""
    mongo = current_app.mongo
    data = request.json
    errors = []

    # Extract image data if provided
    image_data = data.pop('image', None)
    
    # Validate required fields
    required_fields = ['voter_id', 'aadhar_number', 'phone_number', 'full_name', 'date_of_birth', 'address', 'constituency', 'polling_station']
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f"Missing required field: {field}")
    
    # Field-specific validation
    if data.get('voter_id') and not validate_voter_id(data['voter_id']):
        errors.append("Invalid Voter ID format (must be ABC1234567).")
    if data.get('aadhar_number') and not validate_aadhaar(data['aadhar_number']):
        errors.append("Invalid Aadhaar number (must be 12 digits).")
    if data.get('phone_number') and not validate_indian_phone(data['phone_number']):
        errors.append("Invalid Indian mobile number (must be 10 digits starting with 6-9).")
    
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400
    
    # Check for duplicates
    existing = mongo.db.voters.find_one({
        "$or": [
            {"voter_id": data['voter_id'].upper()},
            {"aadhar_number": data['aadhar_number']},
            {"phone_number": data['phone_number']}
        ]
    })
    if existing:
        return jsonify({"error": "A voter with this Voter ID, Aadhaar, or Phone Number already exists."}), 409
    
    # Add default values
    data['has_voted'] = False
    data['voting_timestamp'] = None
    data['otp_code'] = None
    data['otp_expires_at'] = None
    data['voter_id'] = data['voter_id'].upper()
    data['age'] = calculate_age(data['date_of_birth'])
    data['created_at'] = datetime.utcnow()
    data['image_id'] = None  # Will be updated if image is provided
    
    # Insert voter first
    result = mongo.db.voters.insert_one(data)
    voter_id = str(result.inserted_id)
    
    # Handle image upload if provided
    if image_data:
        try:
            validator = VoterImageValidator()
            validation_result = validator.validate_image(image_data)
            
            if validation_result["valid"]:
                # Store image
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                
                fs = gridfs.GridFS(mongo.db)
                image_id = fs.put(
                    image_bytes,
                    filename=f"voter_photo_{data['voter_id']}",
                    content_type="image/jpeg",
                    voter_id=data['voter_id'],
                    upload_date=datetime.utcnow()
                )
                
                # Update voter with image_id
                mongo.db.voters.update_one(
                    {"_id": result.inserted_id},
                    {"$set": {"image_id": str(image_id)}}
                )
                
                return jsonify({
                    "success": True, 
                    "voter_id": voter_id,
                    "image_uploaded": True,
                    "message": "Voter added successfully with photo"
                })
            else:
                # Voter was added but image failed validation
                image_errors = validation_result.get("errors", [validation_result.get("error")])
                return jsonify({
                    "success": True, 
                    "voter_id": voter_id,
                    "image_uploaded": False,
                    "image_errors": image_errors,
                    "message": "Voter added but photo validation failed"
                })
        except Exception as e:
            # Voter was added but image processing failed
            return jsonify({
                "success": True, 
                "voter_id": voter_id,
                "image_uploaded": False,
                "image_error": str(e),
                "message": "Voter added but photo upload failed"
            })
    
    return jsonify({
        "success": True, 
        "voter_id": voter_id,
        "image_uploaded": False,
        "message": "Voter added successfully"
    })

@admin_bp.route('/voters/<voter_id>/image', methods=['GET'])
def get_voter_image(voter_id):
    """Get voter's photo"""
    try:
        mongo = current_app.mongo
        
        # Find voter
        voter = mongo.db.voters.find_one({"_id": ObjectId(voter_id)})
        if not voter or not voter.get('image_id'):
            return jsonify({"error": "Image not found"}), 404
        
        # Get image from GridFS
        fs = gridfs.GridFS(mongo.db)
        try:
            image_file = fs.get(ObjectId(voter['image_id']))
        except gridfs.NoFile:
            return jsonify({"error": "Image file not found in storage"}), 404
        
        # Convert to base64 for frontend
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        
        return jsonify({
            "success": True,
            "image_data": f"data:image/jpeg;base64,{image_data}",
            "filename": image_file.filename,
            "upload_date": image_file.upload_date
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/upload-voter-image', methods=['POST'])
def upload_voter_image():
    """Standalone image upload endpoint"""
    try:
        data = request.json
        image_data = data.get('image')
        voter_id = data.get('voter_id')
        
        if not image_data or not voter_id:
            return jsonify({"error": "Image data and voter ID are required"}), 400
        
        # Initialize validator
        validator = VoterImageValidator()
        
        # Validate image
        validation_result = validator.validate_image(image_data)
        
        if not validation_result["valid"]:
            return jsonify({
                "success": False, 
                "errors": validation_result.get("errors", [validation_result.get("error")])
            }), 400
        
        # Extract image bytes
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Store in GridFS
        mongo = current_app.mongo
        fs = gridfs.GridFS(mongo.db)
        
        # Store image
        image_id = fs.put(
            image_bytes,
            filename=f"voter_photo_{voter_id}",
            content_type="image/jpeg",
            voter_id=voter_id,
            upload_date=datetime.utcnow()
        )
        
        return jsonify({
            "success": True,
            "image_id": str(image_id),
            "message": "Image uploaded and validated successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/voters/<voter_id>', methods=['DELETE'])
def delete_voter(voter_id):
    """Delete a voter and their associated image"""
    mongo = current_app.mongo
    
    # Get voter data first to check for image
    voter = mongo.db.voters.find_one({"_id": ObjectId(voter_id)})
    if not voter:
        return jsonify({"error": "Voter not found"}), 404
    
    # Delete associated image if it exists
    if voter.get('image_id'):
        try:
            fs = gridfs.GridFS(mongo.db)
            fs.delete(ObjectId(voter['image_id']))
        except Exception as e:
            print(f"Warning: Could not delete image {voter['image_id']}: {e}")
    
    # Delete voter record
    result = mongo.db.voters.delete_one({"_id": ObjectId(voter_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Voter not found"}), 404
    
    return jsonify({
        "status": "voter_deleted",
        "image_deleted": voter.get('image_id') is not None
    })

@admin_bp.route('/booths', methods=['GET', 'POST'])
def manage_booths():
    """Manage polling booths"""
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
# #calculate_age to this import line
# from utils.validation import validate_voter_id, validate_aadhaar, validate_indian_phone, calculate_age   

# admin_bp = Blueprint('admin_bp', __name__)   

# @admin_bp.route('/voters', methods=['GET', 'POST'])
# def manage_voters():
#     mongo = current_app.mongo
#     if request.method == 'POST':
#         data = request.json
#         errors = []

#         # Validation
#         if not validate_voter_id(data.get('voter_id', '')):
#             errors.append("Invalid Voter ID format (must be ABC1234567).")
#         if not validate_aadhaar(data.get('aadhar_number', '')):
#             errors.append("Invalid Aadhaar number (must be 12 digits).")
#         if not validate_indian_phone(data.get('phone_number', '')):
#             errors.append("Invalid Indian mobile number (must be 10 digits starting with 6-9).")
        
#         # Check for address
#         if not data.get('address'):
#             errors.append("Address is a required field.")

#         if errors:
#             return jsonify({"error": "Validation failed", "details": errors}), 400        

#         # Duplicate Check
#         existing = mongo.db.voters.find_one({
#             "$or": [
#                 {"voter_id": data['voter_id'].upper()},
#                 {"aadhar_number": data['aadhar_number']},
#                 {"phone_number": data['phone_number']}
#             ]
#         })
#         if existing:
#             return jsonify({"error": "A voter with this Voter ID, Aadhaar, or Phone Number already exists."}), 409

#         #  Create New Voter 
#         new_voter_data = {
#             "voter_id": data['voter_id'].upper(),
#             "aadhar_number": data['aadhar_number'],
#             "phone_number": data['phone_number'],
#             "full_name": data['full_name'],
#             "date_of_birth": data['date_of_birth'],
#             "constituency": data['constituency'],
#             "polling_station": data['polling_station'],
#             "address": data['address'], 
#             "age": calculate_age(data['date_of_birth']), 
#             "created_at": datetime.utcnow(),
#             "has_voted": False
#         }
        
#         mongo.db.voters.insert_one(new_voter_data)     
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
# # from flask import Blueprint, request, jsonify, current_app
# # from datetime import datetime
# # from bson import ObjectId
# # from utils.validation import validate_voter_id, validate_aadhaar, validate_indian_phone

# # admin_bp = Blueprint('admin_bp', __name__)

# # @admin_bp.route('/voters', methods=['GET', 'POST'])
# # def manage_voters():
# #     mongo = current_app.mongo
# #     if request.method == 'POST':
# #         data = request.json
# #         errors = []
# #         if not validate_voter_id(data.get('voter_id', '')):
# #             errors.append("Invalid Voter ID format (must be ABC1234567).")
# #         if not validate_aadhaar(data.get('aadhar_number', '')):
# #             errors.append("Invalid Aadhaar number (must be 12 digits).")
# #         if not validate_indian_phone(data.get('phone_number', '')):
# #             errors.append("Invalid Indian mobile number (must be 10 digits starting with 6-9).")
        
# #         if errors:
# #             return jsonify({"error": "Validation failed", "details": errors}), 400

# #         # Check for duplicates
# #         existing = mongo.db.voters.find_one({
# #             "$or": [
# #                 {"voter_id": data['voter_id'].upper()},
# #                 {"aadhar_number": data['aadhar_number']},
# #                 {"phone_number": data['phone_number']}
# #             ]
# #         })
# #         if existing:
# #             return jsonify({"error": "A voter with this Voter ID, Aadhaar, or Phone Number already exists."}), 409

# #         # Create new voter
# #         data['voter_id'] = data['voter_id'].upper()
# #         data['created_at'] = datetime.utcnow()
# #         data['has_voted'] = False
# #         mongo.db.voters.insert_one(data)
# #         return jsonify({"status": "voter_added"}), 201

# #     # GET request
# #     voters = list(mongo.db.voters.find().sort("created_at", -1))
# #     for voter in voters:
# #         voter['_id'] = str(voter['_id'])
# #     return jsonify(voters)

# # @admin_bp.route('/voters/<voter_id>', methods=['DELETE'])
# # def delete_voter(voter_id):
# #     mongo = current_app.mongo
# #     result = mongo.db.voters.delete_one({"_id": ObjectId(voter_id)})
# #     if result.deleted_count == 0:
# #         return jsonify({"error": "Voter not found"}), 404
# #     return jsonify({"status": "voter_deleted"})

# # @admin_bp.route('/booths', methods=['GET', 'POST'])
# # def manage_booths():
# #     mongo = current_app.mongo
# #     if request.method == 'POST':
# #         data = request.json
# #         data['created_at'] = datetime.utcnow()
# #         mongo.db.booths.insert_one(data)
# #         return jsonify({"status": "booth_added"}), 201

# #     # GET request
# #     booths = list(mongo.db.booths.find().sort("created_at", -1))
# #     for booth in booths:
# #         booth['_id'] = str(booth['_id'])
# #     return jsonify(booths)