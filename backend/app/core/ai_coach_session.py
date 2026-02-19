"""
Enhanced WebSocket Handler for Real-time AI Coach
Integrates all AI/ML components for real-time feedback
"""

import asyncio
import json
import base64
import cv2
import numpy as np
from datetime import datetime
from typing import Dict, Optional

from app.core.emotion_detector import EmotionDetector
from app.core.voice_quality_analyzer import VoiceQualityAnalyzer
from app.core.gemini_coach_engine import GeminiCoachEngine
from app.core.scoring_system import IntelligentScoringSystem
from app.agents.realtime.realtime_voice_agent import RealtimeVoiceAgent
from app.agents.realtime.realtime_facial_agent import RealtimeFacialAgent


class AICoachSession:
    """
    Manages a real-time AI coaching session with integrated ML analysis
    """
    
    def __init__(self, session_id: str, user_id: str, difficulty: str = "intermediate"):
        self.session_id = session_id
        self.user_id = user_id
        self.difficulty = difficulty
        self.session_start = datetime.now()
        
        # Initialize all AI/ML components
        self.emotion_detector = EmotionDetector()
        self.voice_analyzer = VoiceQualityAnalyzer()
        self.gemini_coach = GeminiCoachEngine()
        self.scoring_system = IntelligentScoringSystem(difficulty)
        self.facial_agent = RealtimeFacialAgent()
        self.voice_agent = RealtimeVoiceAgent()
        
        # Session metrics
        self.metrics_history = []
        self.feedback_history = []
        self.frame_count = 0
        self.transcript_buffer = ""
        
        # Real-time data
        self.last_voice_analysis = None
        self.last_facial_analysis = None
        self.last_score = None
        
        print(f"✅ AICoachSession initialized: {session_id} for user: {user_id} (difficulty: {difficulty})")
    
    async def process_video_frame(self, frame_data: bytes) -> Dict:
        """
        Process incoming video frame with emotion detection and facial analysis
        """
        try:
            # Decode frame
            if "," in frame_data:
                frame_data = frame_data.split(",")[1]
            nparr = np.frombuffer(base64.b64decode(frame_data), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None or frame.size == 0:
                return {"error": "Invalid frame data"}
            
            # Analyze facial metrics
            print(f"Processing frame {self.frame_count}...") 
            facial_analysis = self.facial_agent.analyze_frame(frame)
            print(f"Facial analysis result: {facial_analysis}")
            self.last_facial_analysis = facial_analysis
            
            self.frame_count += 1
            
            return {
                "frame_processed": self.frame_count,
                "facial_analysis": {
                    "emotion": facial_analysis.get("emotion", "neutral"),
                    "emotion_confidence": round(facial_analysis.get("emotion_confidence", 0), 2),
                    "engagement_score": round(facial_analysis.get("engagement_score", 0), 2),
                    "engagement_level": facial_analysis.get("engagement_level", "low"),
                    "eye_contact_score": round(facial_analysis.get("eye_contact_score", 0), 2),
                    "smile_score": round(facial_analysis.get("smile_score", 0), 2)
                }
            }
            
        except Exception as e:
            print(f"❌ Error processing video frame: {e}")
            return {"error": str(e)}
    
    async def process_audio_chunk(self, audio_data: bytes, transcript: str = "") -> Dict:
        """
        Process incoming audio chunk with voice analysis
        """
        try:
            # Convert audio bytes to numpy array
            if "," in audio_data:
                audio_data = audio_data.split(",")[1]
            # Decode if it's base64 string
            if isinstance(audio_data, str):
                audio_bytes = base64.b64decode(audio_data)
                audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            else:
                # Assuming simple bytes
                audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Analyze voice quality
            voice_analysis = self.voice_analyzer.analyze_audio_chunk(audio_np, transcript)
            self.last_voice_analysis = voice_analysis
            
            # Update transcript
            if transcript:
                self.transcript_buffer += " " + transcript
            
            return {
                "audio_processed": True,
                "voice_analysis": {
                    "speech_rate_wpm": round(voice_analysis.get("speech_rate_wpm", 0), 1),
                    "speech_rate_quality": voice_analysis.get("speech_rate_quality", "normal"),
                    "pitch_hz": round(voice_analysis.get("pitch_hz", 0), 1),
                    "pitch_quality": voice_analysis.get("pitch_quality", "monotone"),
                    "clarity_score": round(voice_analysis.get("clarity_score", 0) * 100, 1),
                    "volume_consistency": round(voice_analysis.get("volume_consistency", 0) * 100, 1),
                    "filler_words": voice_analysis.get("filler_words", []),
                    "voice_score": round(voice_analysis.get("overall_voice_score", 0), 1),
                    "recommendations": voice_analysis.get("recommendations", [])
                }
            }
            
        except Exception as e:
            print(f"❌ Error processing audio: {e}")
            return {"error": str(e)}
    
    async def generate_real_time_feedback(self) -> Dict:
        """
        Generate real-time AI coaching feedback using Gemini
        """
        try:
            if self.last_facial_analysis is None or self.last_voice_analysis is None:
                return {"feedback": "", "reason": "Insufficient data for feedback"}
            
            # Get current transcript segment
            transcript_segment = self.transcript_buffer.split()[-20:] if self.transcript_buffer else []
            transcript_segment = " ".join(transcript_segment)
            
            # Prepare metrics for Gemini
            voice_metrics = {
                "speech_rate_wpm": self.last_voice_analysis.get("speech_rate_wpm", 0),
                "speech_rate_quality": self.last_voice_analysis.get("speech_rate_quality", "normal"),
                "clarity_score": self.last_voice_analysis.get("clarity_score", 0),
                "volume_consistency": self.last_voice_analysis.get("volume_consistency", 0),
                "pitch_quality": self.last_voice_analysis.get("pitch_quality", "monotone"),
                "pitch_variation": self.last_voice_analysis.get("pitch_variation_semitones", 0),
                "filler_words": self.last_voice_analysis.get("filler_words", []),
                "overall_voice_score": self.last_voice_analysis.get("overall_voice_score", 0),
                "recommendations": self.last_voice_analysis.get("recommendations", [])
            }
            
            facial_metrics = {
                "emotion": self.last_facial_analysis.get("emotion", "neutral"),
                "emotion_confidence": self.last_facial_analysis.get("emotion_confidence", 0),
                "engagement_score": self.last_facial_analysis.get("engagement_score", 0),
                "engagement_level": self.last_facial_analysis.get("engagement_level", "low"),
                "eye_contact_score": self.last_facial_analysis.get("eye_contact_score", 0),
                "smile_score": self.last_facial_analysis.get("smile_score", 0)
            }
            
            # Generate Gemini feedback
            feedback = self.gemini_coach.generate_feedback_sync(
                voice_metrics,
                facial_metrics,
                transcript_segment,
                f"User is practicing {self.difficulty} level presentation"
            )
            
            self.feedback_history.append({
                "timestamp": datetime.now().isoformat(),
                "feedback": feedback,
                "voice_score": voice_metrics.get("overall_voice_score", 0),
                "engagement": facial_metrics.get("engagement_score", 0)
            })
            
            return {
                "feedback": feedback,
                "timestamp": datetime.now().isoformat(),
                "confidence": "high" if feedback else "low"
            }
            
        except Exception as e:
            print(f"❌ Error generating feedback: {e}")
            return {"error": str(e), "feedback": "Keep practicing!"}
    
    async def calculate_frame_score(self) -> Dict:
        """
        Calculate comprehensive score for current frame
        """
        try:
            if self.last_facial_analysis is None or self.last_voice_analysis is None:
                return {}
            
            # Prepare comprehensive metrics
            voice_metrics = {
                "speech_rate_wpm": self.last_voice_analysis.get("speech_rate_wpm", 0),
                "speech_rate_quality": self.last_voice_analysis.get("speech_rate_quality", "normal"),
                "clarity_score": self.last_voice_analysis.get("clarity_score", 0.5),
                "volume_consistency": self.last_voice_analysis.get("volume_consistency", 0.5),
                "pitch_quality": self.last_voice_analysis.get("pitch_quality", "monotone"),
                "pitch_variation_semitones": self.last_voice_analysis.get("pitch_variation_semitones", 0),
                "filler_word_density": self.last_voice_analysis.get("filler_word_density", 0),
                "overall_voice_score": self.last_voice_analysis.get("overall_voice_score", 50)
            }
            
            facial_metrics = {
                "engagement_score": self.last_facial_analysis.get("engagement_score", 0),
                "eye_contact_score": self.last_facial_analysis.get("eye_contact_score", 0),
                "smile_score": self.last_facial_analysis.get("smile_score", 0),
                "emotion": self.last_facial_analysis.get("emotion", "neutral"),
                "emotion_confidence": self.last_facial_analysis.get("emotion_confidence", 0)
            }
            
            # Content metrics (from transcript)
            content_metrics = {
                "word_count": len(self.transcript_buffer.split()),
                "clarity": 75,
                "structure_quality": 75,
                "vocabulary_quality": 75
            }
            
            # Pacing metrics
            pacing_metrics = {
                "pause_frequency": 0.3,
                "avg_pause_length": 0.8,
                "rhythm_consistency": 0.7
            }
            
            # Calculate final score
            score_result = self.scoring_system.calculate_score(
                voice_metrics,
                facial_metrics,
                content_metrics,
                pacing_metrics
            )
            
            self.last_score = score_result
            self.metrics_history.append(score_result)
            
            return {
                "score": {
                    "total": score_result['total_score'],
                    "grade": score_result['grade'],
                    "components": {
                        "voice": score_result['voice_score'],
                        "facial": score_result['facial_score'],
                        "content": score_result['content_score'],
                        "pacing": score_result['pacing_score']
                    },
                    "is_good_frame": score_result['is_good_frame'],
                    "feedback_priority": score_result['feedback_priority'],
                    "strengths": score_result['strengths'],
                    "weaknesses": score_result['weaknesses']
                }
            }
            
        except Exception as e:
            print(f"❌ Error calculating score: {e}")
            return {"error": str(e)}
    
    def get_session_summary(self) -> Dict:
        """
        Generate comprehensive session summary
        """
        try:
            scoring_summary = self.scoring_system.get_session_summary()
            
            return {
                "session_id": self.session_id,
                "user_id": self.user_id,
                "difficulty": self.difficulty,
                "duration_seconds": (datetime.now() - self.session_start).total_seconds(),
                "total_frames": self.frame_count,
                "total_feedback_given": len(self.feedback_history),
                "statistics": {
                    "average_score": scoring_summary.get("avg_score", 0),
                    "max_score": scoring_summary.get("max_score", 0),
                    "min_score": scoring_summary.get("min_score", 0),
                    "best_component": scoring_summary.get("best_component"),
                    "worst_component": scoring_summary.get("worst_component"),
                    "improvement_trend": scoring_summary.get("improvement_trend"),
                    "good_frames_percentage": (
                        (scoring_summary.get("good_frames_count", 0) / self.frame_count * 100)
                        if self.frame_count > 0 else 0
                    )
                },
                "recent_feedback": self.feedback_history[-5:] if self.feedback_history else [],
                "final_metrics": self.last_score if self.last_score else {}
            }
            
        except Exception as e:
            print(f"❌ Error generating summary: {e}")
            return {"error": str(e)}
    
    def reset(self):
        """Reset session state"""
        self.facial_agent.reset()
        self.voice_agent.reset()
        self.metrics_history = []
        self.feedback_history = []
        self.frame_count = 0
        self.transcript_buffer = ""
        self.last_voice_analysis = None
        self.last_facial_analysis = None
        self.last_score = None
