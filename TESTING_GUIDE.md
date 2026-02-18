# End-to-End Testing Guide: Real-Time AI Coach System

## Prerequisites

### Backend Requirements
- ✅ Python 3.9+
- ✅ All dependencies installed: `pip install -r backend/requirements.txt`
- ✅ Gemini API key set in `.env`
- ✅ Backend running on `http://localhost:8000`

### Frontend Requirements
- ✅ Node.js 18+
- ✅ Dependencies installed: `npm install` (in frontendnext/)
- ✅ Development server running: `npm run dev`
- ✅ Access at `http://localhost:3000`

### Browser Requirements
- ✅ Chrome/Firefox/Safari with WebRTC support
- ✅ Camera and microphone permissions granted
- ✅ Modern browser console for debugging

---

## Quick Start Test

### 1. Start Backend
```bash
cd backend
python main.py
```

Expected output:
```
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Start Frontend
```bash
cd frontend-next
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### 3. Test in Browser
1. Navigate to `http://localhost:3000`
2. Click "Practice" mode
3. Grant camera/microphone permissions
4. Select difficulty (Beginner/Intermediate/Expert)
5. Click "START SESSION"
6. Speak clearly and maintain eye contact
7. Watch real-time metrics update in dashboard
8. Click "STOP & REVIEW" to end session

---

## Detailed Test Scenarios

### Scenario 1: Basic Emotion Detection

**Objective**: Verify emotion detection is working in real-time

**Steps**:
1. Start a practice session (Beginner mode)
2. Look at the RealtimeEmotionDisplay panel on right
3. Make positive facial expression (smile)
4. Expect: Emotion updates to HAPPY with 70-90% confidence
5. Change expression to neutral
6. Expect: Emotion updates to NEUTRAL
7. Display should show:
   - Detected emotion name
   - Confidence percentage
   - Face detection ✓
   - Engagement score (0-100)
   - Eye contact score (0-100)
   - Engagement level badge

**Expected Output**:
```
Emotion: HAPPY (85%)
Face: ✓ Detected
Engagement: 78%
Eye Contact: 82%
Engagement Level: HIGH
```

---

### Scenario 2: Voice Quality Analysis

**Objective**: Verify voice metrics are captured and displayed correctly

**Steps**:
1. Start practice session
2. Speak at normal pace (~140 WPM): "Hello, I'm practicing my speech skills"
   - Should show "OPTIMAL" speech rate
3. Speak rapidly: "Iamtalkingveryfastrightnowpleasetellmethenumber"
   - Should show "too_fast" and flash orange
4. Speak slowly: "I... am... speaking... very... slowly..."
   - Should show "too_slow" and flash blue
5. While speaking, monitor:
   - Clarity score (should stay 70-90%)
   - Pitch frequency (should show 100-200 Hz for typical voice)
   - Filler words (count "um", "uh", "like")
   - Volume consistency (should stay high if consistent)

**Expected Output**:
```
Voice Score: 82/100
Speech Rate: 142 WPM (OPTIMAL)
Clarity: 85%
Pitch: 145 Hz (Adequate)
Pitch Variation: 4.2 ST
Volume: 78%
Filler Words: 2 (um, like)
Recommendations:
• Vary your pitch more for expression
• Reduce filler words usage
• Speak a bit slower for clarity
```

---

### Scenario 3: Performance Scoring

**Objective**: Verify scoring system updates in real-time and correctly weights components

**Steps**:
1. Start practice session (Intermediate mode)
2. Monitor RealtimeScoreDisplay panel
3. Maintain good performance:
   - Smile and maintain eye contact
   - Speak clearly at 130-160 WPM
   - Avoid filler words
   - Content should be coherent
4. Check that score updates every 500ms
5. Verify component breakdown:
   - Voice score: 75-85
   - Facial score: 80-90
   - Content score: 70-80
   - Pacing score: 75-85
6. Grade should be:
   - A+ (90-100)
   - A (80-89)
   - B (70-79)
   - C (60-69)
   - D (50-59)
   - F (<50)

