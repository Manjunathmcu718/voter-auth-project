from flask import Blueprint, request, jsonify, current_app
import base64
import gridfs
from bson import ObjectId
import io
from PIL import Image
from utils.image_validator import VoterImageValidator

image_bp = Blueprint('image_bp', __name__)

@image_bp.route('/upload-voter-image', methods=['POST'])
def upload_voter_image():
    """Upload and validate voter photo"""
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
        
        # Store in GridFS (for large files)
        db = current_app.mongo.db
        fs = gridfs.GridFS(db)
        
        # Store image
        image_id = fs.put(
            image_bytes,
            filename=f"voter_photo_{voter_id}",
            content_type="image/jpeg",
            voter_id=voter_id
        )
        
        return jsonify({
            "success": True,
            "image_id": str(image_id),
            "message": "Image uploaded and validated successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@image_bp.route('/get-voter-image/<voter_id>', methods=['GET'])
def get_voter_image(voter_id):
    """Retrieve voter photo"""
    try:
        db = current_app.mongo.db
        fs = gridfs.GridFS(db)
        
        # Find image by voter_id
        image_file = fs.find_one({"voter_id": voter_id})
        
        if not image_file:
            return jsonify({"error": "Image not found"}), 404
        
        # Convert to base64 for frontend
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        
        return jsonify({
            "success": True,
            "image_data": f"data:image/jpeg;base64,{image_data}"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500