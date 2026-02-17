import numpy as np
import librosa
from typing import Dict, List, Optional
import time
from collections import deque

class RealtimeVoiceAgent:
    """
    Lightweight voice analysis agent optimized for real-time audio processing.
    Analyzes audio chunks for pitch, volume, speech rate, and filler words.
    """
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        
        # Filler words to detect
        self.filler_words = {
            "um", "uh", "like", "you know", "so", "actually", 
            "basically", "literally", "kind of", "sort of", "i mean"
        }
        
        # Rolling window for metrics (last 5 seconds)
        self.window_size = 50  # 5 seconds at 10 FPS
        self.pitch_history = deque(maxlen=self.window_size)
        self.volume_history = deque(maxlen=self.window_size)
        self.speech_rate_history = deque(maxlen=self.window_size)
        
        # Transcription buffer
        self.transcript_buffer = []
        self.filler_word_count = 0
        self.total_words = 0
        
    def analyze_audio_chunk(self, audio_data: np.ndarray, transcript: Optional[str] = None) -> Dict:
        """
        Analyze an audio chunk for vocal quality metrics.
        
        Args:
            audio_data: Audio samples (numpy array)
            transcript: Optional transcription of the audio chunk
            
        Returns:
            Dictionary with voice analysis results
        """
        start_time = time.time()
        
        analysis = {
            "pitch_hz": 0.0,
            "volume_db": 0.0,
            "speech_rate_wpm": 0.0,
            "pitch_variation": 0.0,
            "volume_consistency": 0.0,
            "filler_word_detected": None,
            "speaking_too_fast": False,
            "speaking_too_slow": False,
            "voice_score": 0.0,
            "processing_time_ms": 0.0
        }
        
        if len(audio_data) == 0:
            return analysis
        
        # Calculate pitch (fundamental frequency)
        pitch = self._calculate_pitch(audio_data)
        analysis["pitch_hz"] = pitch
        self.pitch_history.append(pitch)
        
        # Calculate volume (RMS energy)
        volume = self._calculate_volume(audio_data)
        analysis["volume_db"] = volume
        self.volume_history.append(volume)
        
        # Analyze transcript if provided
        if transcript:
            filler_word = self._detect_filler_words(transcript)
            if filler_word:
                analysis["filler_word_detected"] = filler_word
                self.filler_word_count += 1
            
            # Estimate speech rate
            word_count = len(transcript.split())
            self.total_words += word_count
            # Assuming each chunk is ~1 second
            speech_rate = word_count * 60  # Convert to words per minute
            analysis["speech_rate_wpm"] = speech_rate
            self.speech_rate_history.append(speech_rate)
            
            # Check if speaking too fast or slow
            if speech_rate > 180:
                analysis["speaking_too_fast"] = True
            elif speech_rate < 100 and word_count > 0:
                analysis["speaking_too_slow"] = True
        
        # Calculate pitch variation (good speakers vary their pitch)
        if len(self.pitch_history) > 1:
            pitch_std = np.std(list(self.pitch_history))
            analysis["pitch_variation"] = round(pitch_std, 2)
        
        # Calculate volume consistency (should be relatively stable)
        if len(self.volume_history) > 1:
            volume_std = np.std(list(self.volume_history))
            # Lower std = more consistent (score 0-100)
            consistency = max(0, 100 - (volume_std * 10))
            analysis["volume_consistency"] = round(consistency, 1)
        
        # Calculate overall voice score (0-100)
        voice_score = self._calculate_voice_score(analysis)
        analysis["voice_score"] = voice_score
        
        # Track processing time
        processing_time = (time.time() - start_time) * 1000
        analysis["processing_time_ms"] = round(processing_time, 2)
        
        return analysis
    
    def _calculate_pitch(self, audio_data: np.ndarray) -> float:
        """
        Calculate fundamental frequency (pitch) using autocorrelation.
        Returns: Pitch in Hz
        """
        try:
            # Use librosa's piptrack for pitch detection
            pitches, magnitudes = librosa.piptrack(
                y=audio_data.astype(float),
                sr=self.sample_rate,
                fmin=50,  # Minimum frequency (Hz)
                fmax=400  # Maximum frequency (Hz)
            )
            
            # Get the pitch with highest magnitude
            pitch_index = magnitudes.argmax()
            pitch = pitches.flatten()[pitch_index]
            
            return round(float(pitch), 2) if pitch > 0 else 0.0
        except Exception:
            return 0.0
    
    def _calculate_volume(self, audio_data: np.ndarray) -> float:
        """
        Calculate volume (loudness) in decibels.
        Returns: Volume in dB
        """
        # Calculate RMS (Root Mean Square) energy
        rms = np.sqrt(np.mean(audio_data**2))
        
        # Convert to decibels
        if rms > 0:
            db = 20 * np.log10(rms)
            return round(float(db), 2)
        return -100.0  # Very quiet
    
    def _detect_filler_words(self, transcript: str) -> Optional[str]:
        """
        Detect filler words in transcript.
        Returns: The filler word if detected, None otherwise
        """
        transcript_lower = transcript.lower()
        
        for filler in self.filler_words:
            if filler in transcript_lower:
                return filler
        
        return None
    
    def _calculate_voice_score(self, analysis: Dict) -> float:
        """
        Calculate overall voice quality score (0-100).
        Based on pitch variation, volume consistency, speech rate, and filler words.
        """
        score = 100.0
        
        # Penalize for filler words
        if analysis["filler_word_detected"]:
            score -= 15
        
        # Penalize for speaking too fast or slow
        if analysis["speaking_too_fast"] or analysis["speaking_too_slow"]:
            score -= 10
        
        # Reward pitch variation (monotone is bad)
        if analysis["pitch_variation"] < 5:
            score -= 10
        elif analysis["pitch_variation"] > 20:
            score += 10
        
        # Reward volume consistency
        if analysis["volume_consistency"] > 80:
            score += 10
        elif analysis["volume_consistency"] < 50:
            score -= 10
        
        # Check volume level (not too quiet)
        if analysis["volume_db"] < -40:
            score -= 15
        
        return max(0.0, min(100.0, score))
    
    def get_session_stats(self) -> Dict:
        """
        Get overall statistics for the session.
        """
        return {
            "avg_pitch_hz": round(np.mean(list(self.pitch_history)), 2) if self.pitch_history else 0.0,
            "avg_volume_db": round(np.mean(list(self.volume_history)), 2) if self.volume_history else 0.0,
            "avg_speech_rate_wpm": round(np.mean(list(self.speech_rate_history)), 2) if self.speech_rate_history else 0.0,
            "total_filler_words": self.filler_word_count,
            "total_words": self.total_words,
            "filler_word_percentage": round((self.filler_word_count / max(1, self.total_words)) * 100, 2)
        }
    
    def reset(self):
        """Reset the agent state"""
        self.pitch_history.clear()
        self.volume_history.clear()
        self.speech_rate_history.clear()
        self.transcript_buffer = []
        self.filler_word_count = 0
        self.total_words = 0