**Expected Output** (good performance):
```
Score: 85/100
Grade: A

Voice Score: 82/100 ████████░░
Facial Score: 88/100 ████████░
Content Score: 80/100 ████████░░
Pacing Score: 84/100 ████████░░

Quality Frames: 72%

✅ STRENGTHS
• Excellent eye contact maintenance
• Clear and confident speech
• Good pacing and rhythm

🎯 FOCUS AREAS
• Vary your intonation more
• Reduce use of filler words
• Maintain consistent volume
```

---

### Scenario 4: AI Coach Feedback

**Objective**: Verify Gemini-powered coaching feedback appears in real-time

**Steps**:
1. Start practice session
2. Speak about a topic of choice
3. Watch RealtimeFeedbackDisplay panel
4. Within 3-5 seconds, feedback should appear from Gemini
5. Feedback should be:
   - Specific (mentions something you did)
   - Actionable (gives clear advice)
   - Concise (2-3 sentences)
   - Positive (encouraging tone)
6. Change behavior (e.g., start smiling)
7. After 3+ seconds, new feedback should appear reflecting change

**Expected Outputs**:
```
During neutral expression:
"Consider smiling more to show confidence. 
Your engagement could be improved by 
showing more enthusiasm in your facial expressions."

After smiling:
"Great job! Your warmth and smile really 
engaged with the camera. Keep up this 
confidence and continue speaking clearly."
```

---

### Scenario 5: Dashboard Controls

**Objective**: Test dashboard UX features (expand, minimize, close)

**Steps**:
1. Start practice session
2. Dashboard appears on right side
3. Click on emotion panel header → Should expand to full screen
4. Click X button → Should close expanded panel
5. Click minimize button → Dashboard collapses to small indicator
6. Click indicator → Dashboard re-expands
7. Click close button → Dashboard disappears
8. Can click "Practice" menu to bring back if needed

**Expected Behavior**:
- Smooth animations on all transitions
- Expanded panels show more detail
- Minimize preserves connection
- Close fully hides but doesn't disconnect

---

### Scenario 6: Error Handling

**Objective**: Verify system gracefully handles errors

**Test Cases**:
1. **Camera Disconnected**: Unplug camera while practicing
   - Should show CAMERA_OFFLINE warning
   - Stop video capture
   - Keep audio capture working
   - Error message at bottom

2. **Microphone Silent**: Stop speaking for 10+ seconds
   - Voice metrics should pause
   - Dashboard should indicate "waiting for audio"
   - Not an error, just paused state

3. **Network Latency**: Throttle network to 2G
   - Metrics might update less frequently
   - Should still work (just slower)
   - Check console for latency warnings

4. **Backend Unavailable**: Stop backend server
   - WebSocket connection should fail
   - Show "CONNECTING" then "CONNECTION FAILED"
   - Error toast at bottom
   - Option to reconnect

5. **Gemini API Rate Limit**: Rapid session starts
   - Should gracefully degrade
   - Feedback might not appear for new sessions
   - Continue to work with cached feedback
   - No hard error

---

### Scenario 7: Session End & Results

**Objective**: Verify session end flow works correctly

**Steps**:
1. Practice for 2-3 minutes
2. Click "STOP & REVIEW"
3. Session should:
   - Disconnect WebSocket
   - Stop video/audio capture
   - Show summary overlay
4. Summary should display:
   - Final grade/score
   - Duration (minutes:seconds)
   - Filler word count
   - XP earned
   - Facial and voice scores
5. Check localStorage:
   ```javascript
   // In console:
   localStorage.getItem("best_score")  // Should show updated best
   ```
6. Click "PRACTICE AGAIN" to start new session
7. Old dashboard data should clear

---

## Browser Console Debugging

### Enabling Detailed Logs
```javascript
// In browser console, enable verbose logging
localStorage.setItem('DEBUG_AI_COACH', 'true')
localStorage.setItem('DEBUG_WEBSOCKET', 'true')
```

### Checking Connection Status
```javascript
// Check current WebSocket status
window.__aiCoachDebug?.isConnected

// View last 10 messages
window.__aiCoachDebug?.messageLog

// Check metrics state
window.__aiCoachDebug?.currentMetrics
```

