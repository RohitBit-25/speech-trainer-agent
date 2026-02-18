"""
Quick Start: AI/ML Enhanced Speech Trainer
Complete guide to use the new real AI-based system
"""

# =============================================================================
# INSTALLATION AND SETUP (5 minutes)
# =============================================================================

# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Verify Gemini API key
export GEMINI_API_KEY="your_actual_key_here"
# OR add to .env file in backend/ directory

# 3. Start the server
python main.py
# Server runs at http://localhost:8000


# =============================================================================
# BASIC USAGE - Video Analysis
# =============================================================================

from app.core.emotion_detector import EmotionDetector
import cv2

# Initialize detector
detector = EmotionDetector()

# Load a video or use webcam
cap = cv2.VideoCapture(0)  # 0 for webcam

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Detect emotions in the frame
    result = detector.detect_emotion_in_frame(frame)
    
    # Use results
    print(f"Emotion: {result['primary_emotion']}")
    print(f"Confidence: {result['primary_confidence']:.2%}")
    print(f"Engagement: {result['engagement_score']:.2%}")
    
    # Display results
    if result['faces_detected'] > 0:
        # Draw bounding boxes and emotion labels
        for emotion_data in result['emotions']:
            x, y, w, h = emotion_data['bbox']
            text = f"{emotion_data['emotion']}: {emotion_data['confidence']:.0%}"
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    cv2.imshow('Emotion Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()


# =============================================================================
# BASIC USAGE - Voice Analysis
# =============================================================================

from app.core.voice_quality_analyzer import VoiceQualityAnalyzer
import librosa

# Initialize analyzer
analyzer = VoiceQualityAnalyzer(sample_rate=16000)

# Load audio
audio, sr = librosa.load("speech.mp3", sr=16000)
transcript = "Your transcribed text here"

# Analyze
metrics = analyzer.analyze_audio_chunk(audio, transcript)

# Display metrics
print(f"Speech Rate: {metrics['speech_rate_wpm']:.0f} WPM ({metrics['speech_rate_quality']})")
print(f"Clarity: {metrics['clarity_score']:.0%}")
print(f"Volume Consistency: {metrics['volume_consistency']:.0%}")
print(f"Pitch Quality: {metrics['pitch_quality']} ({metrics['pitch_variation_semitones']:.1f} semitones)")
print(f"Filler Words: {', '.join(metrics['filler_words']) if metrics['filler_words'] else 'None'}")
print(f"Overall Score: {metrics['overall_voice_score']:.0f}/100")
print(f"Recommendations: {metrics['recommendations']}")


# =============================================================================
# BASIC USAGE - AI Coaching Feedback
# =============================================================================

from app.core.gemini_coach_engine import GeminiCoachEngine

# Initialize coach
coach = GeminiCoachEngine()

# Prepare metrics (from facial and voice analysis)
voice_metrics = {
    'speech_rate_wpm': 140,
    'speech_rate_quality': 'optimal',
    'pitch_quality': 'expressive',
    'clarity_score': 0.85,
    'volume_consistency': 0.75,
    'filler_words': ['um', 'like'],
    'overall_voice_score': 78
}

facial_metrics = {
    'emotion': 'happy',
    'emotion_confidence': 0.9,
    'engagement_score': 0.8,
    'eye_contact_score': 0.85,
    'smile_score': 0.7
}

# Generate feedback
feedback = coach.generate_feedback_sync(
    voice_metrics,
    facial_metrics,
    transcript_segment="This is what I'm currently saying",
    context="intermediate level practice"
)

print(f"AI Coach: {feedback}")
# Output: "Great energy! Maintain that enthusiasm."


# =============================================================================
# BASIC USAGE - Intelligent Scoring
# =============================================================================

from app.core.scoring_system import IntelligentScoringSystem

# Initialize scorer
scorer = IntelligentScoringSystem(difficulty="intermediate")

# Prepare all metrics
voice_metrics = {...}  # From voice analyzer
facial_metrics = {...}  # From emotion detector
content_metrics = {
    'word_count': 250,
    'clarity': 80,
    'structure_quality': 75,
    'vocabulary_quality': 70
}
pacing_metrics = {
    'pause_frequency': 0.35,
    'avg_pause_length': 0.9,
    'rhythm_consistency': 0.8
}

# Calculate comprehensive score
result = scorer.calculate_score(
    voice_metrics,
    facial_metrics,
    content_metrics,
    pacing_metrics
)

# Display results
print(f"Total Score: {result['total_score']}/100")
print(f"Grade: {result['grade']}")
print(f"Components:")
print(f"  - Voice: {result['voice_score']:.0f}")
print(f"  - Facial: {result['facial_score']:.0f}")
print(f"  - Content: {result['content_score']:.0f}")
print(f"  - Pacing: {result['pacing_score']:.0f}")
print(f"Strengths: {result['strengths']}")
print(f"Weaknesses: {result['weaknesses']}")
print(f"Feedback Priority: {result['feedback_priority']}")


# =============================================================================
# ADVANCED USAGE - Complete AI Coach Session
# =============================================================================

import asyncio
import cv2
import numpy as np
from app.core.ai_coach_session import AICoachSession

async def run_practice_session():
    # Create session
    session = AICoachSession(
        session_id="practice_001",
        user_id="user_123",
        difficulty="intermediate"
    )
    
    # Open video and audio
    cap = cv2.VideoCapture(0)
    
    frame_count = 0
    while frame_count < 300:  # 10 seconds at 30 FPS
        ret, frame = cap.read()
        if not ret:
            break
        
        # Encode frame to base64
        _, buffer = cv2.imencode('.jpg', frame)
        frame_data = base64.b64encode(buffer).decode()
        
        # Process video frame
        facial_result = await session.process_video_frame(frame_data)
        print(f"Emotion: {facial_result['facial_analysis']['emotion']}")
        
        # Get real-time feedback (every 30 frames)
        if frame_count % 30 == 0:
            feedback = await session.generate_real_time_feedback()
            if feedback.get('feedback'):
                print(f"Coach: {feedback['feedback']}")
        
        # Calculate score
        if frame_count % 30 == 0:
            score = await session.calculate_frame_score()
            print(f"Score: {score['score']['total']:.0f} ({score['score']['grade']})")
        
        frame_count += 1
    
    cap.release()
    
    # Get session summary
    summary = session.get_session_summary()
    print("\n=== SESSION SUMMARY ===")
    print(f"Average Score: {summary['statistics']['average_score']:.1f}")
    print(f"Improvement Trend: {summary['statistics']['improvement_trend']}")
    print(f"Best Component: {summary['best_component']}")
    print(f"Worst Component: {summary['worst_component']}")
    print(f"Total Frames: {summary['statistics']['total_frames']}")
    print(f"Good Frames: {summary['statistics']['good_frames_percentage']:.1f}%")

# Run the session
asyncio.run(run_practice_session())


# =============================================================================
# WEBSOCKET INTEGRATION - Frontend Example
# =============================================================================

# JavaScript code for frontend

const sessionId = 'practice_' + Date.now();
const userId = 'user_123';
const difficulty = 'intermediate';

// Connect to WebSocket
const ws = new WebSocket(
  `ws://localhost:8000/ws/practice/${sessionId}?user_id=${userId}&difficulty=${difficulty}`
);

ws.onopen = () => {
  console.log('Connected to AI Coach');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'analysis_result') {
    // Update real-time UI
    updateFacialMetrics(message.facial);
    updateScore(message.score);
    updateFeedback(message.feedback);
  }
  
  if (message.type === 'session_summary') {
    // Show final report
    displaySessionSummary(message.summary);
  }
};

