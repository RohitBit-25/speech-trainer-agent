from typing import Dict, List, Optional
from collections import deque
import time

class RealtimeFeedbackAgent:
    """
    Real-time feedback agent that generates instant feedback and manages game mechanics.
    Combines facial and voice analysis to provide live scoring, combos, and achievements.
    """
    
    def __init__(self, difficulty: str = "intermediate"):
        self.difficulty = difficulty
        
        # Difficulty thresholds
        self.thresholds = {
            "beginner": {"good_score": 50, "combo_increment": 3},
            "intermediate": {"good_score": 65, "combo_increment": 2},
            "expert": {"good_score": 80, "combo_increment": 1}
        }
        
        # Game state
        self.current_combo = 0
        self.max_combo = 0
        self.consecutive_good_frames = 0
        self.total_score = 0
        self.total_frames = 0
        
        # Feedback history
        self.feedback_history = deque(maxlen=100)
        
        # Achievements tracking
        self.unlocked_achievements = []
        self.achievement_definitions = self._define_achievements()
        
    def _define_achievements(self) -> Dict:
        """Define all possible achievements"""
        return {
            "first_combo": {
                "name": "First Combo!",
                "description": "Build your first 10x combo",
                "xp": 100,
                "condition": lambda state: state["combo"] >= 10
            },
            "combo_master": {
                "name": "Combo Master",
                "description": "Reach a 30x combo",
                "xp": 300,
                "condition": lambda state: state["combo"] >= 30
            },
            "legendary_combo": {
                "name": "Legendary Combo",
                "description": "Reach a 60x combo",
                "xp": 500,
                "condition": lambda state: state["combo"] >= 60
            },
            "perfect_minute": {
                "name": "Perfect Minute",
                "description": "Maintain 90+ score for 1 minute",
                "xp": 250,
                "condition": lambda state: state["perfect_frames"] >= 60
            },
            "no_fillers": {
                "name": "Filler-Free",
                "description": "Speak for 2 minutes without filler words",
                "xp": 200,
                "condition": lambda state: state["filler_free_frames"] >= 120
            },
            "eye_contact_pro": {
                "name": "Eye Contact Pro",
                "description": "Maintain 90%+ eye contact for 3 minutes",
                "xp": 300,
                "condition": lambda state: state["eye_contact_frames"] >= 180
            }
        }
    
    def analyze_performance(self, facial_analysis: Dict, voice_analysis: Dict) -> Dict:
        """
        Analyze current performance and generate real-time feedback.
        
        Args:
            facial_analysis: Results from RealtimeFacialAgent
            voice_analysis: Results from RealtimeVoiceAgent
            
        Returns:
            Dictionary with feedback, scores, and game mechanics
        """
        self.total_frames += 1
        
        # Calculate base scores (0-100)
        facial_score = facial_analysis.get("engagement_score", 0)
        voice_score = voice_analysis.get("voice_score", 0)
        
        # Weighted average (60% facial, 40% voice)
        base_score = (facial_score * 0.6) + (voice_score * 0.4)
        
        # Update combo system
        combo_info = self._update_combo(base_score)
        
        # Calculate final score with multiplier
        multiplier = combo_info["multiplier"]
        final_score = int(base_score * multiplier)
        self.total_score += final_score
        
        # Generate real-time feedback
        feedback_messages = self._generate_feedback(facial_analysis, voice_analysis, base_score)
        
        # Check for achievements
        new_achievements = self._check_achievements({
            "combo": self.current_combo,
            "perfect_frames": self.consecutive_good_frames if base_score >= 90 else 0,
            "filler_free_frames": self.total_frames if not voice_analysis.get("filler_word_detected") else 0,
            "eye_contact_frames": self.total_frames if facial_analysis.get("eye_contact_score", 0) >= 0.9 else 0
        })
        
        # Compile response
        response = {
            "facial_score": round(facial_score, 1),
            "voice_score": round(voice_score, 1),
            "base_score": round(base_score, 1),
            "final_score": final_score,
            "combo": self.current_combo,
            "max_combo": self.max_combo,
            "multiplier": multiplier,
            "combo_status": combo_info["status"],
            "feedback_messages": feedback_messages,
            "new_achievements": new_achievements,
            "total_score": self.total_score,
            "average_score": round(self.total_score / max(1, self.total_frames), 1)
        }
        
        # Add to history
        self.feedback_history.append(response)
        
        return response
    
    def _update_combo(self, score: float) -> Dict:
        """
        Update combo counter based on performance.
        
        Returns:
            Dictionary with combo info and multiplier
        """
        threshold = self.thresholds[self.difficulty]["good_score"]
        increment = self.thresholds[self.difficulty]["combo_increment"]
        
        if score >= threshold:
            # Good performance - increase combo
            self.consecutive_good_frames += 1
            
            # Increment combo every N frames based on difficulty
            if self.consecutive_good_frames % increment == 0:
                self.current_combo += 1
                self.max_combo = max(self.max_combo, self.current_combo)
            
            status = self._get_combo_status(self.current_combo)
        else:
            # Poor performance - check if combo should break
            if score < (threshold - 20):  # 20 point buffer
                # Combo broken
                if self.current_combo > 0:
                    status = "COMBO_BROKEN"
                else:
                    status = "KEEP_TRYING"
                self.current_combo = 0
                self.consecutive_good_frames = 0
            else:
                # In buffer zone - maintain combo
                status = self._get_combo_status(self.current_combo)
        
        # Calculate multiplier
        multiplier = self._calculate_multiplier(self.current_combo)
        
        return {
            "combo": self.current_combo,
            "multiplier": multiplier,
            "status": status
        }
    
    def _get_combo_status(self, combo: int) -> str:
        """Get combo status message"""
        if combo == 0:
            return "START"
        elif combo < 10:
            return "GOOD_START"
        elif combo < 30:
            return "ON_FIRE"
        elif combo < 60:
            return "UNSTOPPABLE"
        else:
            return "LEGENDARY"
    
    def _calculate_multiplier(self, combo: int) -> float:
        """Calculate score multiplier based on combo"""
        if combo < 10:
            return 1.0
        elif combo < 30:
            return 1.5
        elif combo < 60:
            return 2.0
        else:
            return 3.0
    
    def _generate_feedback(self, facial: Dict, voice: Dict, score: float) -> List[Dict]:
        """
        Generate real-time feedback messages based on analysis.
        
        Returns:
            List of feedback messages with type and content
        """
        messages = []
        
        # Positive feedback (green)
        if facial.get("eye_contact_score", 0) > 0.8:
            messages.append({"type": "positive", "message": "Great eye contact! 👁️", "icon": "eye"})
        
        if facial.get("smile_score", 0) > 0.6:
            messages.append({"type": "positive", "message": "Confident smile! 😊", "icon": "smile"})
        
        if voice.get("pitch_variation", 0) > 15:
            messages.append({"type": "positive", "message": "Good vocal variety! 🎵", "icon": "music"})
        
        if 120 <= voice.get("speech_rate_wpm", 0) <= 160:
            messages.append({"type": "positive", "message": "Perfect pace! 🎯", "icon": "target"})
        
        # Corrective feedback (yellow)
        if facial.get("eye_contact_score", 0) < 0.4:
            messages.append({"type": "warning", "message": "Look at the camera 👀", "icon": "eye-off"})
        
        if facial.get("smile_score", 0) < 0.2:
            messages.append({"type": "warning", "message": "Try smiling more 😊", "icon": "smile"})
        
        if voice.get("volume_db", 0) < -40:
            messages.append({"type": "warning", "message": "Speak louder 🔊", "icon": "volume"})
        
        if voice.get("pitch_variation", 0) < 5:
            messages.append({"type": "warning", "message": "Vary your tone 🎵", "icon": "trending-up"})
        
        # Critical feedback (red)
        if voice.get("filler_word_detected"):
            filler = voice["filler_word_detected"]
            messages.append({"type": "error", "message": f"Filler word: '{filler}' ⚠️", "icon": "alert-triangle"})
        
        if voice.get("speaking_too_fast"):
            messages.append({"type": "error", "message": "Slow down! 🐢", "icon": "zap-off"})
        
        if voice.get("speaking_too_slow"):
            messages.append({"type": "error", "message": "Speed up a bit ⚡", "icon": "zap"})
        
        if not facial.get("face_detected"):
            messages.append({"type": "error", "message": "Face not detected 📹", "icon": "camera-off"})
        
        # Limit to top 3 messages (most important)
        return messages[:3]
    
    def _check_achievements(self, state: Dict) -> List[Dict]:
        """
        Check if any achievements should be unlocked.
        
        Returns:
            List of newly unlocked achievements
        """
        new_achievements = []
        
        for achievement_id, achievement in self.achievement_definitions.items():
            # Skip if already unlocked
            if achievement_id in self.unlocked_achievements:
                continue
            
            # Check condition
            if achievement["condition"](state):
                self.unlocked_achievements.append(achievement_id)
                new_achievements.append({
                    "id": achievement_id,
                    "name": achievement["name"],
                    "description": achievement["description"],
                    "xp": achievement["xp"]
                })
        
        return new_achievements
    
    def get_session_summary(self) -> Dict:
        """Get summary statistics for the session"""
        return {
            "total_frames": self.total_frames,
            "total_score": self.total_score,
            "average_score": round(self.total_score / max(1, self.total_frames), 1),
            "max_combo": self.max_combo,
            "achievements_unlocked": len(self.unlocked_achievements),
            "total_xp_earned": sum(
                self.achievement_definitions[a]["xp"] 
                for a in self.unlocked_achievements
            )
        }
    
    def reset(self):
        """Reset the agent state"""
        self.current_combo = 0
        self.max_combo = 0
        self.consecutive_good_frames = 0
        self.total_score = 0
        self.total_frames = 0
        self.feedback_history.clear()
        self.unlocked_achievements = []
