# 🎤 AI Speech Trainer Agent

<div align="center">

![Speech Trainer](./visuals/ai_speech_trainer.drawio.png)

**Level up your public speaking skills with AI-powered analysis and gamified feedback**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Real-time Practice Mode](#-real-time-practice-mode-new)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Tutorial](#-tutorial)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Contributing](#-contributing)

---

## 🌟 Overview

**AI Speech Trainer Agent** is an advanced AI-powered platform designed to help individuals master public speaking and presentation skills. By leveraging cutting-edge multi-agent AI architecture, the platform analyzes speech videos across multiple dimensions—facial expressions, voice quality, and content structure—to provide comprehensive, actionable feedback.

### What Makes It Special?

- 🤖 **Multi-Agent AI System**: Specialized agents work together to analyze different aspects of your speech
- ⚡ **Real-time Practice Mode**: Live AI feedback as you speak with instant performance metrics
- 🎮 **Gamification**: Earn XP, unlock achievements, and progress through 7 speaker tiers
- 📊 **Dual Analysis Modes**: Real-time practice + comprehensive video analysis
- 🎯 **Personalized Coaching**: Receive tailored strengths, weaknesses, and improvement suggestions
- 📈 **Progress Tracking**: Compare performances over time and track your improvement journey

---

## ✨ Key Features

### 🎭 **Facial Expression Analysis**
- Real-time emotion detection using DeepFace and MediaPipe
- Engagement scoring based on facial cues
- Eye contact and body language assessment
- Confidence level evaluation

### 🎵 **Voice Analysis**
- Speech rate and pace measurement
- Pitch variation and vocal quality assessment
- Volume consistency tracking
- Filler word detection (um, uh, like, etc.)
- Audio transcription using Faster Whisper

### 📝 **Content Analysis**
- Rhetorical structure evaluation
- Persuasion and tone analysis
- Clarity and organization scoring
- Grammar and language quality assessment

### 🎯 **Comprehensive Feedback**
Evaluate speakers on 5 key criteria:
1. **Content & Organization** (1-5)
2. **Delivery & Vocal Quality** (1-5)
3. **Body Language & Eye Contact** (1-5)
4. **Audience Engagement** (1-5)
5. **Language & Clarity** (1-5)

### 🏆 **Gamification System**
- **XP System**: Earn 500 XP per analysis
- **7 Progression Tiers**: 
  - Novice Speaker → Beginner Speaker → Intermediate Speaker → Advanced Speaker → Expert Speaker → Master Speaker → Legendary Orator
- **Achievements**: Unlock badges and milestones
- **Comparison Mode**: Compare multiple performances side-by-side

---

## ⚡ Real-time Practice Mode (NEW)

### Live AI Feedback While You Speak

Practice with **instant feedback** using our cutting-edge real-time analysis system:

#### 🎥 **Real-time Video Analysis**
- **Facial Expression Tracking**: Live emotion detection using MediaPipe
- **Eye Contact Monitoring**: Real-time engagement scoring
- **Smile Detection**: Instant feedback on facial expressions
- **Performance < 100ms**: Lightning-fast analysis per frame

#### 🎤 **Real-time Voice Analysis**
- **Speech-to-Text**: Browser-native Web Speech API
- **Filler Word Detection**: Instant alerts for "um", "uh", "like", etc.
- **Pitch & Volume Tracking**: Live vocal quality monitoring
- **Speech Rate**: Real-time words-per-minute calculation

#### 🎮 **Gamified Practice**
- **Combo System**: Build combos for sustained good performance
  - 1-10x: Good Start (1x multiplier)
  - 11-30x: On Fire 🔥 (1.5x multiplier)
  - 31-60x: Unstoppable ⚡ (2x multiplier)
  - 61+x: Legendary 👑 (3x multiplier)
- **6 Achievements**: Unlock badges with XP rewards (100-500 XP)
- **3 Difficulty Levels**: Beginner, Intermediate, Expert
- **3 Practice Modes**: Practice, Challenge, Timed

#### 📊 **Live Performance Dashboard**
- **Performance Meters**: Facial, Voice, Engagement scores (0-100)
- **Live Transcript**: Speech-to-text with filler word highlighting
- **Feedback Pills**: Color-coded instant feedback messages
- **Achievement Popups**: Confetti animations for unlocks
- **Performance Monitor**: FPS, latency, Web Vitals tracking

#### 🚀 **Performance Optimized**
- **Virtual Scrolling**: Handle 1000+ transcript segments
- **Message Batching**: 40% reduction in WebSocket overhead
- **Smart Reconnection**: Exponential backoff for reliability
- **60 FPS**: Smooth animations and real-time updates
- **< 150ms Latency**: Near-instant feedback

#### 📥 **Export & Review**
- **Transcript Export**: Download session transcript as .txt
- **Session Stats**: Saved to database for progress tracking
- **Auto-scroll**: Intelligent transcript scrolling

---

## 🏗️ Architecture

The application follows a **multi-agent architecture** where specialized AI agents collaborate to provide comprehensive speech analysis:

```
┌─────────────────────────────────────────────────────────────┐
│                     Coordinator Agent                        │
│            (Orchestrates all analysis agents)                │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Facial     │    │    Voice     │    │   Content    │
│  Expression  │    │   Analysis   │    │   Analysis   │
│    Agent     │    │    Agent     │    │    Agent     │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌──────────────┐
                    │   Feedback   │
                    │    Agent     │
                    └──────────────┘
```

### Agent Responsibilities

1. **Coordinator Agent**: Orchestrates the entire analysis workflow and coordinates between specialized agents
2. **Facial Expression Agent**: Analyzes video frames for emotions, engagement, and non-verbal cues
3. **Voice Analysis Agent**: Processes audio for speech patterns, transcription, and vocal quality
4. **Content Analysis Agent**: Evaluates transcript for structure, persuasion, and clarity
5. **Feedback Agent**: Synthesizes all analyses into actionable feedback with scoring

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI Framework**: Agno (Multi-agent orchestration)
- **LLM**: Google Gemini 1.5 Flash
- **Task Queue**: Celery with Redis
- **Database**: SQLite (SQLAlchemy ORM)
- **Computer Vision**: 
  - DeepFace (facial emotion recognition)
  - MediaPipe (facial landmarks)
  - OpenCV (video processing)
- **Audio Processing**:
  - Faster Whisper (transcription)
  - Librosa (audio analysis)
  - MoviePy (video/audio extraction)

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Charts**: Recharts
- **Authentication**: NextAuth.js v5

### DevOps & Tools
- **API Server**: Uvicorn
- **Package Manager**: npm
- **Environment Management**: python-dotenv

---

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 18.x or higher
- **Redis**: For Celery task queue
- **FFmpeg**: For audio/video processing

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/RohitBit-25/speech-trainer-agent.git
cd speech-trainer-agent
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your API keys:
# GEMINI_API_KEY=your_gemini_api_key_here
# REDIS_URL=redis://localhost:6379/0
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend-next

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Add your configuration:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Application

#### Start Redis (Required for Celery)

```bash
# macOS (using Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Or run directly
redis-server
```

#### Start Backend Services

```bash
# Terminal 1: Start FastAPI server
cd backend
python main.py

# Terminal 2: Start Celery worker
cd backend
celery -A app.worker worker --loglevel=info
```

#### Start Frontend

```bash
# Terminal 3: Start Next.js development server
cd frontend-next
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## � Tutorial

For a comprehensive step-by-step guide on using all features, see our **[Complete Tutorial](./TUTORIAL.md)**.

The tutorial covers:
- ✅ Quick start guide
- ✅ Real-time practice mode walkthrough
- ✅ Video analysis guide
- ✅ Understanding your results
- ✅ Gamification system explained
- ✅ Tips & best practices
- ✅ Troubleshooting common issues

**New to the platform?** Start here: [TUTORIAL.md](./TUTORIAL.md)

---

## �📡 API Documentation

### Core Endpoints

#### `POST /analyze`
Upload a video for AI analysis.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**: `video` (file, max 50MB)

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "processing"
}
```

#### `GET /status/{task_id}`
Check the status of an analysis task.

**Response:**
```json
{
  "state": "SUCCESS",
  "result": { /* analysis results */ }
}
```

#### `GET /stream/{task_id}`
Stream real-time analysis logs (Server-Sent Events).

#### `GET /history`
Retrieve analysis history for the user.

**Response:**
```json
[
  {
    "id": 1,
    "task_id": "uuid",
    "video_filename": "speech.mp4",
    "status": "SUCCESS",
    "created_at": "2026-02-17T10:00:00",
    "total_score": 22,
    "feedback_summary": "Great presentation..."
  }
]
```

#### `GET /analysis/{task_id}`
Get detailed analysis results.

**Response:**
```json
{
  "facial": { /* facial analysis data */ },
  "voice": { /* voice analysis data */ },
  "content": { /* content analysis data */ },
  "feedback": {
    "scores": {
      "content_organization": 4,
      "delivery_vocal_quality": 5,
      "body_language_eye_contact": 4,
      "audience_engagement": 4,
      "language_clarity": 5
    },
    "total_score": 22,
    "interpretation": "Proficient speaker",
    "feedback_summary": "..."
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."]
}
```

### Authentication Endpoints

- `POST /auth/signup` - Create new account
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

---

## 📁 Project Structure

```
speech-trainer-agent/
├── backend/
│   ├── app/
│   │   ├── agents/              # AI agent implementations
│   │   │   ├── coordinator_agent.py
│   │   │   ├── facial_expression_agent.py
│   │   │   ├── voice_analysis_agent.py
│   │   │   ├── content_analysis_agent.py
│   │   │   ├── feedback_agent.py
│   │   │   └── tools/           # Agent tools
│   │   ├── api/                 # API routes
│   │   │   ├── server.py        # Main FastAPI app
│   │   │   └── auth.py          # Authentication routes
│   │   ├── core/                # Core configurations
│   │   ├── db/                  # Database models & setup
│   │   │   ├── models.py
│   │   │   └── database.py
│   │   └── worker.py            # Celery worker tasks
│   ├── main.py                  # Application entry point
│   └── requirements.txt
│
├── frontend-next/
│   ├── src/
│   │   ├── app/                 # Next.js app directory
│   │   │   ├── (auth)/          # Auth pages (login/signup)
│   │   │   ├── (dashboard)/     # Dashboard layout
│   │   │   ├── analysis/        # Analysis results page
│   │   │   ├── comparison/      # Performance comparison
│   │   │   ├── feedback/        # Feedback display
│   │   │   ├── history/         # Analysis history
│   │   │   └── page.tsx         # Landing page
│   │   ├── components/          # React components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── upload/          # Video upload components
│   │   │   ├── analysis/        # Analysis display
│   │   │   ├── feedback/        # Feedback components
│   │   │   └── gamification/    # XP, levels, achievements
│   │   └── lib/                 # Utilities
│   ├── package.json
│   └── tailwind.config.ts
│
├── visuals/                     # Project diagrams & images
└── README.md
```

---

## 📖 Usage Guide

### 1. **Upload Your Speech Video**
- Navigate to the dashboard
- Click "Upload Video" or drag & drop your video file
- Supported formats: MP4, MOV, MKV, WebM (max 50MB)

### 2. **Real-time Analysis**
- Watch as the AI agents analyze your speech in real-time
- See live progress updates as each agent completes its analysis

### 3. **Review Feedback**
- **Scores**: View your performance across 5 key criteria
- **Strengths**: Celebrate what you're doing well
- **Weaknesses**: Identify areas for improvement
- **Suggestions**: Get actionable tips to enhance your skills

### 4. **Track Progress**
- Earn 500 XP per analysis
- Level up through 7 speaker tiers
- Unlock achievements and badges
- Compare multiple performances to see improvement

### 5. **Compare Performances**
- Select multiple analyses from your history
- View side-by-side comparisons
- Track improvement over time

---

## 🎯 Scoring Rubric

Each speech is evaluated on a scale of 5-25 points:

| Score Range | Interpretation                |
| ----------- | ----------------------------- |
| 5-9         | Needs significant improvement |
| 10-14       | Developing skills             |
| 15-18       | Competent speaker             |
| 19-22       | Proficient speaker            |
| 23-25       | Outstanding speaker           |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Agno**: Multi-agent orchestration framework
- **Google Gemini**: Advanced language model
- **DeepFace**: Facial recognition and emotion analysis
- **MediaPipe**: Real-time facial landmark detection
- **Faster Whisper**: High-performance speech transcription

---

## 📧 Contact

**Rohit Singh** - [@RohitBit-25](https://github.com/RohitBit-25)

**Project Link**: [https://github.com/RohitBit-25/speech-trainer-agent](https://github.com/RohitBit-25/speech-trainer-agent)

---

<div align="center">

**Made with ❤️ and AI**

*Level up your speech skills today!*

</div>