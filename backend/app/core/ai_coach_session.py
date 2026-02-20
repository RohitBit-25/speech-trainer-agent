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
from app.core.voice_quality_analyzer import VoiceQualityAnalyzer
# from app.core.gemini_coach_engine import GeminiCoachEngine
from app.core.openrouter_coach_engine import OpenRouterCoachEngine
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
        # self.gemini_coach = GeminiCoachEngine()
        self.gemini_coach = OpenRouterCoachEngine() # Keeping same variable name for compatibility or refactor? Let's keep it but maybe rename internal usage if needed.
        # Actually better to rename it to 'coach' or keep 'gemini_coach' to minimize diffs if logic is same.
        # Let's keep 'gemini_coach' as the attribute name to avoid breaking other methods in this file, 
        # but usage will be OpenRouterCoachEngine.
        
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
            # Decode frame - handle both data:image;base64 and plain base64 formats
            if isinstance(frame_data, str) and "," in frame_data:
                # Strip MIME type prefix if present: "data:image/jpeg;base64,xxxxx"
                frame_data = frame_data.split(",")[1]
            
            try:
                decoded_bytes = base64.b64decode(frame_data)
                nparr = np.frombuffer(decoded_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as decode_error:
                print(f"❌ Base64 decode failed: {decode_error}")
                return {"error": f"Frame decode failed: {decode_error}"}
            
            if frame is None or frame.size == 0:
                return {"error": f"Invalid frame data - decoded but frame is None or empty. Bytes decoded: {len(decoded_bytes) if 'decoded_bytes' in locals() else 0}"}
            
            # Analyze facial metrics
            print(f"🎥 Processing frame {self.frame_count} (shape: {frame.shape})...") 
            facial_analysis = self.facial_agent.analyze_frame(frame)
            print(f"📊 Facial analysis result keys: {facial_analysis.keys() if facial_analysis else 'None'}")
            
            if not facial_analysis:
                print("⚠️ WARNING: Facial analysis returned None")
                facial_analysis = {
                    "emotion": "unknown",
                    "emotion_confidence": 0,
                    "engagement_score": 0,
                    "engagement_level": "unknown",
                    "eye_contact_score": 0,
                    "smile_score": 0,
                    "face_detected": False
                }
            
            self.last_facial_analysis = facial_analysis
            self.frame_count += 1
            
            return {
                "frame_processed": self.frame_count,
                "facial_analysis": {
                    "emotion": facial_analysis.get("emotion", "unknown"),
                    "emotion_confidence": round(facial_analysis.get("emotion_confidence", 0), 2),
                    "engagement_score": round(facial_analysis.get("engagement_score", 0), 2),
                    "engagement_level": facial_analysis.get("engagement_level", "unknown"),
                    "eye_contact_score": round(facial_analysis.get("eye_contact_score", 0), 2),
                    "smile_score": round(facial_analysis.get("smile_score", 0), 2),
                    "face_detected": facial_analysis.get("face_detected", False)
                }
            }
            
        except Exception as e:
            print(f"❌ Error processing video frame: {e}")
            import traceback
            traceback.print_exc()
            return {"error": f"Exception in frame processing: {str(e)}"}
    
    async def process_audio_chunk(self, audio_data: bytes, transcript: str = "") -> Dict:
        """
        Process incoming audio chunk with voice analysis
        """
        try:
            # Convert audio bytes to numpy array
            try:
                if isinstance(audio_data, str) and "," in audio_data:
                    # Strip MIME type prefix if present
                    audio_data = audio_data.split(",")[1]
                
                if isinstance(audio_data, str):
                    # Decode base64 string
                    audio_bytes = base64.b64decode(audio_data)
                else:
                    # Already bytes
                    audio_bytes = audio_data
                
                # Convert to float audio array
                audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                
                print(f"🎙️ Processing audio chunk ({len(audio_bytes)} bytes → {audio_np.shape})")
                
            except Exception as audio_decode_error:
                print(f"❌ Audio decode failed: {audio_decode_error}")
                return {"error": f"Audio decode failed: {audio_decode_error}", "voice_analysis": None}
            
            # Analyze voice quality
            voice_analysis = self.voice_analyzer.analyze_audio_chunk(audio_np, transcript)
            
            if not voice_analysis:
                print("⚠️ WARNING: Voice analysis returned None")
                voice_analysis = {
                    "speech_rate_wpm": 0,
                    "speech_rate_quality": "unknown",
                    "pitch_hz": 0,
                    "pitch_quality": "unknown",
                    "clarity_score": 0,
                    "volume_consistency": 0,
                    "overall_voice_score": 0
                }
            
            print(f"📊 Voice analysis result: speech_rate={voice_analysis.get('speech_rate_wpm')}, pitch={voice_analysis.get('pitch_hz')}")
            
            self.last_voice_analysis = voice_analysis
            
            # Update transcript from client OR server verification
            if transcript:
                self.transcript_buffer += " " + transcript
            elif voice_analysis.get("generated_transcript"):
                self.transcript_buffer += " " + voice_analysis["generated_transcript"]
                
            print(f"📝 Updated transcript buffer: {len(self.transcript_buffer)} chars")
            
            return {
                "audio_processed": True,
                "voice_analysis": {
                    "speech_rate_wpm": round(voice_analysis.get("speech_rate_wpm", 0), 1),
                    "speech_rate_quality": voice_analysis.get("speech_rate_quality", "unknown"),
                    "pitch_hz": round(voice_analysis.get("pitch_hz", 0), 1),
                    "pitch_variation_semitones": round(voice_analysis.get("pitch_variation_semitones", 0), 1),
                    "pitch_quality": voice_analysis.get("pitch_quality", "unknown"),
                    "clarity_score": round(voice_analysis.get("clarity_score", 0) * 100, 1) if voice_analysis.get("clarity_score") is not None else 0,
                    "volume_db": round(voice_analysis.get("volume_db", 0), 1),
                    "volume_consistency": round(voice_analysis.get("volume_consistency", 0) * 100, 1) if voice_analysis.get("volume_consistency") is not None else 0,
                    "speech_energy": round(voice_analysis.get("speech_energy", 0), 1),
                    "speech_energy_stability": round(voice_analysis.get("speech_energy_stability", 0) * 100, 1) if voice_analysis.get("speech_energy_stability") is not None else 0,
                    "filler_words": voice_analysis.get("filler_words", []),
                    "filler_word_density": round(voice_analysis.get("filler_word_density", 0), 1),
                    "overall_voice_score": round(voice_analysis.get("overall_voice_score", 0), 1),
                    "recommendations": voice_analysis.get("recommendations", []),
                    "transcript": voice_analysis.get("generated_transcript")
                }
            }
            
        except Exception as e:
            print(f"❌ Error processing audio chunk: {e}")
            import traceback
            traceback.print_exc()
            return {"error": f"Exception in audio processing: {str(e)}", "voice_analysis": None}
    
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
            
            # Generate OpenRouter feedback
            feedback = await self.gemini_coach.generate_real_time_feedback(
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
            # Fallback to heuristic feedback if AI fails (e.g. quota exceeded)
            fallback_feedback = self._generate_fallback_feedback(voice_metrics, facial_metrics)
            return {"error": str(e), "feedback": fallback_feedback}

    def _generate_fallback_feedback(self, voice_metrics: Dict, facial_metrics: Dict) -> str:
        """Generate heuristic feedback when AI model is unavailable"""
        feedback_items = []
        
        # Voice feedback
        if voice_metrics.get("speech_rate_quality") == "too_fast":
            feedback_items.append("Try to speak a bit slower for better clarity.")
        elif voice_metrics.get("speech_rate_quality") == "too_slow":
            feedback_items.append("You can pick up the pace slightly.")
            
        if voice_metrics.get("volume_consistency", 1) < 0.6:
            feedback_items.append("Try to maintain a consistent speaking volume.")
            
        if voice_metrics.get("pitch_quality") == "monotone":
            feedback_items.append("Add more variation to your tone to stay engaging.")
            
        # Facial feedback
        if facial_metrics.get("eye_contact_score", 1) < 0.4:
            feedback_items.append("Maintain better eye contact with the camera.")
            
        if facial_metrics.get("smile_score", 1) < 0.3:
            feedback_items.append("Don't forget to smile occasionally!")
            
        if facial_metrics.get("engagement_level") == "low":
            feedback_items.append("Keep your energy up to engage the audience.")
            
        if not feedback_items:
            return "You're doing great! Keep maintaining this energy."
            
        return " ".join(feedback_items[:2])
    
    async def calculate_frame_score(self) -> Dict:
        """
        Calculate comprehensive score for current frame based on ACTUAL data
        """
        try:
            if self.last_facial_analysis is None or self.last_voice_analysis is None:
                return {"error": "No analysis data available", "score": None}
            
            # Prepare comprehensive metrics using ACTUAL data
            voice_metrics = {
                "speech_rate_wpm": self.last_voice_analysis.get("speech_rate_wpm", 0),
                "speech_rate_quality": self.last_voice_analysis.get("speech_rate_quality", "unknown"),
                "clarity_score": self.last_voice_analysis.get("clarity_score", 0),
                "volume_consistency": self.last_voice_analysis.get("volume_consistency", 0),
                "pitch_quality": self.last_voice_analysis.get("pitch_quality", "unknown"),
                "pitch_variation_semitones": self.last_voice_analysis.get("pitch_variation_semitones", 0),
                "filler_word_density": self.last_voice_analysis.get("filler_word_density", 0),
                "overall_voice_score": self.last_voice_analysis.get("overall_voice_score", 0)
            }
            
            facial_metrics = {
                "engagement_score": self.last_facial_analysis.get("engagement_score", 0),
                "eye_contact_score": self.last_facial_analysis.get("eye_contact_score", 0),
                "smile_score": self.last_facial_analysis.get("smile_score", 0),
                "emotion": self.last_facial_analysis.get("emotion", "unknown"),
                "emotion_confidence": self.last_facial_analysis.get("emotion_confidence", 0)
            }
            
            # Content metrics - calculate from ACTUAL transcript
            # NO hardcoded values like 75!
            content_metrics = {}
            
            if self.transcript_buffer:
                words = self.transcript_buffer.split()
                word_count = len(words)
                unique_words = len(set(w.lower() for w in words))
                
                # Calculate vocabulary diversity (lower is more repetitive)
                vocabulary_diversity = (unique_words / max(word_count, 1)) * 100
                
                # Word count is a proxy for completeness/structure
                # More words generally means more detail (cap at 100)
                structure_quality = min(100, (word_count / 50) * 100) if word_count > 0 else 0
                
                # Estimate clarity based on long-word ratio (complex vocab)
                long_words = sum(1 for w in words if len(w) > 6)
                clarity = (long_words / max(word_count, 1)) * 100 if word_count > 0 else 0
                
                content_metrics = {
                    "word_count": word_count,
                    "unique_words": unique_words,
                    "clarity": round(clarity, 1),  # Based on vocabulary complexity
                    "structure_quality": round(structure_quality, 1),  # Based on length
                    "vocabulary_quality": round(vocabulary_diversity, 1)  # Unique/total ratio
                }
                print(f"📝 Content metrics: {word_count} words, {unique_words} unique, vocab={vocabulary_diversity:.1f}%")
            else:
                # No transcript yet - return null metrics
                content_metrics = {
                    "word_count": 0,
                    "clarity": None,
                    "structure_quality": None,
                    "vocabulary_quality": None,
                    "error": "No transcript data yet"
                }
            
            # Pacing metrics - use ACTUAL voice data if available
            pacing_metrics = {}
            
            if self.last_voice_analysis.get("pause_frequency") is not None:
                pacing_metrics = {
                    "pause_frequency": self.last_voice_analysis.get("pause_frequency", 0),
                    "avg_pause_length": self.last_voice_analysis.get("avg_pause_length", 0),
                    "rhythm_consistency": self.last_voice_analysis.get("rhythm_score", 0)
                }
            else:
                # No pacing data yet
                pacing_metrics = {
                    "pause_frequency": None,
                    "avg_pause_length": None,
                    "rhythm_consistency": None,
                    "error": "No pacing data available yet"
                }
            
            print(f"📊 Calculating score with voice={voice_metrics.get('overall_voice_score')}, facial={facial_metrics.get('engagement_score')}")
            
            # Calculate final score using ACTUAL data
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
                    "total_score": score_result.get('total_score', 0),
                    "grade": score_result.get('grade', 'N/A'),
                    "voice_score": score_result.get('voice_score', 0),
                    "facial_score": score_result.get('facial_score', 0),
                    "content_score": score_result.get('content_score', 0),
                    "pacing_score": score_result.get('pacing_score', 0),
                    "is_good_frame": score_result.get('is_good_frame', False),
                    "feedback_priority": score_result.get('feedback_priority', []),
                    "strengths": score_result.get('strengths', []),
                    "weaknesses": score_result.get('weaknesses', []),
                    "timestamp": score_result.get('timestamp', datetime.now().isoformat())
                }
            }
            
        except Exception as e:
            print(f"❌ Error calculating score: {e}")
            import traceback
            traceback.print_exc()
            return {"error": str(e), "score": None}
    
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
