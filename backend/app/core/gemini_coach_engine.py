"""
Gemini-based Real-time Feedback Engine
Provides intelligent, context-aware feedback using Google Gemini API
"""

import os
import json
import asyncio
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import google.generativeai as genai
from app.core.config import settings

class GeminiCoachEngine:
    """
    AI Coach powered by Gemini 2.0 Flash
    Provides real-time feedback based on performance metrics
    """
    
    def __init__(self):
        """Initialize Gemini API client"""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name='gemini-2.0-flash',
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=200,
                top_p=0.95
            ),
            system_instruction=self._get_system_prompt()
        )
        
        # Feedback history for context
        self.feedback_history = []
        self.max_history = 10
        
        # Performance tracking
        self.session_metrics = {
            'total_feedback': 0,
            'avg_engagement': 0.0,
            'avg_voice_score': 0.0,
            'improvement_areas': []
        }
        
        # Feedback cache to avoid duplicate feedback
        self.last_feedback_time = 0
        self.min_feedback_interval = 3  # Minimum seconds between feedback
        
    def _get_system_prompt(self) -> str:
        """System prompt for the AI coach"""
        return """You are an expert speech and presentation coach with expertise in:
- Public speaking and presentation skills
- Vocal techniques (pitch, clarity, pace, volume)
- Non-verbal communication (facial expressions, eye contact, posture)
- Emotional intelligence and engagement
- Real-time performance feedback

Your role is to provide IMMEDIATE, ACTIONABLE, and ENCOURAGING feedback to speakers.

IMPORTANT GUIDELINES:
1. Keep feedback SHORT - maximum 2 sentences (15-20 words)
2. Be SPECIFIC - reference exact metrics when possible
3. Be ACTIONABLE - tell them what to do, not just what to improve
4. Be ENCOURAGING - always maintain a positive, constructive tone
5. Focus on THE MOST CRITICAL ISSUE at any given moment
6. Use simple, direct language

FEEDBACK TYPES:
- PRAISE: When performance is good, acknowledge it genuinely
- CORRECTION: When performance drops, suggest specific improvement
- REMINDER: When they slip on something good, remind them to maintain it
- ENCOURAGEMENT: When struggling, offer support and next steps

Examples of good feedback:
- "Great energy! Maintain that smile."
- "Slow down slightly—clarity increased. Well done!"
- "Pause before key points to let them land."
- "Your pitch is engaging. Keep that variety!"

METRICS YOU'LL RECEIVE:
- Voice metrics: pitch, clarity, speech rate, volume consistency
- Facial metrics: smile score, eye contact, engagement level
- Content: filler words, sentence structure, topic flow
- Overall scores (0-100 scale)

Respond ONLY with feedback - no explanations, meta-commentary, or preamble."""
    
    async def generate_real_time_feedback(
        self,
        voice_metrics: Dict,
        facial_metrics: Dict,
        transcript_segment: str = "",
        context: str = ""
    ) -> str:
        """
        Generate real-time feedback based on current performance metrics.
        
        Args:
            voice_metrics: Voice quality analysis results
            facial_metrics: Facial/engagement analysis results
            transcript_segment: Current transcript segment (optional)
            context: Additional context about the challenge
            
        Returns:
            Feedback string to display/speak to user
        """
        
        # Rate limiting - don't give feedback too frequently
        current_time = time.time()
        if current_time - self.last_feedback_time < self.min_feedback_interval:
            return ""
        
        try:
            # Build performance snapshot
            performance_snapshot = self._build_performance_snapshot(
                voice_metrics,
                facial_metrics,
                transcript_segment
            )
            
            # Construct prompt
            prompt = self._construct_feedback_prompt(
                performance_snapshot,
                context
            )
            
            # Get feedback from Gemini
            feedback = await self._call_gemini_async(prompt)
            
            # Update history and metrics
            self._update_feedback_history(feedback, performance_snapshot)
            self.last_feedback_time = current_time
            
            return feedback.strip()
            
        except Exception as e:
            print(f"⚠️ Error generating feedback: {e}")
            return ""
    
    def generate_feedback_sync(
        self,
        voice_metrics: Dict,
        facial_metrics: Dict,
        transcript_segment: str = "",
        context: str = ""
    ) -> str:
        """Synchronous version for non-async contexts"""
        try:
            performance_snapshot = self._build_performance_snapshot(
                voice_metrics,
                facial_metrics,
                transcript_segment
            )
            
            prompt = self._construct_feedback_prompt(
                performance_snapshot,
                context
            )
            
            response = self.model.generate_content(prompt)
            feedback = response.text if response else ""
            
            self._update_feedback_history(feedback, performance_snapshot)
            self.last_feedback_time = time.time()
            
            return feedback.strip()
            
        except Exception as e:
            print(f"⚠️ Error generating feedback: {e}")
            return ""
    
    async def _call_gemini_async(self, prompt: str) -> str:
        """Asynchronously call Gemini API"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: self.model.generate_content(prompt).text
        )
    
    def _build_performance_snapshot(
        self,
        voice_metrics: Dict,
        facial_metrics: Dict,
        transcript: str
    ) -> Dict:
        """Build a snapshot of current performance"""
        snapshot = {
            'timestamp': datetime.now().isoformat(),
            'voice': {
                'speech_rate_wpm': voice_metrics.get('speech_rate_wpm', 0),
                'speech_rate_quality': voice_metrics.get('speech_rate_quality', 'normal'),
                'pitch_variation': voice_metrics.get('pitch_variation_semitones', 0),
                'pitch_quality': voice_metrics.get('pitch_quality', 'monotone'),
                'clarity_score': voice_metrics.get('clarity_score', 0),
                'volume_consistency': voice_metrics.get('volume_consistency', 0),
                'filler_words': voice_metrics.get('filler_words', []),
                'voice_score': voice_metrics.get('overall_voice_score', 0),
                'recommendations': voice_metrics.get('recommendations', [])
            },
            'facial': {
                'primary_emotion': facial_metrics.get('primary_emotion', 'neutral'),
                'primary_confidence': facial_metrics.get('primary_confidence', 0),
                'engagement_score': facial_metrics.get('engagement_score', 0),
                'eye_contact_score': facial_metrics.get('eye_contact_score', 0),
                'smile_score': facial_metrics.get('smile_score', 0)
            },
            'content': {
                'transcript': transcript,
                'word_count': len(transcript.split()) if transcript else 0
            }
        }
        return snapshot
    
    def _construct_feedback_prompt(
        self,
        performance: Dict,
        context: str = ""
    ) -> str:
        """Construct the feedback prompt for Gemini"""
        
        voice = performance['voice']
        facial = performance['facial']
        content = performance['content']
        
        # Identify the strongest and weakest metrics
        strengths, weaknesses = self._identify_performance_areas(performance)
        
        prompt = f"""Based on the current performance metrics, provide ONE concise, actionable tip maximum 15-20 words):