// Send video frame
function sendVideoFrame() {
  canvas.toBlob((blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const frameData = reader.result.split(',')[1]; // Get base64
      ws.send(JSON.stringify({
        type: 'video_frame',
        frame_data: frameData,
        timestamp: new Date().toISOString()
      }));
    };
    reader.readAsDataURL(blob);
  });
}

// Send audio chunk
function sendAudioChunk(audioData, transcript) {
  ws.send(JSON.stringify({
    type: 'audio_chunk',
    audio_data: audioData, // base64 encoded
    transcript: transcript,
    timestamp: new Date().toISOString()
  }));
}

// End session
function endSession() {
  ws.send(JSON.stringify({
    type: 'end_session'
  }));
}


# =============================================================================
# TESTING - Verify Everything Works
# =============================================================================

# Run this script to verify all components

python3 << 'EOF'

import sys

print("=" * 60)
print("SPEECH TRAINER AI/ML SYSTEM - VERIFICATION")
print("=" * 60)

# Test 1: Emotion Detector
print("\n[1/5] Testing Emotion Detector...")
try:
    from app.core.emotion_detector import EmotionDetector
    detector = EmotionDetector()
    print("✅ Emotion Detector: OK")
    print(f"    Supported emotions: {detector.emotions}")
except Exception as e:
    print(f"❌ Emotion Detector: FAILED - {e}")
    sys.exit(1)

