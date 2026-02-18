# Frontend AI Coach Real-Time Components

## Overview
This document describes the new real-time AI coach components that display live metrics and feedback during practice sessions.

## Components

### 1. RealtimeEmotionDisplay
**Location**: `src/components/realtime/RealtimeEmotionDisplay.tsx`

Displays real-time facial emotion and engagement metrics with animated visualizations.

**Props**:
- `emotion: EmotionAnalysis | null` - Detected emotion and engagement scores
- `isLoading?: boolean` - Loading state

**Displays**:
- Primary emotion with confidence indicator
- Face detection status
- Engagement score (0-100%)
- Eye contact score (0-100%)
- Engagement level badge (very_high → very_low)

**Styling**:
- Gradient backgrounds per emotion type
- Smooth Framer Motion animations
- Responsive layout with mobile support

---

### 2. RealtimeVoiceDisplay
**Location**: `src/components/realtime/RealtimeVoiceDisplay.tsx`

Shows comprehensive voice quality metrics with real-time analysis.

**Props**:
- `voice: VoiceQualityMetrics | null` - Voice analysis data
- `isLoading?: boolean` - Loading state

**Displays**:
- Overall voice score (0-100) with gradient
- Speech rate in WPM with quality indicator (optimal/fast/slow)
- Clarity score as percentage with progress bar
- Pitch frequency and quality (expressive/adequate/monotone)
- Volume consistency percentage
- Filler word density and list (um, uh, like, etc.)
- Pitch variation in semitones
- Actionable recommendations

**Styling**:
- Color-coded metrics (green→red based on score)
- Animated progress bars
- Grid layout for 2-column metric display

---

### 3. RealtimeScoreDisplay
**Location**: `src/components/realtime/RealtimeScoreDisplay.tsx`

Displays overall performance score and component breakdown.

**Props**:
- `score: PerformanceScore | null` - Performance metrics
- `isLoading?: boolean` - Loading state
- `goodFramesPercentage?: number` - Percentage of good quality frames (0-100)

**Displays**:
- Large prominent total score (0-100) with animated entrance
- Letter grade (A+ to F) with color-coded gradient
- Component breakdown (voice/facial/content/pacing) with individual scores and progress bars
- Good frames percentage with quality indicator
- Strengths section with bullet points
- Areas for improvement with actionable focus items

**Styling**:
- Dynamic gradient based on grade (green for A, blue for B, etc.)
- Animated score transitions
- Collapsible sections for detailed metrics

---

### 4. RealtimeFeedbackDisplay
**Location**: `src/components/realtime/RealtimeFeedbackDisplay.tsx`

Shows AI coach feedback from Gemini.

**Props**:
- `feedback: RealtimeFeedback | null` - Feedback data
- `isLoading?: boolean` - Loading state
- `confidence?: number` - AI analysis confidence (0-1)

**Displays**:
- Real-time coaching feedback from Gemini (up to 3 sentences)
- Feedback timestamp
- AI confidence indicator with progress bar
- Real-time monitoring indicator

**Styling**:
- Blue-tinted feedback box
- Animated text entrance
- Timestamp and confidence metrics

---

### 5. RealtimeDashboard
**Location**: `src/components/realtime/RealtimeDashboard.tsx`

Integrated dashboard combining all four metric displays with panel management.

**Props**:
- `emotion: EmotionAnalysis | null`
- `voice: VoiceQualityMetrics | null`
- `score: PerformanceScore | null`
- `feedback: RealtimeFeedback | null`
- `isLoading?: boolean`
- `goodFramesPercentage?: number`
- `onClose?: () => void`
- `isMinimized?: boolean`
- `onToggleMinimize?: () => void`

**Features**:
- Fixed position right-side panel (fixed right-4 top-4 bottom-4)
- Scrollable content area with all 4 metric displays
- Panel expansion system - click any panel header to expand full screen
- Minimize button to collapse to small indicator
- Close button to dismiss dashboard
- Real-time status indicator
- Smooth animations and transitions

**Layout**:
- Header with title and controls (close/minimize buttons)
- Scrollable metric panels
- Status indicator at bottom
- Expanded panel overlay with close button

---

## Type Definitions

Updated in `src/lib/types.ts`:

```typescript
export interface EmotionAnalysis {
    emotion: string;
    confidence: number;
    engagement_score: number;
    engagement_level: string;
    eye_contact_score: number;
    smile_score: number;
    face_detected: boolean;
    emotional_state: string | null;
}

export interface VoiceQualityMetrics {
    speech_rate_wpm: number;
    speech_rate_quality: string;
    pitch_hz: number;
    pitch_variation_semitones: number;
    pitch_quality: string;
    clarity_score: number;
    volume_db: number;
    volume_consistency: number;
    speech_energy: number;
    speech_energy_stability: number;
    filler_words: string[];
    filler_word_density: number;
    overall_voice_score: number;
    recommendations: string[];
}

export interface PerformanceScore {
    total_score: number;
    voice_score: number;
    facial_score: number;
    content_score: number;
    pacing_score: number;
    grade: string;
    is_good_frame: boolean;
    feedback_priority: string[];
    strengths: string[];
    weaknesses: string[];
    areas_for_improvement?: string[];
    timestamp: string;
}

export interface RealtimeFeedback {
    type: string;
    session_id: string;
    feedback: string;
    facial_analysis: EmotionAnalysis;
    voice_analysis: VoiceQualityMetrics;
    score: PerformanceScore;
    timestamp: string;
}
```

