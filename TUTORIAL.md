# 🎓 Speech Trainer Agent - Complete Tutorial

## 📚 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Feature Walkthroughs](#feature-walkthroughs)
3. [Real-time Practice Mode](#real-time-practice-mode)
4. [Video Analysis](#video-analysis)
5. [Understanding Your Results](#understanding-your-results)
6. [Gamification System](#gamification-system)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start Guide

### Step 1: Installation

```bash
# Clone the repository
git clone https://github.com/RohitBit-25/speech-trainer-agent.git
cd speech-trainer-agent

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend-next
npm install
```

### Step 2: Configuration

**Backend (.env)**:
```env
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_URL=redis://localhost:6379/0
DATABASE_URL=sqlite:///./speech_trainer.db
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Step 3: Start Services

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend
cd backend
python main.py

# Terminal 3: Celery Worker
cd backend
celery -A app.worker worker --loglevel=info

# Terminal 4: Frontend
cd frontend-next
npm run dev
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

---

## 🎯 Feature Walkthroughs

### 1. Creating an Account

1. Navigate to http://localhost:3000
2. Click **"SIGN UP"** in the navigation bar
3. Fill in your details:
   - Name
   - Email
   - Password (min 8 characters)
4. Click **"CREATE ACCOUNT"**
5. You'll be automatically logged in

### 2. Logging In

1. Click **"LOGIN"** in the navigation bar
2. Enter your email and password
3. Click **"SIGN IN"**
4. You'll be redirected to the Studio

---

## 🎮 Real-time Practice Mode

### What is Real-time Practice?

Real-time Practice Mode provides **instant AI feedback** as you speak, helping you improve on the spot with:
- Live facial expression analysis
- Real-time voice quality monitoring
- Speech-to-text transcription
- Filler word detection
- Combo system for sustained performance
- Achievement unlocks

### How to Use Real-time Practice

#### Step 1: Navigate to Practice Mode

1. Click **"Practice 🎮"** in the navigation bar
2. You'll see the Practice interface with:
   - Camera preview (left)
   - Performance meters (right)
   - Session settings (bottom)

#### Step 2: Configure Your Session

**Mode Selection**:
- **Practice**: Free practice with no time limits
- **Challenge**: Goal-oriented practice
- **Timed**: Practice with time constraints

**Difficulty Selection**:
- **Beginner**: Score threshold 50+ (easier to maintain combo)
- **Intermediate**: Score threshold 65+ (balanced)
- **Expert**: Score threshold 80+ (challenging)

#### Step 3: Start Practicing

1. Click **"START PRACTICE"**
2. Allow camera and microphone access when prompted
3. Allow speech recognition when prompted
4. Start speaking!

#### Step 4: Understanding the Interface

**Camera Preview** (Left Side):
- Live video feed
- Recording indicator (red dot)
- Connection status (green = connected)

**Performance Meters** (Right Side):
- **Facial Score**: Eye contact, smile, engagement (0-100)
- **Voice Score**: Pitch, volume, speech rate (0-100)
- **Engagement Score**: Overall engagement level (0-100)

**Combo Counter**:
- Tracks consecutive good performance
- **Multipliers**:
  - 1-10 combo: 1x (Good Start)
  - 11-30 combo: 1.5x (On Fire 🔥)
  - 31-60 combo: 2x (Unstoppable ⚡)
  - 61+ combo: 3x (Legendary 👑)

**Live Transcript**:
- Real-time speech-to-text
- Filler words highlighted in red
- Word count and filler count
- Export to .txt file

**Live Feedback Pills**:
- Green: Positive feedback (great job!)
- Yellow: Warnings (slow down, speak up)
- Red: Critical issues (face not detected)

**Performance Monitor** (Bottom Right):
- FPS counter (target: 60)
- WebSocket latency (target: < 150ms)
- Web Vitals (LCP, FCP, CLS)
- Overall status indicator

#### Step 5: Earning Achievements

**Available Achievements**:
- 🏆 **First Combo** (10x combo) - 100 XP
- 🔥 **Combo Master** (30x combo) - 300 XP
- 👑 **Legendary Combo** (60x combo) - 500 XP
- ⏱️ **Perfect Minute** (60s avg score > 80) - 250 XP
- 🎯 **Filler-Free** (60s no fillers) - 200 XP
- 👁️ **Eye Contact Pro** (60s eye contact > 80%) - 300 XP

Achievements appear as popups with confetti animation!

#### Step 6: Exporting Your Transcript

1. During or after practice, locate the **Live Transcript** section
2. Click **"EXPORT"** button
3. A .txt file will download with:
   - Timestamped transcript
   - All spoken words
   - Easy to review later

#### Step 7: Stopping Practice

1. Click **"STOP"** button
2. Your session stats are saved to the database
3. Transcript remains visible for review
4. Performance metrics are recorded

---

## 📹 Video Analysis

### Uploading a Video

#### Step 1: Navigate to Studio

1. Click **"Studio 🎬"** in the navigation
2. You'll see the upload interface

#### Step 2: Upload Your Video

**Method 1: Drag & Drop**
- Drag your video file into the upload area
- File will be automatically selected

**Method 2: Click to Browse**
- Click the upload area
- Select your video file from the file picker

**Supported Formats**:
- MP4, MOV, MKV, WebM
- Max size: 50MB
- Recommended: 720p or 1080p resolution

#### Step 3: Start Analysis

1. Click **"ANALYZE VIDEO"**
2. You'll see a real-time progress stream showing:
   - 🎬 Video processing
   - 😊 Facial expression analysis
   - 🎵 Voice analysis
   - 📝 Content analysis
   - 💬 Feedback generation

#### Step 4: Wait for Completion

- Analysis typically takes 1-3 minutes
- You can navigate away and check back later
- Progress is saved automatically

---

## 📊 Understanding Your Results

### Analysis Results Page

After analysis completes, you'll see:

#### 1. Overall Score (5-25 points)

**Score Breakdown**:
- **Content & Organization** (1-5): Structure, clarity, flow
- **Delivery & Vocal Quality** (1-5): Pace, pitch, volume
- **Body Language & Eye Contact** (1-5): Facial expressions, engagement
- **Audience Engagement** (1-5): Connection, energy
- **Language & Clarity** (1-5): Grammar, word choice

**Interpretation**:
| Score | Level                         |
| ----- | ----------------------------- |
| 5-9   | Needs significant improvement |
| 10-14 | Developing skills             |
| 15-18 | Competent speaker             |
| 19-22 | Proficient speaker            |
| 23-25 | Outstanding speaker           |

#### 2. Detailed Analysis

**Facial Expression Analysis**:
- Dominant emotions detected
- Emotion timeline chart
- Engagement score
- Eye contact assessment

**Voice Analysis**:
- Speech rate (words per minute)
- Pitch variation
- Volume consistency
- Filler word count and list
- Full transcript

**Content Analysis**:
- Rhetorical structure
- Persuasion techniques used
- Tone and clarity
- Organization quality

#### 3. Feedback Summary

**Strengths**: What you did well
**Weaknesses**: Areas to improve
**Suggestions**: Actionable tips

---

## 🏆 Gamification System

### XP & Leveling

**Earning XP**:
- Video analysis: 500 XP
- Real-time achievements: 100-500 XP
- Daily practice: Bonus XP

**Level Progression** (7 Tiers):
1. **Novice Speaker** (0-999 XP)
2. **Beginner Speaker** (1000-2999 XP)
3. **Intermediate Speaker** (3000-5999 XP)
4. **Advanced Speaker** (6000-9999 XP)
5. **Expert Speaker** (10000-14999 XP)
6. **Master Speaker** (15000-24999 XP)
7. **Legendary Orator** (25000+ XP)

### Viewing Your Progress

1. Click your profile icon (top right)
2. Your current level badge is displayed
3. Hover to see XP progress

### Analysis History

1. Click **"Logs 📊"** in navigation
2. View all past analyses
3. Click any analysis to review details
4. Compare multiple analyses

### Performance Comparison

1. Go to **"Analysis"** page
2. Select 2+ analyses from history
3. Click **"COMPARE"**
4. View side-by-side metrics
5. Track improvement over time

---

## 💡 Tips & Best Practices

### For Real-time Practice

**Camera Setup**:
- ✅ Position camera at eye level
- ✅ Ensure good lighting (face clearly visible)
- ✅ Neutral background
- ✅ Stable camera position

**Audio Setup**:
- ✅ Use external microphone if possible
- ✅ Minimize background noise
- ✅ Speak clearly and at normal volume
- ✅ Test audio levels before starting

**Practice Tips**:
- 🎯 Start with **Beginner** difficulty
- 🎯 Focus on maintaining combos
- 🎯 Watch for filler word alerts
- 🎯 Review transcript after each session
- 🎯 Practice for 5-10 minutes daily

### For Video Analysis

**Recording Tips**:
- 📹 Record in landscape mode
- 📹 720p or 1080p resolution
- 📹 Keep videos under 50MB
- 📹 2-5 minute speeches work best
- 📹 Ensure clear audio

**Content Tips**:
- 📝 Have a clear structure (intro, body, conclusion)
- 📝 Use rhetorical devices
- 📝 Vary your tone and pace
- 📝 Make eye contact with camera
- 📝 Use hand gestures naturally

---

## 🔧 Troubleshooting

### Camera/Microphone Issues

**Problem**: Camera not working
**Solutions**:
1. Check browser permissions (Settings → Privacy)
2. Ensure no other app is using the camera
3. Try refreshing the page
4. Use Chrome or Edge (best support)

**Problem**: Microphone not picking up audio
**Solutions**:
1. Check system audio settings
2. Ensure correct microphone selected
3. Test microphone in system settings
4. Increase microphone volume

### Speech Recognition Issues

**Problem**: Transcription not working
**Solutions**:
1. Use Chrome or Edge (best support)
2. Check browser speech recognition permissions
3. Speak clearly and at normal pace
4. Ensure stable internet connection

### Performance Issues

**Problem**: Low FPS or lag
**Solutions**:
1. Close other browser tabs
2. Reduce video quality if possible
3. Check Performance Monitor for bottlenecks
4. Ensure good internet connection
5. Try restarting the browser

**Problem**: High latency
**Solutions**:
1. Check internet connection speed
2. Ensure backend server is running
3. Check Redis is running
4. Restart backend services

### Video Upload Issues

**Problem**: Video upload fails
**Solutions**:
1. Check file size (max 50MB)
2. Ensure supported format (MP4, MOV, MKV, WebM)
3. Try compressing the video
4. Check backend logs for errors

**Problem**: Analysis stuck at processing
**Solutions**:
1. Check Celery worker is running
2. Check Redis is running
3. View backend logs for errors
4. Try uploading a smaller video

---

## 📱 Browser Compatibility

### Recommended Browsers

**Best Support**:
- ✅ Chrome 90+ (Full support)
- ✅ Edge 90+ (Full support)

**Good Support**:
- ⚠️ Safari 14+ (Limited speech recognition)
- ⚠️ Firefox 88+ (Limited WebRTC)

**Features by Browser**:

| Feature             | Chrome | Edge | Safari | Firefox |
| ------------------- | ------ | ---- | ------ | ------- |
| Video Upload        | ✅      | ✅    | ✅      | ✅       |
| Real-time Practice  | ✅      | ✅    | ⚠️      | ⚠️       |
| Speech Recognition  | ✅      | ✅    | ⚠️      | ❌       |
| Performance Monitor | ✅      | ✅    | ✅      | ✅       |
| WebSocket           | ✅      | ✅    | ✅      | ✅       |

---

## 🎓 Learning Path

### Week 1: Getting Started
- ✅ Complete 3 video analyses
- ✅ Try real-time practice mode
- ✅ Earn your first achievement
- ✅ Reach Beginner Speaker level

### Week 2: Building Skills
- ✅ Practice daily for 5 minutes
- ✅ Reduce filler words by 50%
- ✅ Maintain 20+ combo
- ✅ Reach Intermediate Speaker level

### Week 3: Mastery
- ✅ Achieve 60+ combo
- ✅ Score 20+ on video analysis
- ✅ Unlock all achievements
- ✅ Compare 5+ performances

---

## 📞 Getting Help

### Resources

- **Documentation**: [README.md](../README.md)
- **API Docs**: http://localhost:8000/docs
- **GitHub Issues**: [Report a bug](https://github.com/RohitBit-25/speech-trainer-agent/issues)

### Common Questions

**Q: How long should my practice sessions be?**
A: 5-10 minutes is ideal for focused practice.

**Q: Can I use this offline?**
A: No, internet connection required for AI analysis.

**Q: Is my data private?**
A: Yes, all data is stored locally on your machine.

**Q: Can I delete my analysis history?**
A: Yes, from the History page, click delete on any analysis.

**Q: What's the best difficulty level to start with?**
A: Start with Beginner, then progress to Intermediate.

---

## 🎉 Congratulations!

You're now ready to master public speaking with AI-powered feedback!

**Next Steps**:
1. Start your first practice session
2. Upload your first video
3. Track your progress
4. Level up your skills!

**Happy Speaking! 🎤**
