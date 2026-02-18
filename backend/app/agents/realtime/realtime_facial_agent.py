"""
Advanced Real-time Facial Analysis with ML-based Emotion Detection
Combines MediaPipe landmarks with TensorFlow emotion classification
"""

import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Tuple, Optional
import time
import os

try:
    from app.core.emotion_detector import EmotionDetector
except ImportError:
    EmotionDetector = None

class RealtimeFacialAgent:
    """
    Advanced real-time facial analysis with ML-based emotion detection.
    Combines MediaPipe landmarks with TensorFlow emotion classification.
    """
    
    def __init__(self):
        self.use_mediapipe = False
        self.mp_face_mesh = None
        self.face_mesh = None
        self.mp_face_detection = None
        self.face_detection = None
        
        # Initialize ML-based emotion detector
        self.emotion_detector = None
        if EmotionDetector:
            try:
                self.emotion_detector = EmotionDetector()
                print("✅ RealtimeFacialAgent: Emotion detector initialized")
            except Exception as e:
                print(f"⚠️ RealtimeFacialAgent: Emotion detector failed ({e})")
        
        # Try to initialize MediaPipe
        try:
            if hasattr(mp, 'solutions'):
                self.mp_face_mesh = mp.solutions.face_mesh
                self.face_mesh = self.mp_face_mesh.FaceMesh(
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
                
                self.mp_face_detection = mp.solutions.face_detection
                self.face_detection = self.mp_face_detection.FaceDetection(
                    min_detection_confidence=0.5
                )
                self.use_mediapipe = True
                print("✅ RealtimeFacialAgent: Using MediaPipe")
            else:
                raise ImportError("MediaPipe solutions not available")
                
        except Exception as e:
            print(f"⚠️ RealtimeFacialAgent: MediaPipe import failed ({e}). Using OpenCV fallback.")
            self.use_mediapipe = False
            haar_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
            if os.path.exists(haar_path):
                self.face_cascade = cv2.CascadeClassifier(haar_path)
                self.eye_cascade = cv2.CascadeClassifier(os.path.join(cv2.data.haarcascades, 'haarcascade_eye.xml'))
                self.smile_cascade = cv2.CascadeClassifier(os.path.join(cv2.data.haarcascades, 'haarcascade_smile.xml'))
            else:
                print(f"❌ RealtimeFacialAgent: HAAR cascade not found")
        
        # Emotion tracking
        self.emotion_history = []
        self.max_history = 30
        
    def analyze_frame(self, frame: np.ndarray) -> Dict:
        """
        Analyze a single video frame for facial metrics using ML models.
        Uses EmotionDetector for accurate emotion classification.
        """
        start_time = time.time()
        
        analysis = {
            "face_detected": False,
            "eye_contact_score": 0.0,
            "smile_score": 0.0,
            "engagement_score": 0.0,
            "emotion": "neutral",
            "emotion_confidence": 0.0,
            "emotional_state": None,
            "engagement_level": "low",
            "processing_time_ms": 0.0
        }
        
        try:
            # Use ML-based emotion detection if available
            if self.emotion_detector:
                emotion_result = self.emotion_detector.detect_emotion_in_frame(frame)
                if emotion_result['faces_detected'] > 0:
                    analysis['face_detected'] = True
                    analysis['emotion'] = emotion_result['primary_emotion']
                    analysis['emotion_confidence'] = emotion_result['primary_confidence']
                    analysis['engagement_score'] = emotion_result['engagement_score']
                    analysis['engagement_level'] = self._classify_engagement(
                        emotion_result['engagement_score']
                    )
                    
                    # Also do MediaPipe analysis for eye contact
                    if self.use_mediapipe:
                        self._enhance_with_mediapipe(frame, analysis)
            
            # Fallback to MediaPipe if emotion detector unavailable
            elif self.use_mediapipe:
                analysis = self._analyze_with_mediapipe(frame, analysis)
            else:
                analysis = self._analyze_with_opencv(frame, analysis)
                
            self.emotion_history.append(analysis.copy())
            if len(self.emotion_history) > self.max_history:
                self.emotion_history.pop(0)
                
        except Exception as e:
            print(f"Analysis Error: {e}")
            pass
            
        # Track processing time
        processing_time = (time.time() - start_time) * 1000
        analysis["processing_time_ms"] = round(processing_time, 2)
        
        return analysis
    
    def _enhance_with_mediapipe(self, frame: np.ndarray, analysis: Dict) -> Dict:
        """Enhance analysis with MediaPipe eye contact detection"""
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                eye_contact = self._calculate_eye_contact(face_landmarks, rgb_frame.shape)
                smile = self._calculate_smile(face_landmarks)
                
                analysis['eye_contact_score'] = eye_contact
                analysis['smile_score'] = smile
                
                # Recalculate engagement with all metrics
                analysis['engagement_score'] = (
                    (eye_contact * 0.5) + 
                    (smile * 0.2) + 
                    (analysis['engagement_score'] * 0.3)
                )
        except Exception as e:
            print(f"MediaPipe enhancement error: {e}")
        
        return analysis

    def _analyze_with_mediapipe(self, frame, analysis):
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.face_mesh.process(rgb_frame)
        detection_results = self.face_detection.process(rgb_frame)
        
        if results.multi_face_landmarks and detection_results.detections:
            analysis["face_detected"] = True
            face_landmarks = results.multi_face_landmarks[0]
            
            # Calculate eye contact (looking at camera)
            eye_contact = self._calculate_eye_contact(face_landmarks, rgb_frame.shape)
            analysis["eye_contact_score"] = eye_contact
            
            # Calculate smile
            smile = self._calculate_smile(face_landmarks)
            analysis["smile_score"] = smile
            
            # Estimate emotion based on facial features
            emotion, confidence = self._estimate_emotion(face_landmarks, smile, eye_contact)
            analysis["emotion"] = emotion
            analysis["confidence"] = confidence
            
            # Calculate engagement (combination of eye contact and facial expression)
            engagement = (eye_contact * 0.6) + (smile * 0.2) + (confidence * 0.2)
            analysis["engagement_score"] = min(100.0, engagement * 100)
            
        return analysis

    def _analyze_with_opencv(self, frame, analysis):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) > 0:
            analysis["face_detected"] = True
            (x, y, w, h) = faces[0]
            roi_gray = gray[y:y+h, x:x+w]
            
            # Eye detection
            eyes = self.eye_cascade.detectMultiScale(roi_gray)
            if len(eyes) >= 2:
                analysis["eye_contact_score"] = 0.8  # Assume looking if eyes visible
            elif len(eyes) == 1:
                analysis["eye_contact_score"] = 0.4
            
            # Smile detection
            smiles = self.smile_cascade.detectMultiScale(roi_gray, scaleFactor=1.8, minNeighbors=20)
            if len(smiles) > 0:
                analysis["smile_score"] = 0.9
                analysis["emotion"] = "happy"
                analysis["confidence"] = 0.8
            else:
                analysis["emotion"] = "neutral"
                analysis["confidence"] = 0.6
                
            # Engagement
            engagement = (analysis["eye_contact_score"] * 0.6) + (analysis["smile_score"] * 0.2) + 0.1
            analysis["engagement_score"] = min(100.0, engagement * 100)
            
        return analysis
    
    def _calculate_eye_contact(self, landmarks, frame_shape) -> float:
        """
        Calculate eye contact score based on gaze direction.
        Returns: 0.0 to 1.0 (1.0 = looking directly at camera)
        """
        # Get eye landmarks
        left_eye = landmarks.landmark[33]  # Left eye center
        right_eye = landmarks.landmark[263]  # Right eye center
        nose = landmarks.landmark[1]  # Nose tip
        
        # Calculate if eyes are centered (looking at camera)
        # Simple heuristic: check if eyes are level and nose is centered
        eye_level_diff = abs(left_eye.y - right_eye.y)
        nose_center_x = nose.x
        
        # Score based on alignment (0-1)
        level_score = max(0, 1 - (eye_level_diff * 10))
        center_score = max(0, 1 - abs(nose_center_x - 0.5) * 2)
        
        return (level_score + center_score) / 2
    
    def _calculate_smile(self, landmarks) -> float:
        """
        Calculate smile intensity based on mouth landmarks.
        Returns: 0.0 to 1.0 (1.0 = big smile)
        """
        # Mouth landmarks
        mouth_left = landmarks.landmark[61]
        mouth_right = landmarks.landmark[291]
        mouth_top = landmarks.landmark[13]
        mouth_bottom = landmarks.landmark[14]
        
        # Calculate mouth width and height
        mouth_width = abs(mouth_right.x - mouth_left.x)
        mouth_height = abs(mouth_bottom.y - mouth_top.y)
        
        # Smile typically has wider mouth
        if mouth_width > 0:
            aspect_ratio = mouth_height / mouth_width
            # Lower aspect ratio = wider smile
            smile_score = max(0, min(1, (0.5 - aspect_ratio) * 3))
            return smile_score
        
        return 0.0
    
    def _estimate_emotion(self, landmarks, smile: float, eye_contact: float) -> Tuple[str, float]:
        """
        Estimate emotion based on facial features.
        Returns: (emotion_name, confidence)
        """
        # Simple rule-based emotion detection
        if smile > 0.6:
            return "happy", 0.8
        elif smile > 0.3:
            return "confident", 0.7
        elif eye_contact < 0.3:
            return "nervous", 0.6
        else:
            return "neutral", 0.5
    
    def get_average_metrics(self) -> Dict:
        """
        Get average metrics over recent frames.
        Useful for smoothing out jitter.
        """
        if not self.emotion_history:
            return {
                "avg_eye_contact": 0.0,
                "avg_smile": 0.0,
                "avg_engagement": 0.0,
                "dominant_emotion": "neutral"
            }
        
        # Calculate averages
        avg_eye_contact = np.mean([h["eye_contact_score"] for h in self.emotion_history])
        avg_smile = np.mean([h["smile_score"] for h in self.emotion_history])
        avg_engagement = np.mean([h["engagement_score"] for h in self.emotion_history])
        
        # Find dominant emotion
        emotions = [h["emotion"] for h in self.emotion_history]
        dominant_emotion = max(set(emotions), key=emotions.count)
        
        return {
            "avg_eye_contact": round(avg_eye_contact * 100, 1),
            "avg_smile": round(avg_smile * 100, 1),
            "avg_engagement": round(avg_engagement, 1),
            "dominant_emotion": dominant_emotion
        }
    
    def update_history(self, analysis: Dict):
        """Add analysis to history and maintain max size"""
        self.emotion_history.append(analysis)
        if len(self.emotion_history) > self.max_history:
            self.emotion_history.pop(0)
    
    def reset(self):
        """Reset the agent state"""
        self.emotion_history = []
    
    def __del__(self):
        """Cleanup resources"""
        if self.use_mediapipe:
            if hasattr(self, 'face_mesh') and self.face_mesh:
                self.face_mesh.close()
            if hasattr(self, 'face_detection') and self.face_detection:
                self.face_detection.close()
    
    def _calculate_eye_contact(self, landmarks, frame_shape) -> float:
        """
        Calculate eye contact score based on gaze direction.
        Returns: 0.0 to 1.0 (1.0 = looking directly at camera)
        """
        # Get eye landmarks
        left_eye = landmarks.landmark[33]  # Left eye center
        right_eye = landmarks.landmark[263]  # Right eye center
        nose = landmarks.landmark[1]  # Nose tip
        
        # Calculate if eyes are centered (looking at camera)
        # Simple heuristic: check if eyes are level and nose is centered
        eye_level_diff = abs(left_eye.y - right_eye.y)
        nose_center_x = nose.x
        
        # Score based on alignment (0-1)
        level_score = max(0, 1 - (eye_level_diff * 10))
        center_score = max(0, 1 - abs(nose_center_x - 0.5) * 2)
        
        return (level_score + center_score) / 2
    
    def _calculate_smile(self, landmarks) -> float:
        """
        Calculate smile intensity based on mouth landmarks.
        Returns: 0.0 to 1.0 (1.0 = big smile)
        """
        # Mouth landmarks
        mouth_left = landmarks.landmark[61]
        mouth_right = landmarks.landmark[291]
        mouth_top = landmarks.landmark[13]
        mouth_bottom = landmarks.landmark[14]
        
        # Calculate mouth width and height
        mouth_width = abs(mouth_right.x - mouth_left.x)
        mouth_height = abs(mouth_bottom.y - mouth_top.y)
        
        # Smile typically has wider mouth
        if mouth_width > 0:
            aspect_ratio = mouth_height / mouth_width
            # Lower aspect ratio = wider smile
            smile_score = max(0, min(1, (0.5 - aspect_ratio) * 3))
            return smile_score
        
        return 0.0
    
    def _estimate_emotion(self, landmarks, smile: float, eye_contact: float) -> Tuple[str, float]:
        """
        Estimate emotion based on facial features.
        Returns: (emotion_name, confidence)
        """
        # Simple rule-based emotion detection
        if smile > 0.6:
            return "happy", 0.8
        elif smile > 0.3:
            return "confident", 0.7
        elif eye_contact < 0.3:
            return "nervous", 0.6
        else:
            return "neutral", 0.5
    
    def get_average_metrics(self) -> Dict:
        """
        Get average metrics over recent frames.
        Useful for smoothing out jitter.
        """
        if not self.emotion_history:
            return {
                "avg_eye_contact": 0.0,
                "avg_smile": 0.0,
                "avg_engagement": 0.0,
                "dominant_emotion": "neutral"
            }
        
        # Calculate averages
        avg_eye_contact = np.mean([h["eye_contact_score"] for h in self.emotion_history])
        avg_smile = np.mean([h["smile_score"] for h in self.emotion_history])
        avg_engagement = np.mean([h["engagement_score"] for h in self.emotion_history])
        
        # Find dominant emotion
        emotions = [h["emotion"] for h in self.emotion_history]
        dominant_emotion = max(set(emotions), key=emotions.count)
        
        return {
            "avg_eye_contact": round(avg_eye_contact * 100, 1),
            "avg_smile": round(avg_smile * 100, 1),
            "avg_engagement": round(avg_engagement, 1),
            "dominant_emotion": dominant_emotion
        }
    
    def update_history(self, analysis: Dict):
        """Add analysis to history and maintain max size"""
        self.emotion_history.append(analysis)
        if len(self.emotion_history) > self.max_history:
            self.emotion_history.pop(0)
    
    def reset(self):
        """Reset the agent state"""
        self.emotion_history = []
    
    def __del__(self):
        """Cleanup resources"""
        if hasattr(self, 'face_mesh'):
            self.face_mesh.close()
        if hasattr(self, 'face_detection'):
            self.face_detection.close()
