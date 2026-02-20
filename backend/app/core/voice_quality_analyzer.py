"""
Advanced Voice Quality Analysis Module
Real-time speech quality metrics with AI-based analysis
"""

import numpy as np
import librosa
from typing import Dict, List, Tuple, Optional
from scipy import signal
from scipy.stats import zscore
import json

class VoiceQualityAnalyzer:
    """
    Comprehensive voice quality analysis with multiple metrics
    - Speech Rate & Pace Variation
    - Pitch & Intonation Analysis  
    - Volume & Loudness Consistency
    - Clarity & Articulation
    - Emotional Tone Detection
    - Filler Word Detection
    """
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.filler_words = {
            "um", "uh", "like", "you know", "so", "actually", 
            "basically", "literally", "kind of", "sort of", "i mean",
            "ah", "er", "hmm", "well", "okay", "you see", "right"
        }
        
        # Voice quality baselines (for reference speaker)
        self.baselines = {
            'ideal_speech_rate': 130,  # WPM
            'ideal_pitch_male': 120,   # Hz
            'ideal_pitch_female': 200, # Hz
            'ideal_volume': -20,       # dB
            'ideal_pitch_variation': 15  # semitones
        }
        
    def analyze_audio_chunk(self, audio_data: np.ndarray, 
                          transcript: Optional[str] = None) -> Dict:
        """
        Comprehensive analysis of audio chunk
        
        Args:
            audio_data: Audio samples (numpy array)
            transcript: Optional transcribed text
            
        Returns:
            Dictionary with comprehensive voice metrics
        """
        metrics = {
            'speech_rate_wpm': 0.0,
            'speech_rate_quality': 'normal',  # 'too_fast', 'too_slow', 'optimal'
            'pitch_hz': 0.0,
            'pitch_variation_semitones': 0.0,
            'pitch_quality': 'monotone',  # 'monotone', 'adequate', 'expressive'
            'volume_db': 0.0,
            'volume_consistency': 0.0,  # 0-1, higher is better
            'clarity_score': 0.0,  # 0-1
            'speech_energy': 0.0,
            'speech_energy_stability': 0.0,
            'filler_words': [],
            'filler_word_density': 0.0,  # % of filler words
            'pause_frequency': 0.0,
            'avg_pause_length': 0.0,
            'rhythm_score': 0.0,
            'overall_voice_score': 0.0,
            'recommendations': []
        }
        
        if len(audio_data) < self.sample_rate * 0.5:  # Less than 0.5 second
            return metrics
        
        try:
            # Fundamental metrics
            pitch = self._analyze_pitch(audio_data)
            metrics['pitch_hz'] = pitch
            
            volume = self._analyze_volume(audio_data)
            metrics['volume_db'] = volume
            
            clarity = self._analyze_clarity(audio_data)
            metrics['clarity_score'] = clarity
            
            energy, stability = self._analyze_energy_stability(audio_data)
            metrics['speech_energy'] = energy
            metrics['speech_energy_stability'] = stability
            
            # Transcript-based metrics
            if transcript:
                filler_words = self._detect_filler_words(transcript)
                metrics['filler_words'] = filler_words['words']
                metrics['filler_word_density'] = filler_words['density']
            
            # Pitch variation analysis
            pitch_variation = self._analyze_pitch_variation(audio_data)
            metrics['pitch_variation_semitones'] = pitch_variation
            
            # Pacing analysis
            p_freq, avg_p_len, rhythm = self._analyze_pacing(audio_data)
            metrics['pause_frequency'] = p_freq
            metrics['avg_pause_length'] = avg_p_len
            metrics['rhythm_score'] = rhythm
            
            # Calculate sub-scores
            metrics['speech_rate_quality'] = self._rate_speech_rate(
                metrics['speech_rate_wpm']
            )
            metrics['pitch_quality'] = self._rate_pitch_variation(pitch_variation)
            
            # Volume consistency (0-1)
            metrics['volume_consistency'] = self._analyze_volume_consistency(audio_data)
            
            # Generate recommendations
            metrics['recommendations'] = self._generate_recommendations(metrics)
            
            # Overall voice score (0-100)
            metrics['overall_voice_score'] = self._calculate_overall_score(metrics)
            
        except Exception as e:
            print(f"⚠️ Error in voice analysis: {e}")
        
        return metrics
    
    def _analyze_pitch(self, audio_data: np.ndarray) -> float:
        """Estimate fundamental frequency (pitch) using autocorrelation"""
        try:
            # Apply pre-emphasis
            emphasized = np.append(audio_data[0], 
                                 audio_data[1:] - 0.97 * audio_data[:-1])
            
            # Frame the signal
            frame_length = int(self.sample_rate * 0.025)  # 25ms
            hop_length = int(self.sample_rate * 0.010)    # 10ms
            
            # Use librosa's piptrack for more accurate pitch estimation
            pitches, magnitudes = librosa.piptrack(
                y=audio_data,
                sr=self.sample_rate,
                fmin=50,
                fmax=400
            )
            
            # Get the most probable pitch at each frame
            index = magnitudes > np.median(magnitudes)
            pitch_values = pitches[index]
            
            if len(pitch_values) > 0:
                return float(np.median(pitch_values))
            return 0.0
            
        except Exception as e:
            print(f"⚠️ Pitch analysis error: {e}")
            return 0.0
    
    def _analyze_pitch_variation(self, audio_data: np.ndarray) -> float:
        """Analyze variation in pitch (intonation)"""
        try:
            pitches, magnitudes = librosa.piptrack(
                y=audio_data,
                sr=self.sample_rate,
                fmin=50,
                fmax=400
            )
            
            # Get pitch values where magnitude is significant
            index = magnitudes > np.median(magnitudes)
            pitch_values = pitches[index]
            
            if len(pitch_values) < 2:
                return 0.0
            
            # Convert to semitones relative to baseline
            log_pitches = 12 * np.log2(pitch_values / pitch_values[0] + 1e-10)
            variation = float(np.std(log_pitches))
            
            return variation
            
        except Exception as e:
            print(f"⚠️ Pitch variation error: {e}")
            return 0.0
    
    def _analyze_volume(self, audio_data: np.ndarray) -> float:
        """Calculate volume in dB"""
        try:
            # RMS energy
            rms = np.sqrt(np.mean(np.square(audio_data)))
            
            # Convert to dB (reference is 1.0)
            db = 20 * np.log10(max(rms, 1e-10)) + 20
            
            return float(db)
        except Exception as e:
            return -40.0
    
    def _analyze_volume_consistency(self, audio_data: np.ndarray) -> float:
        """
        Analyze volume consistency over time.
        Returns 0-1 where 1 is perfectly consistent
        """
        try:
            frame_length = int(self.sample_rate * 0.025)  # 25ms frames
            hop_length = int(self.sample_rate * 0.010)    # 10ms hop
            
            frames = librosa.util.frame(x=audio_data, frame_length=frame_length, hop_length=hop_length)
            frame_rms = np.sqrt(np.mean(np.square(frames), axis=0))
            
            # Calculate coefficient of variation
            if np.mean(frame_rms) > 0:
                cv = np.std(frame_rms) / np.mean(frame_rms)
                consistency = 1.0 / (1.0 + cv)  # Convert to 0-1
                return float(np.clip(consistency, 0, 1))
            return 0.0
            
        except Exception as e:
            print(f"⚠️ Volume consistency error: {e}")
            return 0.0
    
    def _analyze_pacing(self, audio_data: np.ndarray) -> Tuple[float, float, float]:
        """
        Analyze pauses and rhythm
        Returns: (pause_frequency, avg_pause_length, rhythm_score)
        """
        try:
            # Use librosa to find non-silent intervals (30dB below max is considered silence)
            non_silent_intervals = librosa.effects.split(audio_data, top_db=30)
            
            if len(non_silent_intervals) <= 1:
                return 0.0, 0.0, 1.0 # 1 interval means no pauses detected
            
            # Calculate pauses (gaps between non-silent intervals)
            pauses_samples = []
            for i in range(1, len(non_silent_intervals)):
                gap = non_silent_intervals[i][0] - non_silent_intervals[i-1][1]
                if gap > 0:
                    pauses_samples.append(gap)
            
            if not pauses_samples:
                return 0.0, 0.0, 1.0
                
            # Convert to seconds
            pauses_sec = [p / self.sample_rate for p in pauses_samples]
            
            duration_sec = len(audio_data) / self.sample_rate
            pause_frequency = len(pauses_sec) / duration_sec if duration_sec > 0 else 0
            avg_pause_length = float(np.mean(pauses_sec))
            
            # Rhythm score: standard deviation of pause lengths (lower std dev = more consistent)
            pause_std = float(np.std(pauses_sec))
            rhythm_score = 1.0 / (1.0 + pause_std)
            
            return float(pause_frequency), avg_pause_length, float(np.clip(rhythm_score, 0, 1))
        except Exception as e:
            print(f"⚠️ Pacing analysis error: {e}")
            return 0.0, 0.0, 1.0
    
    def _analyze_clarity(self, audio_data: np.ndarray) -> float:
        """
        Analyze speech clarity using spectral entropy
        Higher entropy = more noise = lower clarity
        """
        try:
            # Compute spectrogram
            D = librosa.stft(audio_data)
            S = np.abs(D) ** 2
            
            # Normalize to probability distribution
            S_norm = S / np.sum(S)
            
            # Calculate entropy
            S_norm = S_norm[S_norm > 0]
            entropy = -np.sum(S_norm * np.log2(S_norm))
            
            # Normalize entropy (typical range 0-20)
            entropy_normalized = np.clip(1 - (entropy / 20), 0, 1)
            
            return float(entropy_normalized)
            
        except Exception as e:
            print(f"⚠️ Clarity analysis error: {e}")
            return 0.5
    
    def _analyze_energy_stability(self, audio_data: np.ndarray) -> Tuple[float, float]:
        """
        Analyze speech energy and stability
        Returns (energy_level, stability_score)
        """
        try:
            # Calculate RMS energy
            energy = np.sqrt(np.mean(np.square(audio_data)))
            
            # Frame-by-frame energy for stability
            frames = librosa.util.frame(
                x=audio_data, 
                frame_length=int(self.sample_rate * 0.025),
                hop_length=int(self.sample_rate * 0.010)
            )
            frame_energy = np.sqrt(np.mean(np.square(frames), axis=0))
            
            # Stability as inverse of coefficient of variation
            if np.mean(frame_energy) > 0:
                cv = np.std(frame_energy) / np.mean(frame_energy)
                stability = 1.0 / (1.0 + cv)
            else:
                stability = 0.0
            
            energy_db = 20 * np.log10(max(energy, 1e-10))
            
            return float(energy_db), float(np.clip(stability, 0, 1))
            
        except Exception as e:
            print(f"⚠️ Energy analysis error: {e}")
            return 0.0, 0.0
    
    def _calculate_speech_rate(self, duration_sec: float, transcript: str) -> float:
        """Calculate speech rate in words per minute"""
        try:
            if duration_sec < 0.1 or not transcript:
                return 0.0
            
            words = len(transcript.split())
            wpm = (words / duration_sec) * 60
            
            return float(wpm)
            
        except Exception as e:
            return 0.0
    
    def _detect_filler_words(self, transcript: str) -> Dict:
        """Detect filler words in transcript"""
        words = transcript.lower().split()
        detected_fillers = []
        
        for word in words:
            cleaned = word.strip('.,!?;:')
            if cleaned in self.filler_words:
                detected_fillers.append(cleaned)
        
        density = (len(detected_fillers) / len(words) * 100) if words else 0
        
        return {
            'words': list(set(detected_fillers)),
            'count': len(detected_fillers),
            'density': min(density, 100.0)
        }
    
    def _rate_speech_rate(self, wpm: float) -> str:
        """Rate speech rate quality"""
        if wpm < 100:
            return 'too_slow'
        elif wpm > 160:
            return 'too_fast'
        else:
            return 'optimal'
    
    def _rate_pitch_variation(self, variation: float) -> str:
        """Rate pitch variation (intonation)"""
        if variation < 2:
            return 'monotone'
        elif variation < 8:
            return 'adequate'
        else:
            return 'expressive'
    
    def _generate_recommendations(self, metrics: Dict) -> List[str]:
        """Generate actionable recommendations based on metrics"""
        recommendations = []
        
        # Speech rate
        if metrics['speech_rate_quality'] == 'too_fast':
            recommendations.append("Slow down your speech for better clarity")
        elif metrics['speech_rate_quality'] == 'too_slow':
            recommendations.append("Increase your speaking pace to maintain engagement")
        
        # Pitch variation
        if metrics['pitch_quality'] == 'monotone':
            recommendations.append("Add more variation to your pitch to sound more engaging")
        
        # Filler words
        if metrics['filler_word_density'] > 5:
            recommendations.append(f"Reduce filler words ({metrics['filler_word_density']:.1f}% detected)")
        
        # Volume consistency
        if metrics['volume_consistency'] < 0.6:
            recommendations.append("Keep your volume more consistent throughout speech")
        
        # Clarity
        if metrics['clarity_score'] < 0.6:
            recommendations.append("Articulate more clearly")
        
        return recommendations
    
    def _calculate_overall_score(self, metrics: Dict) -> float:
        """
        Calculate overall voice quality score (0-100)
        Weighted combination of all metrics
        """
        weights = {
            'clarity': 0.20,
            'volume_consistency': 0.15,
            'pitch_quality': 0.20,
            'speech_rate': 0.20,
            'energy_stability': 0.15,
            'filler_words': 0.10
        }
        
        # Normalize individual scores to 0-1
        clarity_score = metrics['clarity_score']  # Already 0-1
        
        volume_score = metrics['volume_consistency']  # Already 0-1
        
        pitch_score = {
            'monotone': 0.4,
            'adequate': 0.7,
            'expressive': 1.0
        }.get(metrics['pitch_quality'], 0.5)
        
        speech_score = {
            'too_fast': 0.6,
            'too_slow': 0.6,
            'optimal': 1.0
        }.get(metrics['speech_rate_quality'], 0.5)
        
        energy_score = metrics['speech_energy_stability']  # Already 0-1
        
        filler_score = 1.0 - min(metrics['filler_word_density'] / 10, 1.0)
        
        # Weighted sum
        total_score = (
            clarity_score * weights['clarity'] +
            volume_score * weights['volume_consistency'] +
            pitch_score * weights['pitch_quality'] +
            speech_score * weights['speech_rate'] +
            energy_score * weights['energy_stability'] +
            filler_score * weights['filler_words']
        )
        
        return float(np.clip(total_score * 100, 0, 100))