VOICE METRICS:
- Speech Rate: {voice['speech_rate_wpm']:.0f} WPM ({voice['speech_rate_quality']})
- Clarity Score: {voice['clarity_score']*100:.0f}%
- Volume Consistency: {voice['volume_consistency']*100:.0f}%
- Pitch Variation: {voice['pitch_quality']} ({voice['pitch_variation']:.1f} semitones)
- Voice Score: {voice['voice_score']:.0f}/100
- Filler Words: {', '.join(voice['filler_words']) if voice['filler_words'] else 'None detected'}

FACIAL/ENGAGEMENT METRICS:
- Primary Emotion: {facial['primary_emotion']} ({facial['primary_confidence']*100:.0f}% confidence)
- Engagement Score: {facial['engagement_score']*100:.0f}%
- Eye Contact: {facial['eye_contact_score']*100:.0f}%
- Smile: {facial['smile_score']*100:.0f}%

RECENT TRANSCRIPT: "{content['transcript'][:100]}..."

IDENTIFIED STRENGTHS: {', '.join(strengths) if strengths else 'Building up...'}
CURRENT FOCUS AREAS: {', '.join(weaknesses) if weaknesses else 'Monitor overall quality'}

{"CONTEXT: " + context if context else ""}

Provide ONLY feedback - be brief, specific, and actionable. No meta-commentary."""
        
        return prompt
    
    def _identify_performance_areas(self, performance: Dict) -> Tuple[List[str], List[str]]:
        """Identify strengths and areas for improvement"""
        strengths = []
        weaknesses = []
        
        voice = performance['voice']
        facial = performance['facial']
        
        # Identify strengths
        if voice['voice_score'] > 75:
            strengths.append("Strong voice quality")
        if voice['clarity_score'] > 0.8:
            strengths.append("Excellent clarity")
        if voice['pitch_quality'] == 'expressive':
            strengths.append("Good pitch variation")
        if facial['engagement_score'] > 0.7:
            strengths.append("High engagement")
        if facial['smile_score'] > 0.6:
            strengths.append("Good smile frequency")
            
        # Identify weaknesses
        if voice['speech_rate_quality'] == 'too_fast':
            weaknesses.append("Speaking too fast")
        elif voice['speech_rate_quality'] == 'too_slow':
            weaknesses.append("Speaking too slowly")
            
        if voice['clarity_score'] < 0.6:
            weaknesses.append("Clarity needs work")
        if voice['volume_consistency'] < 0.6:
            weaknesses.append("Improve volume consistency")
        if voice['pitch_quality'] == 'monotone':
            weaknesses.append("Add pitch variety")
        if voice['filler_words']:
            weaknesses.append("Reduce filler words")
        if facial['engagement_score'] < 0.5:
            weaknesses.append("Low engagement")
        if facial['eye_contact_score'] < 0.5:
            weaknesses.append("Increase eye contact")
            
        return strengths[:2], weaknesses[:2]
    
    def _update_feedback_history(self, feedback: str, performance: Dict):
        """Update feedback history and session metrics"""
        self.feedback_history.append({
            'timestamp': datetime.now().isoformat(),
            'feedback': feedback,
            'voice_score': performance['voice']['voice_score'],
            'engagement': performance['facial']['engagement_score']
        })
        
        # Keep only recent history
        if len(self.feedback_history) > self.max_history:
            self.feedback_history.pop(0)
        
        # Update session metrics
        if self.feedback_history:
            self.session_metrics['total_feedback'] = len(self.feedback_history)
            self.session_metrics['avg_voice_score'] = np.mean([
                f['voice_score'] for f in self.feedback_history
            ])
            self.session_metrics['avg_engagement'] = np.mean([
                f['engagement'] for f in self.feedback_history
            ])
    
    async def generate_session_summary(
        self,
        feedback_session_data: Dict
    ) -> str:
        """Generate comprehensive session summary using Gemini"""
        try:
            summary_prompt = f"""Based on this entire practice session, provide a comprehensive, encouraging summary (2-3 paragraphs):