---

## Hook Integration

The `useAICoach` hook manages WebSocket communication with the AI coach backend:

```typescript
const {
    isConnected,
    currentFeedback,
    currentScore,
    currentEmotion,
    currentVoice,
    sendVideoFrame,
    sendAudioChunk,
    endSession,
    connect,
    disconnect,
    reset,
} = useAICoach();
```

**Methods**:
- `connect()`: Establish WebSocket connection
- `disconnect()`: Close connection gracefully
- `sendVideoFrame(frameData)`: Submit base64 video frame
- `sendAudioChunk(audioData, transcript)`: Submit audio with transcript
- `endSession()`: Request final summary
- `reset()`: Clear all state

**State Properties**:
- `isConnected`: Connection status
- `currentFeedback`: Latest feedback object
- `currentScore`: Latest performance score
- `currentEmotion`: Latest emotion analysis
- `currentVoice`: Latest voice metrics

---

## Integration in Practice Page

The practice page has been updated to:

1. **Import new components**:
   ```typescript
   import { useAICoach } from '@/hooks/useAICoach';
   import { RealtimeDashboard } from '@/components/realtime/RealtimeDashboard';
   ```

2. **Initialize AI coach hook**:
   ```typescript
   const {
       isConnected: aiCoachConnected,
       currentFeedback,
       currentScore,
       currentEmotion,
       currentVoice,
       sendVideoFrame: aiSendVideoFrame,
       endSession: aiEndSession,
   } = useAICoach();
   ```

3. **Start session**:
   - Connect to AI coach
   - Send video frames during recording
   - Show dashboard in right sidebar

4. **Stop session**:
   - End AI coach session
   - Hide dashboard
   - Process final metrics

5. **Render dashboard**:
   ```typescript
   <RealtimeDashboard
       emotion={currentEmotion}
       voice={currentVoice}
       score={currentScore}
       feedback={currentFeedback}
       isLoading={!aiCoachConnected}
       goodFramesPercentage={...}
       onClose={() => setShowAICoachDashboard(false)}
       isMinimized={dashboardMinimized}
       onToggleMinimize={() => setDashboardMinimized(!dashboardMinimized)}
   />
   ```

---

## WebSocket Message Protocol

**Video Frame**:
```json
{
    "type": "video_frame",
    "data": "base64_encoded_frame"
}
```

**Audio Chunk**:
```json
{
    "type": "audio_chunk",
    "data": "base64_encoded_audio",
    "transcript": "speech text"
}
```

**Feedback Response**:
```json
{
    "type": "feedback",
    "session_id": "...",
    "feedback": "Keep eye contact! You're doing great.",
    "facial_analysis": {...},
    "voice_analysis": {...},
    "score": {...},
    "timestamp": "2024-..."
}
```

---

## Testing

To test the real-time components:

1. **Start a practice session** - Click "START SESSION"
2. **View dashboard** - Toggle right-side AI Coach dashboard
3. **Expand panels** - Click panel headers to expand full-screen
4. **Monitor metrics** - Watch real-time updates as you speak
5. **Check feedback** - Review Gemini coaching feedback in real-time
6. **Minimize dashboard** - Use minimize button for smaller UI footprint

---

## Performance Considerations

- **Frame Rate**: 10-15 FPS for video frame submission
- **Audio Chunk Size**: 32KB-64KB chunks from speech recognition
- **Metrics Update**: 300-500ms refresh interval
- **Feedback Throttling**: 3-second minimum between feedback generation
- **Memory**: Dashboard components use Framer Motion for smooth animations

---

## Next Steps

1. ✅ Created 5 real-time display components
2. ✅ Updated types.ts with complete real-time metrics
3. ✅ Created useAICoach hook with WebSocket integration
4. ✅ Integrated dashboard into practice page
5. ⏳ **TODO**: End-to-end testing with backend
6. ⏳ **TODO**: Optimize video frame encoding
7. ⏳ **TODO**: Add voice metrics visualizations to existing practice components
8. ⏳ **TODO**: Production deployment

---

## Support

For issues or improvements:
- Check browser console for WebSocket errors
- Verify backend is running on `/api/ws/practice/{sessionId}`
- Check video/audio permissions in browser
- Review Gemini API rate limits
