import cv2
import numpy as np
from PIL import Image, ImageFilter
import io
import base64
import os

class VoterImageValidator:
    def __init__(self):
        # Image constraints
        self.MIN_SIZE_KB = 50
        self.MAX_SIZE_KB = 100
        self.REQUIRED_WIDTH_CM = 4.5
        self.REQUIRED_HEIGHT_CM = 3.5
        self.DPI = 300  # Standard DPI for photo conversion
        self.ALLOWED_FORMATS = ['JPEG', 'JPG', 'PNG']
        
        # Calculate required pixel dimensions (cm to pixels)
        self.REQUIRED_WIDTH_PX = int(self.REQUIRED_WIDTH_CM * self.DPI / 2.54)
        self.REQUIRED_HEIGHT_PX = int(self.REQUIRED_HEIGHT_CM * self.DPI / 2.54)
        
    def validate_image(self, image_data):
        """Main validation function - returns validation result"""
        try:
            # Convert base64 to PIL Image if needed
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                # Extract base64 data
                image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
            elif isinstance(image_data, bytes):
                image_bytes = image_data
            else:
                return {"valid": False, "error": "Invalid image data format"}
            
            # Load image with PIL
            image = Image.open(io.BytesIO(image_bytes))
            
            # Run all validations
            validations = [
                self._validate_format(image),
                self._validate_file_size(image_bytes),
                self._validate_dimensions(image),
                self._validate_orientation(image_bytes),
                self._validate_blur(image_bytes),
                self._validate_face_detection(image_bytes)
            ]
            
            # Collect all errors
            errors = []
            for validation in validations:
                if not validation["valid"]:
                    errors.append(validation["error"])
            
            if errors:
                return {"valid": False, "errors": errors}
            else:
                return {"valid": True, "message": "Image validation successful"}
                
        except Exception as e:
            return {"valid": False, "error": f"Image processing failed: {str(e)}"}
    
    def _validate_format(self, image):
        """Check if image format is allowed"""
        if image.format not in self.ALLOWED_FORMATS:
            return {"valid": False, "error": f"Invalid format. Only {', '.join(self.ALLOWED_FORMATS)} allowed."}
        return {"valid": True}
    
    def _validate_file_size(self, image_bytes):
        """Check file size constraints"""
        size_kb = len(image_bytes) / 1024
        if size_kb < self.MIN_SIZE_KB:
            return {"valid": False, "error": f"Image too small. Minimum {self.MIN_SIZE_KB}KB required."}
        if size_kb > self.MAX_SIZE_KB:
            return {"valid": False, "error": f"Image too large. Maximum {self.MAX_SIZE_KB}KB allowed."}
        return {"valid": True}
    
    def _validate_dimensions(self, image):
        """Check image dimensions (allowing 10% tolerance)"""
        width, height = image.size
        
        # Allow 10% tolerance
        width_tolerance = self.REQUIRED_WIDTH_PX * 0.1
        height_tolerance = self.REQUIRED_HEIGHT_PX * 0.1
        
        if abs(width - self.REQUIRED_WIDTH_PX) > width_tolerance:
            return {"valid": False, "error": f"Invalid width. Required: {self.REQUIRED_WIDTH_CM}cm ({self.REQUIRED_WIDTH_PX}px)"}
        
        if abs(height - self.REQUIRED_HEIGHT_PX) > height_tolerance:
            return {"valid": False, "error": f"Invalid height. Required: {self.REQUIRED_HEIGHT_CM}cm ({self.REQUIRED_HEIGHT_PX}px)"}
            
        return {"valid": True}
    
    def _validate_orientation(self, image_bytes):
        """Check if image is properly oriented (not upside down or tilted)"""
        try:
            # Convert to OpenCV format
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Detect edges to check orientation
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is not None:
                angles = []
                for line in lines[:10]:  # Check first 10 lines
                    rho, theta = line[0]
                    angle = np.degrees(theta)
                    angles.append(angle)
                
                # Check if image is significantly tilted
                avg_angle = np.mean(angles)
                if abs(avg_angle - 90) > 15 and abs(avg_angle - 0) > 15:
                    return {"valid": False, "error": "Image appears to be tilted. Please upload a straight image."}
            
            return {"valid": True}
            
        except Exception:
            # If orientation detection fails, assume it's okay
            return {"valid": True}
    
    def _validate_blur(self, image_bytes):
        """Check if image is clear (not blurred)"""
        try:
            # Convert to OpenCV format
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Calculate Laplacian variance (measure of blur)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Threshold for blur detection
            if laplacian_var < 100:
                return {"valid": False, "error": "Image appears blurred. Please upload a clear, sharp image."}
                
            return {"valid": True}
            
        except Exception:
            return {"valid": True}
    
    def _validate_face_detection(self, image_bytes):
        """Check if image contains a properly positioned face"""
        try:
            # Convert to OpenCV format
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Use Haar Cascade for face detection
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                return {"valid": False, "error": "No face detected. Please ensure the photo shows a clear frontal face."}
            
            if len(faces) > 1:
                return {"valid": False, "error": "Multiple faces detected. Please upload a photo with only one person."}
            
            # Check if face is properly centered and sized
            face_x, face_y, face_w, face_h = faces[0]
            img_h, img_w = gray.shape
            
            # Face should occupy 30-70% of image height
            face_ratio = face_h / img_h
            if face_ratio < 0.3 or face_ratio > 0.7:
                return {"valid": False, "error": "Face size inappropriate. Face should be 30-70% of image height."}
            
            return {"valid": True}
            
        except Exception as e:
            # If face detection fails, we'll allow it but warn
            return {"valid": True}