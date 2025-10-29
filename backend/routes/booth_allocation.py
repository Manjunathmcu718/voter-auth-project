from flask import Blueprint, request, jsonify
from database import db
import re

booth_allocation_bp = Blueprint('booth_allocation', __name__)

# ============================================
# 1. Create Locality-to-Booth Mapping
# ============================================
@booth_allocation_bp.route('/api/booth-allocation/create-mapping', methods=['POST'])
def create_mapping():
    """
    Create a new locality-to-booth mapping.
    Example: { "locality_names": ["Keshav Nagar", "Gandhi Nagar"], "booth_id": "BOOTH001" }
    """
    try:
        data = request.json
        locality_names = data.get('locality_names', [])
        booth_id = data.get('booth_id')
        booth_name = data.get('booth_name')
        
        if not locality_names or not booth_id:
            return jsonify({'error': 'locality_names and booth_id are required'}), 400
        
        # Normalize locality names (lowercase, strip whitespace)
        normalized_localities = [name.strip().lower() for name in locality_names]
        
        # Check if mapping already exists
        existing = db.locality_booth_mapping.find_one({'booth_id': booth_id})
        
        if existing:
            # Update existing mapping
            db.locality_booth_mapping.update_one(
                {'booth_id': booth_id},
                {'$set': {
                    'locality_names': normalized_localities,
                    'booth_name': booth_name
                }}
            )
            message = 'Mapping updated successfully'
        else:
            # Create new mapping
            db.locality_booth_mapping.insert_one({
                'booth_id': booth_id,
                'booth_name': booth_name,
                'locality_names': normalized_localities
            })
            message = 'Mapping created successfully'
        
        return jsonify({'success': True, 'message': message}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# 2. Get All Locality-Booth Mappings
# ============================================
@booth_allocation_bp.route('/api/booth-allocation/mappings', methods=['GET'])
def get_mappings():
    """Get all locality-to-booth mappings"""
    try:
        mappings = list(db.locality_booth_mapping.find())
        
        # Convert ObjectId to string
        for mapping in mappings:
            mapping['_id'] = str(mapping['_id'])
        
        return jsonify({'mappings': mappings}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# 3. Delete a Mapping
# ============================================
@booth_allocation_bp.route('/api/booth-allocation/delete-mapping/<booth_id>', methods=['DELETE'])
def delete_mapping(booth_id):
    """Delete a locality-to-booth mapping"""
    try:
        result = db.locality_booth_mapping.delete_one({'booth_id': booth_id})
        
        if result.deleted_count > 0:
            return jsonify({'success': True, 'message': 'Mapping deleted successfully'}), 200
        else:
            return jsonify({'error': 'Mapping not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# 4. Auto-Allocate Booth Based on Address
# ============================================
@booth_allocation_bp.route('/api/booth-allocation/auto-allocate', methods=['POST'])
def auto_allocate_booth():
    """
    Analyze an address and return the best matching booth.
    Example: { "address": "610/1119, Keshav Nagar, Delhi" }
    Returns: { "booth_id": "BOOTH001", "booth_name": "Central School", "matched_locality": "keshav nagar" }
    """
    try:
        data = request.json
        address = data.get('address', '').strip().lower()
        
        if not address:
            return jsonify({'error': 'Address is required'}), 400
        
        # Get all mappings
        mappings = list(db.locality_booth_mapping.find())
        
        # Find the best match
        best_match = None
        matched_locality = None
        
        for mapping in mappings:
            for locality in mapping['locality_names']:
                # Check if locality name appears in the address
                if locality in address:
                    best_match = {
                        'booth_id': mapping['booth_id'],
                        'booth_name': mapping['booth_name'],
                        'matched_locality': locality
                    }
                    break
            
            if best_match:
                break
        
        if best_match:
            return jsonify({
                'success': True,
                'allocation': best_match
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'No matching booth found for this address',
                'allocation': None
            }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# 5. Bulk Analyze Addresses
# ============================================
@booth_allocation_bp.route('/api/booth-allocation/bulk-analyze', methods=['POST'])
def bulk_analyze():
    """
    Analyze multiple addresses at once.
    Example: { "addresses": ["610/1119, Keshav Nagar, Delhi", "25A/2310, Gandhi Nagar, Delhi"] }
    """
    try:
        data = request.json
        addresses = data.get('addresses', [])
        
        if not addresses:
            return jsonify({'error': 'addresses array is required'}), 400
        
        mappings = list(db.locality_booth_mapping.find())
        results = []
        
        for address in addresses:
            address_lower = address.strip().lower()
            matched = False
            
            for mapping in mappings:
                for locality in mapping['locality_names']:
                    if locality in address_lower:
                        results.append({
                            'address': address,
                            'booth_id': mapping['booth_id'],
                            'booth_name': mapping['booth_name'],
                            'matched_locality': locality
                        })
                        matched = True
                        break
                
                if matched:
                    break
            
            if not matched:
                results.append({
                    'address': address,
                    'booth_id': None,
                    'booth_name': 'No Match Found',
                    'matched_locality': None
                })
        
        return jsonify({'results': results}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500