### Monitoring WebSocket Traffic
1. Open DevTools → Network tab
2. Filter for "WS" (WebSocket)
3. Click on connection → Messages tab
4. See all incoming/outgoing messages in real-time
5. Check message sizes and frequency

---

## Performance Testing

### FPS & Render Performance
```javascript
// In console, measure component render time
performance.mark('emotion-render-start')
// ... force render ...
performance.mark('emotion-render-end')
performance.measure('emotion-render', 'emotion-render-start', 'emotion-render-end')
performance.getEntriesByName('emotion-render')[0].duration
```

### Network Performance
```javascript
// Monitor WebSocket latency
window.__aiCoachDebug?.measureLatency()
// Should see latency < 100ms on local network
```

### Memory Usage
```javascript
// Check memory before/after session
console.memory.usedJSHeapSize  // Before
// ... run session ...
console.memory.usedJSHeapSize  // After
// Should not increase beyond 50MB during session
```

---

## Common Issues & Solutions

### Issue: Dashboard not showing
**Solution**:
1. Check browser console for errors
2. Verify camera/mic permissions granted
3. Ensure video/audio is enabled in modal
4. Check that session started successfully

### Issue: Metrics not updating
**Solution**:
1. Check WebSocket connection in Network tab
2. Verify backend is processing frames
3. Check console for frame encoding errors
4. Try stopping and restarting session

### Issue: Emotion always shows "Neutral"
**Solution**:
1. Ensure face is visible to camera
2. Try moving to better lighting
3. Check TensorFlow model loaded (console logs)
4. Verify `emotion_detector.py` running on backend

### Issue: Voice metrics blank
**Solution**:
1. Check audio is being captured (waveform should animate)
2. Verify speech recognition running
3. Try speaking louder and clearer
4. Check for audio input errors in console

### Issue: Feedback never appears
**Solution**:
1. Verify Gemini API key in `.env`
2. Check Gemini API quota/limits
3. Monitor console for generation errors
4. Try restarting backend to reset connections

### Issue: Dashboard freezes when expanding
**Solution**:
1. Check browser memory usage
2. Try closing other tabs
3. Refresh page and retry
4. Check for animation performance issues

---

## Success Criteria

### All tests pass when:

✅ **Emotion Detection**
- Detects and updates emotion 75-85% accuracy
- Shows confidence >70%
- Updates within 1-2 seconds

✅ **Voice Analysis**
- Detects speech rate within ±10 WPM
- Clarity score reflects audio quality
- Counts filler words accurately
- Identifies pitch quality correctly

✅ **Performance Scoring**
- Score updates every 300-500ms
- Grade matches score ranges
- Component breakdown sums correctly
- Good frames tracked accurately

✅ **AI Coaching**
- Feedback appears within 3-5 seconds
- Content is specific and actionable
- Tone is encouraging/positive
- Adapts to user behavior changes

✅ **Dashboard UX**
- Smooth animations on expand/minimize
- No lag when expanding panels
- Clean layout with readable metrics
- Color coding is intuitive

✅ **Error Handling**
- Graceful degradation on errors
- Clear error messages shown
- System recovers from disconnects
- No hard crashes

✅ **Performance**
- FPS: 30 FPS video capture
- Latency: <150ms end-to-end
- Memory: <100MB during session
- Network: <200KB/s bandwidth

---

## Reporting Results

When testing is complete, create a test report with:

1. **Test Date**: When testing was performed
2. **Tester**: Who conducted the test
3. **Environment**: Browser, OS, network conditions
4. **Results**: Pass/Fail for each scenario
5. **Issues Found**: Any bugs or problems
6. **Performance Metrics**: Actual measured values
7. **Screenshots**: Key screens showing metrics
8. **Recommendations**: Improvements needed

---

## Next Steps After Testing

1. ✅ Fix any identified bugs
2. ✅ Optimize performance if needed
3. ✅ Deploy to staging environment
4. ✅ Conduct user acceptance testing
5. ✅ Deploy to production
6. ✅ Monitor user metrics and feedback
7. ✅ Iterate based on real-world usage

Good luck testing! 🚀
