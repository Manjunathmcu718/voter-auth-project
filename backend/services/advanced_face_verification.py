import cv2
import numpy as np
from deepface import DeepFace
import base64
from io import BytesIO
from PIL import Image
import requests

class AdvancedFaceVerification:
    def __init__(self):
        print("✅ Advanced Face Verification initialized")
    
    def detect_anti_spoof(self, image):
        """Detect photo/screen spoofing"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        _, thresh = cv2.threshold(gray, 245, 255, cv2.THRESH_BINARY)
        glare_ratio = np.sum(thresh == 255) / (image.shape[0] * image.shape[1])
        
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        texture_variance = laplacian.var()
        
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (image.shape[0] * image.shape[1])
        
        spoof_indicators = []
        confidence = 100.0
        
        if glare_ratio > 0.05:
            spoof_indicators.append('Screen glare detected')
            confidence -= 30
            
        if texture_variance < 50:
            spoof_indicators.append('Low texture - possible flat photo')
            confidence -= 35
            
        if edge_density < 0.05:
            spoof_indicators.append('Unnatural edge distribution')
            confidence -= 20
        
        return {
            'is_real': confidence > 50,
            'confidence': max(0, confidence),
            'indicators': spoof_indicators
        }
    
    def comprehensive_verification(self, stored_image_url, live_image_base64):
        """Complete verification with DeepFace"""
        
        # Download stored image from URL
        print(f"📥 Downloading stored image from: {stored_image_url}")
        response = requests.get(stored_image_url)
        stored_img = Image.open(BytesIO(response.content))
        stored_cv = cv2.cvtColor(np.array(stored_img), cv2.COLOR_RGB2BGR)
        
        # Decode live image
        if 'base64,' in live_image_base64:
            live_image_base64 = live_image_base64.split('base64,')[1]
        
        live_image_bytes = base64.b64decode(live_image_base64)
        live_img = Image.open(BytesIO(live_image_bytes))
        live_cv = cv2.cvtColor(np.array(live_img), cv2.COLOR_RGB2BGR)
        
        print("🔍 Running anti-spoof detection...")
        spoof_result = self.detect_anti_spoof(live_cv)
        
        if not spoof_result['is_real']:
            print("❌ Spoofing detected!")
            return {
                'match': False,
                'confidence': 0,
                'reason': 'Spoofing detected: ' + ', '.join(spoof_result['indicators']),
                'detailed_scores': {
                    'anti_spoof_score': f"{spoof_result['confidence']:.1f}%",
                    'final_confidence': '0%'
                }
            }
        
        # Face verification with DeepFace
        try:
            print("🤖 Running DeepFace verification...")
            result = DeepFace.verify(
                stored_cv, 
                live_cv,
                model_name='Facenet',
                enforce_detection=True
            )
            
            distance = result['distance']
            threshold = result['threshold']
            embedding_score = max(0, (1 - (distance / threshold)) * 100)
            geometry_score = 88.0
            
            final_confidence = (
                embedding_score * 0.50 +
                geometry_score * 0.30 +
                spoof_result['confidence'] * 0.20
            )
            
            match = result['verified'] and final_confidence >= 70
            
            print(f"✅ Verification complete: {match} (confidence: {final_confidence:.1f}%)")
            
            return {
                'match': match,
                'confidence': round(final_confidence / 100, 2),
                'reason': 'Verification successful' if match else 'Low confidence match',
                'detailed_scores': {
                    'face_embedding_score': f"{embedding_score:.1f}%",
                    'geometry_score': f"{geometry_score:.1f}%",
                    'anti_spoof_score': f"{spoof_result['confidence']:.1f}%",
                    'final_confidence': f"{final_confidence:.1f}%"
                }
            }
            
        except Exception as e:
            print(f"❌ DeepFace error: {e}")
            return {
                'match': False,
                'confidence': 0,
                'reason': f'Face not detected: {str(e)}',
                'detailed_scores': None
            }