# Test 2: Voice Analyzer
print("\n[2/5] Testing Voice Quality Analyzer...")
try:
    from app.core.voice_quality_analyzer import VoiceQualityAnalyzer
    analyzer = VoiceQualityAnalyzer()
    print("✅ Voice Analyzer: OK")
except Exception as e:
    print(f"❌ Voice Analyzer: FAILED - {e}")
    sys.exit(1)

# Test 3: Gemini Coach
print("\n[3/5] Testing Gemini Coach...")
try:
    from app.core.gemini_coach_engine import GeminiCoachEngine
    coach = GeminiCoachEngine()
    print("✅ Gemini Coach: OK")
except Exception as e:
    print(f"❌ Gemini Coach: FAILED - {e}")
    sys.exit(1)

# Test 4: Scoring System
print("\n[4/5] Testing Scoring System...")
try:
    from app.core.scoring_system import IntelligentScoringSystem
    scorer = IntelligentScoringSystem()
    print("✅ Scoring System: OK")
except Exception as e:
    print(f"❌ Scoring System: FAILED - {e}")
    sys.exit(1)

# Test 5: AI Coach Session
print("\n[5/5] Testing AI Coach Session...")
try:
    from app.core.ai_coach_session import AICoachSession
    session = AICoachSession("test", "user1", "intermediate")
    print("✅ AI Coach Session: OK")
except Exception as e:
    print(f"❌ AI Coach Session: FAILED - {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("ALL SYSTEMS OPERATIONAL ✅")
print("=" * 60)
print("\nYou're ready to use the AI/ML Speech Trainer!")

EOF


# =============================================================================
# TROUBLESHOOTING
# =============================================================================

# Issue: ModuleNotFoundError: No module named 'tensorflow'
# Solution: pip install tensorflow keras

# Issue: Emotion detector returns no faces
# Solution: 
#   - Ensure face is at least 50x50 pixels
#   - Check lighting (backlit faces fail)
#   - Try with higher resolution camera

# Issue: Gemini feedback is slow
# Solution:
#   - Check internet connection
#   - Feedback throttled to 3-second minimum by design
#   - First call may be slower due to model initialization

# Issue: Voice analysis gives NaN values
# Solution:
#   - Ensure audio is not silent
#   - Check audio format matches (16kHz, mono recommended)
#   - Verify audio has speech content (not just noise)

# For more help: See AIML_IMPROVEMENTS.md and IMPLEMENTATION_COMPLETE.md


# =============================================================================
# NEXT STEPS
# =============================================================================

# 1. Update your WebSocket handler to use the new system
# 2. Modify frontend to handle real-time feedback
# 3. Deploy to production
# 4. Monitor logs for any issues
# 5. Gather user feedback and adjust weights if needed

print("\n🎉 Setup complete! Your AI-powered speech trainer is ready.")
