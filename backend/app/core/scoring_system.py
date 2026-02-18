"""
Intelligent Scoring Algorithm for Speech Training
Combines facial, voice, and content metrics into a comprehensive score
"""

from typing import Dict, List, Optional
import json
from datetime import datetime

class IntelligentScoringSystem:
    """
    ML-based scoring system that provides:
    - Real-time performance scores (0-100)
    - Adaptive difficulty adjustment
    - Personalized feedback priorities
    - Progress tracking and gamification
    """
    
    def __init__(self, difficulty: str = "intermediate"):
        self.difficulty = difficulty
        self.session_start = datetime.now()
        
        # Difficulty-based weights
        self.difficulty_weights = {
            "beginner": {
                "voice": 0.35,  # Voice quality more important for beginners
                "facial": 0.30,
                "content": 0.20,
                "pacing": 0.15,
                "min_score_threshold": 50  # Lower threshold
            },
            "intermediate": {
                "voice": 0.30,
                "facial": 0.25,
                "content": 0.30,
                "pacing": 0.15,
                "min_score_threshold": 65
            },
            "expert": {
                "voice": 0.25,
                "facial": 0.20,
                "content": 0.40,  # Content quality crucial for experts
                "pacing": 0.15,
                "min_score_threshold": 80
            }
        }
        
        self.current_weights = self.difficulty_weights[difficulty]
        self.score_history = []
        self.performance_trends = {}
        
    def calculate_score(
        self,
        voice_metrics: Dict,
        facial_metrics: Dict,
        content_metrics: Dict,
        pacing_metrics: Dict
    ) -> Dict:
        """
        Calculate comprehensive performance score.
        
        Returns:
            {
                'total_score': 0-100,
                'voice_score': 0-100,
                'facial_score': 0-100,
                'content_score': 0-100,
                'pacing_score': 0-100,
                'grade': 'A' | 'B' | 'C' | 'D' | 'F',
                'feedback_priority': ['first', 'second', 'third'],
                'strengths': [],
                'weaknesses': [],
                'is_good_frame': boolean
            }
        """
        
        # Calculate component scores
        voice_score = self._score_voice_metrics(voice_metrics)
        facial_score = self._score_facial_metrics(facial_metrics)
        content_score = self._score_content_metrics(content_metrics)
        pacing_score = self._score_pacing_metrics(pacing_metrics)
        
        # Weighted total
        total_score = (
            voice_score * self.current_weights['voice'] +
            facial_score * self.current_weights['facial'] +
            content_score * self.current_weights['content'] +
            pacing_score * self.current_weights['pacing']
        )
        
        total_score = float(min(100, max(0, total_score)))
        
        # Determine grade
        grade = self._get_grade(total_score)
        
        # Identify strengths and weaknesses
        strengths, weaknesses = self._identify_performance_areas(
            voice_score, facial_score, content_score, pacing_score
        )
        
        # Determine feedback priority
        feedback_priority = self._prioritize_feedback(
            voice_score, facial_score, content_score, pacing_score
        )
        
        # Check if this is a "good frame"
        is_good_frame = total_score >= self.current_weights['min_score_threshold']
        
        result = {
            'total_score': float(round(total_score, 1)),
            'voice_score': float(round(voice_score, 1)),
            'facial_score': float(round(facial_score, 1)),
            'content_score': float(round(content_score, 1)),
            'pacing_score': float(round(pacing_score, 1)),
            'grade': grade,
            'feedback_priority': feedback_priority,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'is_good_frame': is_good_frame,
            'timestamp': datetime.now().isoformat()
        }
        
        self.score_history.append(result)
        return result
    
    def _score_voice_metrics(self, metrics: Dict) -> float:
        """
        Score voice quality (0-100)
        Based on: clarity, volume consistency, pitch variation, filler words, speech rate
        """
        if not metrics:
            return 50.0
        
        clarity = metrics.get('clarity_score', 0.5) * 100
        volume_consistency = metrics.get('volume_consistency', 0.5) * 100
        pitch_quality = {
            'monotone': 40,
            'adequate': 70,
            'expressive': 95
        }.get(metrics.get('pitch_quality', 'adequate'), 70)
        
        filler_word_density = metrics.get('filler_word_density', 0)
        filler_score = max(0, 100 - (filler_word_density * 10))
        
        speech_quality = {
            'too_fast': 60,
            'too_slow': 60,
            'optimal': 100
        }.get(metrics.get('speech_rate_quality', 'optimal'), 80)
        
        # Weighted combination
        voice_score = (
            clarity * 0.25 +
            volume_consistency * 0.20 +
            pitch_quality * 0.25 +
            filler_score * 0.15 +
            speech_quality * 0.15
        )
        
        return float(min(100, max(0, voice_score)))
    
    def _score_facial_metrics(self, metrics: Dict) -> float:
        """
        Score facial expression and engagement (0-100)
        Based on: engagement score, eye contact, smile, emotion appropriateness
        """
        if not metrics:
            return 50.0
        
        engagement_score = metrics.get('engagement_score', 0.5) * 100
        eye_contact = metrics.get('eye_contact_score', 0.5) * 100
        smile = metrics.get('smile_score', 0.3) * 100
        
        # Emotion scoring (positive emotions get higher scores)
        emotion = metrics.get('emotion', 'neutral')
        emotion_confidence = metrics.get('emotion_confidence', 0.5)
        
        emotion_scores = {
            'happiness': 95,
            'surprise': 90,
            'confident': 85,
            'neutral': 70,
            'sad': 40,
            'anger': 30,
            'fear': 35
        }
        emotion_score = emotion_scores.get(emotion, 70) * emotion_confidence
        
        facial_score = (
            engagement_score * 0.35 +
            eye_contact * 0.30 +
            smile * 0.20 +
            emotion_score * 0.15
        )
        
        return float(min(100, max(0, facial_score)))
    
    def _score_content_metrics(self, metrics: Dict) -> float:
        """
        Score content quality (0-100)
        Based on: transcription clarity, structure, length, vocabulary
        """
        if not metrics:
            return 50.0
        
        # Word count ideal range: 100-500 words per minute
        word_count = metrics.get('word_count', 0)
        words_per_second = metrics.get('words_per_second', 2)
        
        ideal_density_score = 80  # Default if metrics not available
        if words_per_second > 0:
            if 1.5 <= words_per_second <= 3.5:
                ideal_density_score = 100
            elif 1.0 <= words_per_second < 1.5 or 3.5 < words_per_second <= 4.5:
                ideal_density_score = 80
            else:
                ideal_density_score = 50
        
        # Grammar and clarity assessment
        clarity_score = metrics.get('clarity', 75)
        structure_score = metrics.get('structure_quality', 75)
        vocabulary_score = metrics.get('vocabulary_quality', 75)
        
        content_score = (
            ideal_density_score * 0.30 +
            clarity_score * 0.25 +
            structure_score * 0.25 +
            vocabulary_score * 0.20
        )
        
        return float(min(100, max(0, content_score)))
    
    def _score_pacing_metrics(self, metrics: Dict) -> float:
        """
        Score pacing and rhythm (0-100)
        Based on: pause frequency, pause length, rhythm consistency
        """
        if not metrics:
            return 50.0
        
        pause_frequency = metrics.get('pause_frequency', 0.3)  # pauses per second
        avg_pause_length = metrics.get('avg_pause_length', 0.8)  # seconds
        
        # Ideal: 0.3-0.5 pauses per second, 0.5-1.5 seconds average pause
        frequency_score = 100
        if pause_frequency < 0.1 or pause_frequency > 0.7:
            frequency_score = 60
        elif pause_frequency < 0.2 or pause_frequency > 0.6:
            frequency_score = 80
        
        pause_score = 100
        if avg_pause_length < 0.3 or avg_pause_length > 2.0:
            pause_score = 60
        elif avg_pause_length < 0.5 or avg_pause_length > 1.5:
            pause_score = 80
        
        rhythm_consistency = metrics.get('rhythm_consistency', 0.7) * 100
        
        pacing_score = (
            frequency_score * 0.35 +
            pause_score * 0.35 +
            rhythm_consistency * 0.30
        )
        
        return float(min(100, max(0, pacing_score)))
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 80:
            return "B+"
        elif score >= 75:
            return "B"
        elif score >= 70:
            return "C+"
        elif score >= 65:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def _identify_performance_areas(
        self,
        voice: float,
        facial: float,
        content: float,
        pacing: float
    ) -> tuple:
        """Identify strengths and weaknesses"""
        scores = {
            'voice': voice,
            'facial': facial,
            'content': content,
            'pacing': pacing
        }
        
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        strengths = [s[0] for s in sorted_scores[:2] if s[1] >= 70]
        weaknesses = [s[0] for s in sorted_scores[-2:] if s[1] < 75]
        
        return strengths, weaknesses
    
    def _prioritize_feedback(
        self,
        voice: float,
        facial: float,
        content: float,
        pacing: float
    ) -> List[str]:
        """Prioritize feedback areas based on scores and difficulty"""
        areas = {
            'voice': voice,
            'facial': facial,
            'content': content,
            'pacing': pacing
        }
        
        # Weight by importance and score
        weighted_scores = {}
        for area, score in areas.items():
            weight = self.current_weights.get(area, 0.25)
            # Lower scores get higher priority
            importance = weight * (100 - score)
            weighted_scores[area] = importance
        
        # Sort by importance (descending)
        prioritized = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)
        return [item[0] for item in prioritized[:3]]
    
    def get_session_summary(self) -> Dict:
        """Get comprehensive session summary"""
        if not self.score_history:
            return {
                'avg_score': 0,
                'max_score': 0,
                'min_score': 0,
                'best_component': None,
                'worst_component': None,
                'improvement_trend': 'stable',
                'total_frames': 0
            }
        
        scores = [s['total_score'] for s in self.score_history]
        voice_scores = [s['voice_score'] for s in self.score_history]
        facial_scores = [s['facial_score'] for s in self.score_history]
        content_scores = [s['content_score'] for s in self.score_history]
        pacing_scores = [s['pacing_score'] for s in self.score_history]
        
        avg_scores = {
            'total': sum(scores) / len(scores) if scores else 0,
            'voice': sum(voice_scores) / len(voice_scores) if voice_scores else 0,
            'facial': sum(facial_scores) / len(facial_scores) if facial_scores else 0,
            'content': sum(content_scores) / len(content_scores) if content_scores else 0,
            'pacing': sum(pacing_scores) / len(pacing_scores) if pacing_scores else 0
        }
        
        best_component = max(avg_scores.items(), key=lambda x: x[1])
        worst_component = min(avg_scores.items(), key=lambda x: x[1])
        
        # Calculate trend
        if len(scores) > 5:
            first_half_avg = sum(scores[:len(scores)//2]) / (len(scores)//2)
            second_half_avg = sum(scores[len(scores)//2:]) / (len(scores) - len(scores)//2)
            if second_half_avg > first_half_avg * 1.05:
                trend = 'improving'
            elif second_half_avg < first_half_avg * 0.95:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'insufficient_data'
        
        return {
            'avg_score': round(avg_scores['total'], 1),
            'max_score': round(max(scores), 1),
            'min_score': round(min(scores), 1),
            'component_averages': {k: round(v, 1) for k, v in avg_scores.items()},
            'best_component': best_component[0],
            'worst_component': worst_component[0],
            'improvement_trend': trend,
            'total_frames': len(self.score_history),
            'good_frames_count': sum(1 for s in self.score_history if s['is_good_frame'])
        }