SESSION STATISTICS:
- Total Feedback Points: {len(self.feedback_history)}
- Average Voice Score: {self.session_metrics['avg_voice_score']:.0f}/100
- Average Engagement: {self.session_metrics['avg_engagement']*100:.0f}%
- Total Duration: {feedback_session_data.get('duration', 0):.0f} seconds
- Words Spoken: {feedback_session_data.get('word_count', 0)}

KEY STRENGTHS IDENTIFIED:
{chr(10).join(f"- {s}" for s in feedback_session_data.get('strengths', []))}

AREAS FOR IMPROVEMENT:
{chr(10).join(f"- {w}" for w in feedback_session_data.get('weaknesses', []))}

FEEDBACK HISTORY:
{chr(10).join(f"{i+1}. {f['feedback']}" for i, f in enumerate(self.feedback_history[-5:]))}

Provide an encouraging but honest summary that:
1. Celebrates their efforts and improvements
2. Identifies key takeaways
3. Suggests focused practice areas
4. Motivates them to continue improving"""
            
            response = await self._call_gemini_async(summary_prompt)
            return response.strip()
            
        except Exception as e:
            print(f"⚠️ Error generating summary: {e}")
            return "Great session! Keep practicing and you'll see continued improvement."
    
    def get_session_metrics(self) -> Dict:
        """Get current session metrics"""
        return self.session_metrics.copy()

# Add numpy import for this module
import numpy as np
