# VAANIX - AI Speech Training Platform

<p align="center">
  <!-- GitHub badges - Replace YOUR_USERNAME with your actual GitHub username -->
  <img src="https://img.shields.io/github/languages/top/YOUR_USERNAME/speech-trainer-agent?color=orange" alt="GitHub top language">
  <img src="https://img.shields.io/github/languages/code-size/YOUR_USERNAME/speech-trainer-agent" alt="GitHub code size in bytes">
  <img src="https://img.shields.io/github/repo-size/YOUR_USERNAME/speech-trainer-agent" alt="GitHub repo size">
  <img src="https://img.shields.io/github/last-commit/YOUR_USERNAME/speech-trainer-agent" alt="GitHub last commit">
  <img src="https://img.shields.io/github/issues/YOUR_USERNAME/speech-trainer-agent" alt="GitHub issues">
  <img src="https://img.shields.io/github/issues-pr/YOUR_USERNAME/speech-trainer-agent" alt="GitHub pull requests">
  <img src="https://img.shields.io/github/license/YOUR_USERNAME/speech-trainer-agent" alt="GitHub">
</p>

<p align="center">
  <!-- Logo placeholder - Replace with your actual logo -->
  <img src="https://raw.githubusercontent.com/YOUR_USERNAME/speech-trainer-agent/main/frontend-next/public/vaanix-logo.svg" alt="VAANIX Logo" width="200">
</p>

<h1 align="center">VAANIX - AI Speech Training Platform</h1>

<p align="center">
  <strong>Level up your speech with VAANIX — AI-powered analysis of voice, expressions, and content.</strong>
  <br>
  <strong>Earn XP, unlock achievements, and master communication.</strong>
</p>

> 📝 **Important Setup Notes for GitHub Deployment:**
> 
> 1. **GitHub Badges**: Replace `YOUR_USERNAME` in badge URLs with your actual GitHub username
> 2. **Logo**: Upload your logo to `frontend-next/public/` and update the logo URL
> 3. **Repository Links**: Update all repository links to point to your actual GitHub repository
> 4. **Deployment URLs**: Replace placeholder URLs with your actual deployment links
> 5. **License**: Update the license badge with your actual license type

<p align="center">
  <a href="#-features"><strong>Features</strong></a> •
  <a href="#-quick-start"><strong>Quick Start</strong></a> •
  <a href="#-documentation"><strong>Documentation</strong></a> •
  <a href="#-contributing"><strong>Contributing</strong></a> •
  <a href="#-license"><strong>License</strong></a>
</p>

<p align="center">
  <a href="https://your-deployment-url.com">Live Demo</a> •
  <a href="https://your-docs-url.com">Documentation</a> •
  <a href="https://github.com/yourusername/speech-trainer-agent/issues">Issues</a> •
  <a href="https://github.com/yourusername/speech-trainer-agent/discussions">Discussions</a>
</p>

## 🎯 Overview

VAANIX is an advanced AI-powered speech training platform designed to transform how people develop their public speaking and communication skills. By combining cutting-edge artificial intelligence with gamified learning principles, VAANIX provides personalized, data-driven feedback that helps users overcome common speaking challenges and build confidence.

Built with a modern tech stack featuring Next.js, FastAPI, and real-time AI analysis, VAANIX offers both live practice sessions and video analysis capabilities. The platform's unique approach combines technical metrics with human-centered coaching insights to deliver actionable feedback that actually improves performance.

### 🎯 Key Value Propositions

- **Data-Driven Feedback**: Get precise, measurable insights instead of generic advice
- **Real-Time Analysis**: Immediate feedback during live practice sessions
- **Comprehensive Metrics**: 5-dimensional scoring covering all aspects of effective communication
- **Gamified Learning**: Engaging progression system that makes improvement fun
- **Personalized Growth**: Track your progress over time with detailed analytics

### 🎯 Target Audience

- **Professionals** seeking to improve presentation skills
- **Students** preparing for speeches and presentations
- **Public speakers** wanting to refine their craft
- **Job seekers** practicing interview skills
- **Anyone** looking to communicate more effectively

## 🚀 Key Features

### 🎯 Practice Modes

| Feature | Description | Technology |
|---------|-------------|------------|
| **Live Practice Session** | Real-time analysis with webcam and microphone integration | WebRTC, Socket.IO |
| **Video Upload Practice** | Detailed analysis of pre-recorded presentations | FFmpeg, Async Processing |
| **Challenge Mode** | Structured speaking exercises with specific goals | Gamification Engine |
| **Studio Mode** | Professional recording environment with advanced metrics | Real-time Analytics |

### 🤖 Real-time Analysis Engine

Our AI engine provides comprehensive feedback through three core analysis modules:

1. **Facial Expression Analysis**
   - Tracks 468 facial landmarks using MediaPipe
   - Detects micro-expressions and emotional states
   - Measures eye contact frequency and engagement
   - Analyzes smile patterns and facial dynamics

2. **Voice Quality Analysis**
   - Speech rate monitoring (words per minute)
   - Pitch variation detection
   - Volume consistency analysis
   - Filler word identification and counting
   - Whisper-based transcription with timestamping

3. **Content Delivery Analysis**
   - Structure evaluation using LLM processing
   - Clarity and persuasion scoring
   - Language precision metrics
   - Content flow and logical progression

### 📊 Feedback & Scoring System

#### Five-Dimensional Scoring (0-100 each)

| Dimension | Metrics | Weight | Focus Area |
|-----------|---------|--------|------------|
| **Content Clarity** | Structure, logic, coherence | 25% | Information delivery |
| **Delivery Fluency** | Pace, rhythm, filler words | 20% | Speaking mechanics |
| **Body Language** | Gestures, posture, movement | 20% | Non-verbal communication |
| **Engagement Level** | Eye contact, audience connection | 20% | Connection quality |
| **Language Precision** | Word choice, grammar, vocabulary | 15% | Verbal sophistication |

### 🎮 Gamified Progression System

#### Experience Points (XP) Structure
- **Base XP**: 500 points per completed session
- **Performance Bonuses**: Up to +300 XP for high scores
- **Streak Multipliers**: 1.2x to 2.0x for consecutive days
- **Achievement Rewards**: 100-1000 XP for milestones
- **Challenge Completion**: 200-500 XP per challenge

#### Speaker Levels

| Level | XP Range | Title | Benefits |
|-------|----------|-------|----------|
| 1 | 0-1,000 | **Novice Speaker** | Basic feedback, core features |
| 2 | 1,001-2,500 | **Apprentice** | Advanced metrics, challenge access |
| 3 | 2,501-5,000 | **Competent Communicator** | Detailed analytics, comparison tools |
| 4 | 5,001-10,000 | **Proficient Speaker** | Premium features, priority processing |
| 5 | 10,001-20,000 | **Expert Presenter** | Custom coaching, advanced insights |
| 6 | 20,001-50,000 | **Master Communicator** | Elite features, community recognition |
| 7 | 50,001+ | **Grandmaster** | VIP support, beta feature access |

#### Achievement System

| Achievement | Criteria | Reward | Badge |
|-------------|----------|--------|-------|
| **First Steps** | Complete first analysis | 100 XP | 🥇 |
| **Perfect Score** | 100 in any category | 500 XP | 🏆 |
| **Streak Master** | 7-day practice streak | 300 XP | 🔥 |
| **Content Creator** | Upload 10 videos | 250 XP | 🎬 |
| **Social Butterfly** | Engage with 50 community posts | 200 XP | 🦋 |
| **Consistency King** | 30 consecutive days | 1000 XP | 👑 |
| **Perfectionist** | 90+ in all categories | 750 XP | ✨ |

### 👤 User Management

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Profile Management**: Customizable profiles with progress tracking
- **Practice History**: Comprehensive session history with performance trends
- **Social Features**: Leaderboards, community engagement, and peer feedback
- **Privacy Controls**: Granular privacy settings for all content

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TD
    A[Client Applications] --> B[Load Balancer]
    B --> C[Next.js Frontend]
    B --> D[Mobile App]
    
    C --> E[FastAPI Backend]
    D --> E
    
    E --> F[Authentication Service]
    E --> G[Analysis Engine]
    E --> H[User Management]
    E --> I[Game Services]
    
    G --> J[Celery Workers]
    J --> K[Redis Queue]
    
    G --> L[AI Processing]
    L --> M[OpenRouter LLM]
    L --> N[MediaPipe/OpenCV]
    L --> O[Whisper STT]
    
    E --> P[MongoDB]
    E --> Q[Redis Cache]
    
    R[Monitoring] --> E
    S[Logging] --> J
```

### Component Architecture

#### Frontend Layer
```
frontend-next/
├── src/
│   ├── app/                 # Next.js 13 App Router
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Main application
│   │   ├── practice/       # Practice interface
│   │   ├── studio/         # Recording studio
│   │   └── challenges/     # Challenge system
│   ├── components/         # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
└── public/                # Static assets
```

#### Backend Layer
```
backend/
├── app/
│   ├── api/               # REST API endpoints
│   │   ├── auth.py       # Authentication routes
│   │   ├── practice.py   # Practice functionality
│   │   ├── challenges.py # Challenge system
│   │   └── user.py       # User management
│   ├── agents/           # AI analysis agents
│   │   ├── coordinator_agent.py
│   │   ├── voice_analysis_agent.py
│   │   └── facial_expression_agent.py
│   ├── core/             # Core business logic
│   │   ├── config.py
│   │   ├── scoring_system.py
│   │   └── gemini_coach_engine.py
│   ├── db/               # Database models and connections
│   └── worker.py         # Celery worker configuration
├── temp_uploads/         # Temporary file storage
└── main.py              # Application entry point
```

### Data Flow

1. **User Interaction**: Client sends request via REST API or WebSocket
2. **Authentication**: JWT validation and user context creation
3. **Task Queue**: Long-running analysis tasks queued in Redis
4. **Processing**: Celery workers execute AI analysis pipelines
5. **Data Storage**: Results stored in MongoDB with caching in Redis
6. **Response**: Results delivered to client with real-time updates

### Scalability Considerations

- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Database Sharding**: MongoDB sharding for large datasets
- **Caching Strategy**: Redis caching for frequently accessed data
- **CDN Integration**: Static asset delivery optimization
- **Microservices Ready**: Modular architecture supports service decomposition

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose | Key Features |
|------------|---------|---------|--------------|
| **Next.js** | 13.x | React Framework | App Router, SSR, ISR |
| **React** | 18.x | UI Library | Hooks, Context, Concurrent Mode |
| **TypeScript** | 5.x | Type Safety | Static typing, better DX |
| **Tailwind CSS** | 3.x | Styling | Utility-first, responsive |
| **Framer Motion** | 10.x | Animations | Declarative, performance |
| **Shadcn/ui** | Latest | UI Components | Accessible, customizable |
| **Socket.IO** | 4.x | Real-time | WebSockets, fallbacks |
| **Zustand** | 4.x | State Management | Lightweight, easy API |

### Backend Technologies

| Technology | Version | Purpose | Key Features |
|------------|---------|---------|--------------|
| **Python** | 3.9+ | Core Language | Async support, rich ecosystem |
| **FastAPI** | 0.100+ | Web Framework | ASGI, automatic docs, validation |
| **Pydantic** | 2.x | Data Validation | Type hints, serialization |
| **Celery** | 5.x | Task Queue | Distributed, async processing |
| **Redis** | 7.x | Cache/Queue | In-memory, pub/sub, persistence |
| **MongoDB** | 7.x | Database | Document store, aggregation |
| **JWT** | PyJWT | Authentication | Token-based, secure |

### AI/ML Technologies

| Technology | Version | Purpose | Key Features |
|------------|---------|---------|--------------|
| **OpenRouter** | API | LLM Service | Multiple model support |
| **MediaPipe** | Latest | Computer Vision | Face mesh, pose detection |
| **OpenCV** | 4.x | Image Processing | Real-time, cross-platform |
| **Whisper** | Large | Speech Recognition | Multilingual, accurate |
| **FFmpeg** | 6.x | Media Processing | Encoding, filtering, streaming |

### Development & DevOps

| Technology | Purpose | Configuration |
|------------|---------|---------------|
| **Docker** | Containerization | Multi-stage builds |
| **Docker Compose** | Orchestration | Local development |
| **GitHub Actions** | CI/CD | Automated testing |
| **ESLint** | Linting | Code quality |
| **Prettier** | Formatting | Code consistency |
| **Jest** | Testing | Unit/integration tests |
| **Playwright** | E2E Testing | Browser automation |

### Infrastructure

| Service | Purpose | Provider |
|---------|---------|----------|
| **Vercel** | Frontend Hosting | Next.js optimized |
| **Render/Railway** | Backend Hosting | Python support |
| **MongoDB Atlas** | Database | Managed MongoDB |
| **Upstash** | Redis | Serverless Redis |
| **Cloudflare** | CDN | Global edge network |

## 📋 System Requirements

### Minimum Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **Operating System** | macOS 12+, Windows 10+, Linux | Latest updates recommended |
| **RAM** | 8GB | 16GB recommended for development |
| **Storage** | 10GB free space | For dependencies and media files |
| **CPU** | 4 cores | Intel i5/AMD Ryzen 5 or equivalent |

### Development Environment

| Tool | Version | Installation |
|------|---------|-------------|
| **Python** | 3.9+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Included with Node.js |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com/) |
| **Redis** | 7.0+ | [redis.io](https://redis.io/download/) |
| **MongoDB** | 6.0+ | [mongodb.com](https://www.mongodb.com/try/download) |
| **FFmpeg** | 6.0+ | [ffmpeg.org](https://ffmpeg.org/download.html) |

### Optional Tools

| Tool | Purpose | Recommendation |
|------|---------|---------------|
| **Docker** | Containerization | For consistent environments |
| **Docker Compose** | Service orchestration | For local development |
| **Postman** | API testing | For endpoint validation |
| **MongoDB Compass** | Database GUI | For data exploration |
| **RedisInsight** | Redis GUI | For cache monitoring |

## 🚀 Quick Start Guide

### 📥 Installation

#### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/yourusername/vaanix.git
cd vaanix

# Optional: Switch to development branch
git checkout develop
```

#### 2. Environment Setup

Create the necessary environment files:

**backend/.env**
```env
# Database Configuration
MONGODB_URL=mongodb://localhost:27017/speech_trainer
MONGODB_DB_NAME=speech_trainer

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/auto

# File Upload
MAX_CONTENT_LENGTH=104857600
UPLOAD_FOLDER=temp_uploads

# Application
DEBUG=True
LOG_LEVEL=INFO
```

**frontend-next/.env.local**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Application
NEXT_PUBLIC_APP_NAME=VAANIX
NEXT_PUBLIC_APP_VERSION=2.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_GA=false
```

#### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database (if needed)
python -m app.db.seed_challenges
python -m app.db.seed_leaderboard
```

#### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend-next

# Install dependencies
npm install

# Install additional dev dependencies
npm install -D @types/node @types/react @types/react-dom
```

### ▶️ Running the Application

#### Method 1: Manual Startup (Recommended for Development)

**Terminal 1 - Redis Server:**
```bash
redis-server
```

**Terminal 2 - Celery Worker:**
```bash
cd backend
celery -A app.worker.celery_app worker --loglevel=info --pool=solo
```

**Terminal 3 - Backend Server:**
```bash
cd backend
python main.py
```

**Terminal 4 - Frontend Development Server:**
```bash
cd frontend-next
npm run dev
```

#### Method 2: Docker Compose (Recommended for Production)

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 🧪 Verification

Once all services are running, verify the setup:

1. **Frontend**: Visit `http://localhost:3000`
2. **Backend API**: Visit `http://localhost:8000`
3. **API Documentation**: Visit `http://localhost:8000/docs`
4. **Redis**: Test connection with `redis-cli ping`
5. **Health Check**: `curl http://localhost:8000/health`

Expected responses:
- Redis: `PONG`
- Health Check: `{"status": "healthy", "timestamp": "..."}`

## 🎮 User Guide

### Getting Started

#### 1. Account Creation
1. Visit the homepage at `http://localhost:3000`
2. Click **"Start Free"** or **"Sign Up"**
3. Fill in your details (name, email, password)
4. Verify your email address
5. Complete your profile setup

#### 2. First Practice Session

**Live Practice Mode:**
1. Navigate to **Practice** → **Live Session**
2. Grant camera and microphone permissions
3. Select your difficulty level
4. Click **Start Recording**
5. Speak for 1-5 minutes on any topic
6. Click **Stop** to end the session
7. View your detailed analysis

**Video Upload Mode:**
1. Navigate to **Practice** → **Upload Video**
2. Click **Choose File** or drag-drop your video
3. Supported formats: MP4, MOV, WebM (max 100MB)
4. Add a title and description
5. Click **Analyze Video**
6. Wait for processing (2-5 minutes)
7. Review your comprehensive feedback

### Core Features Walkthrough

#### 📊 Performance Dashboard
- **Overall Score**: Combined 5-dimensional assessment
- **Category Breakdown**: Detailed scores for each metric
- **Progress Timeline**: Historical performance trends
- **Strengths/Weaknesses**: AI-generated insights
- **Improvement Suggestions**: Actionable recommendations

#### 🎯 Challenge System
1. Visit the **Challenges** section
2. Browse available micro-challenges
3. Select a challenge that matches your goals
4. Follow the specific instructions
5. Complete the task and submit
6. Earn XP and unlock achievements

#### 🏆 Gamification Elements
- **Level Progression**: Track your speaker level advancement
- **Achievement Badges**: Collect badges for milestones
- **Leaderboards**: Compare with other users
- **Streak Tracking**: Maintain daily practice habits
- **XP Earnings**: Gain experience for all activities

#### 📈 Analytics & Insights
- **Performance Trends**: Week-over-week improvements
- **Category Analysis**: Strengths and areas for growth
- **Practice History**: Complete session log
- **Time Investment**: Track your learning journey
- **Goal Tracking**: Monitor progress toward objectives

### Advanced Features

#### Studio Mode
Professional recording environment with:
- Advanced camera controls
- Real-time metrics overlay
- Custom recording settings
- High-quality audio processing
- Export capabilities

#### Comparison Tools
- Compare sessions side-by-side
- Track improvement over time
- Benchmark against community averages
- Export progress reports

#### Social Features
- Share achievements with friends
- Join speaking communities
- Participate in group challenges
- Receive peer feedback
- Mentor other users

## 📊 API Documentation

### Authentication Endpoints

#### `POST /api/auth/signup`
User registration endpoint

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "60f1b2c3d4e5f6a7b8c9d0e1",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "level": 1,
    "xp": 0
  }
}
```

#### `POST /api/auth/login`
User authentication

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "60f1b2c3d4e5f6a7b8c9d0e1",
    "email": "user@example.com",
    "name": "John Doe",
    "level": 3,
    "xp": 2500
  }
}
```

### Practice Endpoints

#### `POST /api/practice/upload`
Upload video for analysis

**Request:**
```bash
curl -X POST \
  http://localhost:8000/api/practice/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@presentation.mp4" \
  -F "title=My Presentation" \
  -F "description=Team meeting presentation"
```

**Response:**
```json
{
  "task_id": "task_1234567890",
  "status": "PROCESSING",
  "message": "Video analysis started"
}
```

#### `GET /api/practice/history`
Get user's practice history

**Response:**
```json
{
  "total_sessions": 25,
  "sessions": [
    {
      "id": "sess_1234567890",
      "title": "Project Presentation",
      "date": "2024-01-15T10:30:00Z",
      "duration": 180,
      "score": 85,
      "mode": "upload",
      "feedback_summary": "Strong content delivery with good eye contact"
    }
  ],
  "stats": {
    "average_score": 78,
    "total_practice_time": 7200,
    "streak_days": 5
  }
}
```

#### `GET /api/practice/analysis/{task_id}`
Get analysis results

**Response:**
```json
{
  "task_id": "task_1234567890",
  "status": "COMPLETED",
  "completed_at": "2024-01-15T11:00:00Z",
  "results": {
    "overall_score": 85,
    "dimension_scores": {
      "content_clarity": 88,
      "delivery_fluency": 82,
      "body_language": 79,
      "engagement_level": 91,
      "language_precision": 85
    },
    "transcription": "This is the full transcription of the speech...",
    "strengths": [
      "Excellent eye contact maintained throughout",
      "Clear and logical structure",
      "Good use of pauses for emphasis"
    ],
    "weaknesses": [
      "Some filler words detected",
      "Pace could be more consistent",
      "Limited hand gestures"
    ],
    "suggestions": [
      "Practice reducing um and uh usage",
      "Work on maintaining steady pace",
      "Incorporate more natural hand movements"
    ]
  }
}
```

### Challenge Endpoints

#### `GET /api/challenges`
List available challenges

**Response:**
```json
{
  "challenges": [
    {
      "id": "ch_001",
      "title": "Introduction Master",
      "description": "Record a 2-minute self-introduction",
      "difficulty": "beginner",
      "xp_reward": 200,
      "criteria": [
        "Clear speaking pace",
        "Good eye contact",
        "Engaging opening"
      ],
      "time_limit": 120
    }
  ]
}
```

#### `POST /api/challenges/{id}/attempt`
Submit challenge attempt

**Request Body:**
```json
{
  "video_id": "vid_1234567890",
  "notes": "This was challenging but I focused on my pace"
}
```

### User Progress Endpoints

#### `GET /api/user/stats`
Get user statistics

**Response:**
```json
{
  "user_id": "usr_1234567890",
  "level": 4,
  "xp": 8500,
  "next_level_xp": 10000,
  "total_sessions": 42,
  "streak_days": 12,
  "achievements_unlocked": 8,
  "favorite_categories": [
    "content_clarity",
    "engagement_level"
  ]
}
```

#### `GET /api/user/achievements`
Get unlocked achievements

**Response:**
```json
{
  "total_achievements": 15,
  "unlocked": [
    {
      "id": "ach_001",
      "name": "First Steps",
      "description": "Complete your first analysis",
      "xp_reward": 100,
      "unlocked_at": "2024-01-01T10:00:00Z",
      "badge": "🥇"
    }
  ]
}
```

### WebSocket Events

Real-time updates are available via WebSocket connections:

```javascript
const socket = io('http://localhost:8000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Task progress updates
socket.on('task_progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
  console.log(`Status: ${data.status}`);
});

// Analysis completion
socket.on('analysis_complete', (data) => {
  console.log('Analysis completed!', data.results);
});

// Live metrics (for practice mode)
socket.on('live_metrics', (data) => {
  console.log('Current metrics:', data);
});
```

### Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_ERROR`: Server-side error

## 🎨 Design System

### Visual Identity

#### Color Palette

| Color | Name | Hex | Usage |
|-------|------|-----|-------|
| ![Primary](https://via.placeholder.com/20/FF9933/FF9933) | **Primary (Saffron)** | `#FF9933` | Main brand color, CTAs, highlights |
| ![Secondary](https://via.placeholder.com/20/06B6D4/06B6D4) | **Secondary (Teal)** | `#06B6D4` | Secondary actions, accents |
| ![Accent](https://via.placeholder.com/20/22D3EE/22D3EE) | **Accent (Cyan)** | `#22D3EE` | VAANIX branding, special elements |
| ![Background](https://via.placeholder.com/20/18181B/18181B) | **Background Dark** | `#18181B` | Main background |
| ![Surface](https://via.placeholder.com/20/27272A/27272A) | **Surface** | `#27272A` | Card backgrounds, panels |
| ![Text](https://via.placeholder.com/20/FAFAFA/FAFAFA) | **Text Light** | `#FAFAFA` | Primary text |
| ![Text](https://via.placeholder.com/20/71717A/71717A) | **Text Muted** | `#71717A` | Secondary text, labels |

#### Typography

**Primary Font: Inter**
- Used for body text and UI elements
- Clean, modern, highly readable

**Monospace Font: JetBrains Mono**
- Used for code snippets and technical data
- Clear distinction for technical content

**Pixel Font: Press Start 2P**
- Used for brand elements and gamification
- Retro gaming aesthetic for VAANIX branding

**Retro Font: VT323**
- Used for terminal-style elements
- Cyberpunk/tech atmosphere

#### UI Components

**Buttons**
```css
/* Primary Button */
.bg-primary.text-black.hover\:bg-white.border-4.border-black
.shadow-\[6px_6px_0px_rgba\(0\,0\,0\,0\.8\)\]

/* Secondary Button */
.bg-zinc-900.border-2.border-zinc-700.text-white
.hover\:border-primary\/50.hover\:text-primary
```

**Cards**
```css
.bg-black.border-4.border-zinc-800
.shadow-\[8px_8px_0px_\#000\]
.hover\:border-primary\/40.transition-all
```

**Badges**
```css
.inline-flex.items-center.gap-2
.px-4.py-2.bg-zinc-900\/80.border-2.border-primary\/30
.text-xs.font-mono.text-zinc-400
```

### Animation Principles

**Micro-interactions**
- Hover effects: Scale 1.05, Y-translate -2px
- Button taps: Scale 0.95 for tactile feedback
- Loading states: Pulse animations with 1.5s duration
- Progress indicators: Smooth transitions with easing

**Page Transitions**
- Fade in: 0.3s ease-out
- Slide in: 0.5s ease-in-out
- Staggered animations: 0.1s delays for sequential elements

**Loading States**
```javascript
// Skeleton loading
<motion.div 
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ duration: 1.5, repeat: Infinity }}
/>

// Progress bars
<motion.div 
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.5, ease: "easeOut" }}
/>
```

### Responsive Design

**Breakpoints**
- Mobile: `max-width: 768px`
- Tablet: `768px` to `1024px`
- Desktop: `1024px` and above
- Large Desktop: `1440px` and above

**Grid System**
- Mobile: Single column layout
- Tablet: 2-column grid for cards
- Desktop: 3-column grid for dashboards
- Large Desktop: 4-column grid for data-dense views

### Accessibility

**Color Contrast**
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have 3:1 contrast ratio
- Focus states clearly visible for keyboard navigation

**Screen Reader Support**
- Semantic HTML structure
- ARIA labels for complex components
- Proper heading hierarchy
- Alt text for all images

**Keyboard Navigation**
- Full keyboard operability
- Logical tab order
- Visible focus indicators
- Skip to content links

## 🏆 Gamification Framework

### Core Mechanics

#### Experience Points (XP) System

**Base Rewards:**
- **Video Analysis**: 500 XP per completed session
- **Live Practice**: 300 XP per 5-minute session
- **Challenge Completion**: 200-500 XP per challenge
- **Daily Login**: 50 XP bonus
- **Streak Maintenance**: 25 XP per consecutive day

**Performance Multipliers:**
- **Score-based**: 1.0x to 1.5x based on overall performance
- **Streak Multiplier**: 1.2x to 2.0x for consecutive days
- **First Attempt Bonus**: 1.3x for first-time challenge completions
- **Perfect Score**: 2.0x for 90+ in all categories

#### Speaker Level Progression

| Level | Tier | XP Required | Title | Unlockables |
|-------|------|-------------|-------|-------------|
| 1 | Bronze | 0-1,000 | **Novice Speaker** | Basic features, core metrics |
| 2 | Bronze | 1,001-2,500 | **Apprentice** | Advanced analytics, challenge access |
| 3 | Silver | 2,501-5,000 | **Competent Communicator** | Comparison tools, detailed insights |
| 4 | Silver | 5,001-10,000 | **Proficient Speaker** | Priority processing, export features |
| 5 | Gold | 10,001-20,000 | **Expert Presenter** | Custom coaching, premium templates |
| 6 | Gold | 20,001-50,000 | **Master Communicator** | Community features, beta access |
| 7 | Platinum | 50,001+ | **Grandmaster** | VIP support, all features unlocked |

#### Achievement System

**Category-Based Achievements:**

| Category | Achievement | Criteria | Reward | Badge |
|----------|-------------|----------|--------|-------|
| **General** | First Steps | Complete first analysis | 100 XP | 🥇 |
| **General** | Consistency King | 30 consecutive days | 1000 XP | 👑 |
| **General** | Content Creator | Upload 25 videos | 500 XP | 🎬 |
| **Performance** | Perfect Score | 100 in any category | 750 XP | 🏆 |
| **Performance** | Balanced Master | 85+ in all categories | 1000 XP | ⚖️ |
| **Performance** | Improvement Champion | 20% score increase | 300 XP | 📈 |
| **Social** | Community Builder | 100 peer interactions | 250 XP | 🤝 |
| **Social** | Mentor | Help 10 other users | 400 XP | 🎓 |
| **Speed** | Quick Learner | Level up in 7 days | 350 XP | ⚡ |
| **Dedication** | Marathon Speaker | 100 total sessions | 800 XP | 🏃 |

**Progression Achievements:**

| Milestone | Requirement | Reward | Badge |
|-----------|-------------|--------|-------|
| **Bronze Medal** | Reach Level 2 | 200 XP | 🥉 |
| **Silver Medal** | Reach Level 4 | 500 XP | 🥈 |
| **Gold Medal** | Reach Level 6 | 1000 XP | 🥇 |
| **Platinum Medal** | Reach Level 7 | 2000 XP | 🏅 |
| **Century Club** | 100 sessions completed | 1500 XP | 💯 |
| **Perfectionist** | 10 perfect scores | 1200 XP | ✨ |
| **Social Butterfly** | 50 community interactions | 400 XP | 🦋 |
| **Early Bird** | 7 AM practice sessions | 150 XP | 🌅 |
| **Night Owl** | 10 PM+ practice sessions | 150 XP | 🦉 |

### Leaderboard System

#### Global Leaderboards
- **Overall Ranking**: Based on total XP
- **Weekly Champions**: Top performers this week
- **Monthly MVPs**: Best monthly performers
- **Category Leaders**: Top in specific metrics

#### Social Leaderboards
- **Friends Ranking**: Compare with connections
- **Team Leaderboards**: Group-based competitions
- **Class/Workplace**: Organization-specific rankings
- **Challenge Winners**: Top performers in specific challenges

#### Ranking Tiers

| Tier | Requirement | Benefits | Badge |
|------|-------------|----------|-------|
| **Rookie** | < 1,000 XP | Basic ranking | 🆕 |
| **Contender** | 1,000-5,000 XP | Weekly highlights | 🥊 |
| **Challenger** | 5,001-15,000 XP | Monthly recognition | ⚔️ |
| **Elite** | 15,001-35,000 XP | Featured profile | 🏆 |
| **Legend** | 35,001+ XP | VIP status | 👑 |

### Streak System

**Daily Streaks:**
- **Bronze Streak**: 3 consecutive days (50 XP)
- **Silver Streak**: 7 consecutive days (200 XP)
- **Gold Streak**: 14 consecutive days (500 XP)
- **Platinum Streak**: 30 consecutive days (1500 XP)
- **Diamond Streak**: 100 consecutive days (5000 XP)

**Weekly Challenges:**
- Complete 3 sessions per week for bonus XP
- Maintain streak for multiplier bonuses
- Special rewards for perfect weeks

### Reward System

#### Virtual Rewards
- **Badges**: Collectible achievements
- **Titles**: Special status indicators
- **Themes**: Custom UI themes
- **Avatars**: Profile customization options

#### Practical Rewards
- **Extended Features**: Unlock premium tools
- **Priority Processing**: Faster analysis times
- **Storage Boost**: Increased upload limits
- **Export Options**: Advanced reporting capabilities

### Progression Analytics

**User Insights:**
- **Improvement Rate**: % increase over time
- **Consistency Score**: Regular practice patterns
- **Peak Performance**: Best performing categories
- **Growth Areas**: Skills needing attention
- **Engagement Metrics**: Platform usage patterns

**Comparison Tools:**
- **Peer Benchmarking**: Compare with similar users
- **Industry Standards**: Professional speaking benchmarks
- **Historical Trends**: Personal progress tracking
- **Goal Tracking**: Progress toward specific objectives

### Community Features

**Social Elements:**
- **Friend System**: Connect with other users
- **Mentorship Program**: Experienced users help beginners
- **Group Challenges**: Collaborative speaking exercises
- **Community Forums**: Discussion and support
- **Feedback Exchange**: Peer review system

**Competitive Elements:**
- **Tournaments**: Time-limited competitions
- **Team Challenges**: Group-based objectives
- **Leaderboard Battles**: Direct ranking competitions
- **Achievement Hunts**: Community-wide goal setting

This comprehensive gamification system transforms speech practice from a chore into an engaging journey of continuous improvement, with clear milestones, meaningful rewards, and social elements that foster community and motivation.

## 🤝 Contributing Guidelines

We love contributions! This document provides guidelines for contributing to VAANIX.

### Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment:
- Be welcoming and patient
- Be considerate and respectful
- Focus on what is best for the community
- Gracefully accept constructive criticism
- Show empathy towards other community members

### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/vaanix.git
   cd vaanix
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

#### Branch Naming Convention
```
feature/add-user-authentication
bugfix/fix-login-error
hotfix/critical-security-patch
docs/update-api-documentation
chore/update-dependencies
```

#### Commit Message Guidelines

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT refresh token functionality

Implement automatic token refresh to improve user experience
and reduce authentication failures.

Closes #123
```

```
fix(api): resolve video upload timeout issue

Increase timeout limit from 30s to 120s for large video files
and add progress tracking during upload.

Fixes #456
```

### Code Standards

#### Frontend (TypeScript/React)

**ESLint Configuration:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": "warn"
  }
}
```

**Component Structure:**
```typescript
// components/FeatureComponent.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FeatureComponentProps {
  title: string;
  onAction: () => void;
}

export const FeatureComponent = ({ 
  title, 
  onAction 
}: FeatureComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div 
      className="component-wrapper"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <h2>{title}</h2>
      <button 
        onClick={handleClick}
        disabled={isLoading}
        className="action-button"
      >
        {isLoading ? 'Processing...' : 'Action'}
      </button>
    </motion.div>
  );
};
```

#### Backend (Python/FastAPI)

**Code Style:**
```python
# app/api/example.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/example", tags=["example"])

@router.get("/items", response_model=List[dict])
async def get_items(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of items for authenticated user."""
    try:
        items = await fetch_user_items(current_user.id, skip, limit)
        return items
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch items: {str(e)}"
        )

async def fetch_user_items(user_id: str, skip: int, limit: int) -> List[dict]:
    """Fetch items from database with proper error handling."""
    # Implementation here
    pass
```

### Testing Requirements

#### Frontend Testing

```typescript
// components/__tests__/FeatureComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureComponent } from '../FeatureComponent';

describe('FeatureComponent', () => {
  it('renders title correctly', () => {
    render(<FeatureComponent title="Test Title" onAction={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', async () => {
    const mockAction = jest.fn();
    render(<FeatureComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during action', async () => {
    const mockAction = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<FeatureComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});
```

#### Backend Testing

```python
# app/api/test_example.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    # Mock authentication
    return {"Authorization": "Bearer test-token"}

def test_get_items_success(auth_headers):
    response = client.get("/api/example/items", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_items_unauthorized():
    response = client.get("/api/example/items")
    assert response.status_code == 401

def test_get_items_pagination(auth_headers):
    response = client.get("/api/example/items?skip=10&limit=5", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 5
```

### Pull Request Process

1. **Create Pull Request**
   - Use descriptive title
   - Fill out PR template completely
   - Link related issues
   - Add screenshots for UI changes

2. **Code Review**
   - Wait for at least one approval
   - Address all review comments
   - Ensure all tests pass
   - Update documentation if needed

3. **Merge Requirements**
   - All CI checks must pass
   - Code coverage maintained at 80%+
   - Documentation updated
   - Changelog entry added

### Documentation Updates

#### When to Update Documentation
- New features or APIs
- Breaking changes
- Configuration changes
- Security updates

#### Documentation Structure
```
docs/
├── api/                    # API documentation
│   ├── endpoints.md
│   └── authentication.md
├── guides/                # User guides
│   ├── getting-started.md
│   └── best-practices.md
├── development/          # Developer documentation
│   ├── architecture.md
│   └── contributing.md
└── CHANGELOG.md
```

### Reporting Issues

#### Issue Templates

**Bug Report:**
```
## Description
[Concise description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Environment
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 110]
- Version: [e.g., 2.0.0]

## Screenshots
[If applicable]

## Additional Context
[Any additional information]
```

**Feature Request:**
```
## Feature Description
[Clear description of the feature]

## Problem Statement
[What problem does this solve?]

## Proposed Solution
[How should it work?]

## Alternatives Considered
[Other approaches considered]

## Additional Context
[Any additional information]
```

### Community Resources

- **Discussions**: [GitHub Discussions](https://github.com/yourusername/vaanix/discussions)
- **Issues**: [GitHub Issues](https://github.com/yourusername/vaanix/issues)
- **Documentation**: [Project Wiki](https://github.com/yourusername/vaanix/wiki)
- **Chat**: [Discord/Slack community]

### Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Featured in release notes
- Given appropriate badges/reputation
- Acknowledged in documentation

## 🛡️ Security Policy

### Reporting Security Issues

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them through our security channels:

- **Email**: security@vaanix.com
- **Security Form**: [Security Report Form](https://vaanix.com/security)
- **PGP Key**: [PGP Public Key](https://vaanix.com/security/pgp-key.txt)

### Security Response Process

1. **Initial Response** (24 hours)
   - Acknowledge receipt of report
   - Assign CVE number if applicable
   - Begin investigation

2. **Assessment** (3-5 days)
   - Validate the vulnerability
   - Determine impact and severity
   - Plan remediation strategy

3. **Remediation** (7-30 days)
   - Develop and test fixes
   - Coordinate disclosure timeline
   - Prepare security advisory

4. **Disclosure** (Coordinated)
   - Release patched versions
   - Publish security advisory
   - Notify affected users

### Security Best Practices

#### Authentication Security
- **JWT Implementation**: Secure token handling with proper expiration
- **Password Security**: bcrypt hashing with appropriate salt rounds
- **Rate Limiting**: Prevent brute force attacks on auth endpoints
- **Session Management**: Proper session invalidation and rotation

#### Data Protection
- **Encryption**: AES-256 for sensitive data at rest
- **Transmission**: TLS 1.3 for all network communications
- **PII Handling**: Minimal data collection and retention policies
- **Data Validation**: Strict input validation and sanitization

#### Infrastructure Security
- **Container Security**: Regular vulnerability scanning
- **Network Security**: Firewall rules and network segmentation
- **Access Control**: Principle of least privilege
- **Logging**: Comprehensive audit trails for security events

#### Third-Party Dependencies
- **Dependency Scanning**: Automated security scanning in CI/CD
- **Regular Updates**: Prompt updates for security patches
- **Vulnerability Monitoring**: Continuous monitoring for new threats
- **Supply Chain Security**: Verify package integrity and provenance

### Security Headers

```python
# Backend Security Headers
{
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

### Compliance

- **GDPR**: Data protection and privacy compliance
- **CCPA**: California consumer privacy requirements
- **SOC 2**: Security and availability standards
- **ISO 27001**: Information security management

## 📊 Performance & Monitoring

### Performance Metrics

#### Frontend Performance
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

- **Bundle Optimization**:
  - Total bundle size: < 2MB
  - Initial load: < 500KB
  - Code splitting implementation
  - Dynamic imports for lazy loading

#### Backend Performance
- **API Response Times**:
  - 95th percentile: < 500ms
  - Average response: < 200ms
  - Error rate: < 0.1%

- **Database Performance**:
  - Query response: < 100ms
  - Connection pooling: 20-50 connections
  - Index optimization for frequent queries

### Monitoring Stack

#### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Custom metrics collection
- **User Experience**: Real user monitoring (RUM)
- **Business Metrics**: Custom KPI tracking

#### Infrastructure Monitoring
- **Server Health**: CPU, memory, disk usage
- **Network**: Bandwidth, latency, uptime
- **Database**: Connection pool, query performance
- **Queue**: Celery worker performance, task backlog

#### Log Management
```python
# Structured Logging Example
import logging
import structlog

logger = structlog.get_logger()

# Log an event with structured data
logger.info(
    "video_analysis_started",
    user_id="user_123",
    video_id="vid_456",
    file_size=1024000,
    duration=180
)
```

### Alerting System

#### Critical Alerts
- **System Downtime**: > 5 minutes
- **Error Rate**: > 5% in 5 minutes
- **Response Time**: > 1 second average
- **Database Connections**: Pool exhaustion
- **Queue Backlog**: > 1000 pending tasks

#### Warning Alerts
- **CPU Usage**: > 80% for 15 minutes
- **Memory Usage**: > 85% for 10 minutes
- **Disk Space**: < 15% remaining
- **User Authentication**: Unusual spike in failures

## 📱 Deployment & Operations

### Deployment Strategy

#### Continuous Integration
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11]
        
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install pytest pytest-cov
    
    - name: Run tests
      run: |
        cd backend
        pytest --cov=app --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

#### Production Deployment
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend-next
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
      - NEXT_PUBLIC_WS_URL=${WS_URL}
    
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=${MONGODB_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET_KEY=${JWT_SECRET}
    depends_on:
      - mongodb
      - redis
    
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    environment:
      - REDIS_URL=${REDIS_URL}
      - MONGODB_URL=${MONGODB_URL}
    depends_on:
      - redis
      - mongodb
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

volumes:
  redis_data:
  mongodb_data:
```

### Environment Management

#### Environment Configuration
```bash
# Development (.env.local)
DEBUG=True
LOG_LEVEL=DEBUG
MONGODB_URL=mongodb://localhost:27017/dev
REDIS_URL=redis://localhost:6379/0

# Staging (.env.staging)
DEBUG=False
LOG_LEVEL=INFO
MONGODB_URL=mongodb://mongo-staging:27017/staging
REDIS_URL=redis://redis-staging:6379/0

# Production (.env.production)
DEBUG=False
LOG_LEVEL=WARNING
MONGODB_URL=mongodb://user:pass@mongo-cluster:27017/prod
REDIS_URL=redis://user:pass@redis-cluster:6379/0
```

### Backup & Recovery

#### Database Backup Strategy
```bash
#!/bin/bash
# backup.sh

date=$(date +%Y%m%d_%H%M%S)
backup_dir="/backups/mongodb/$date"

# Create backup directory
mkdir -p $backup_dir

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/production" \
  --out=$backup_dir

gzip -r $backup_dir

# Cleanup old backups (keep 30 days)
find /backups/mongodb -name "*.tar.gz" -mtime +30 -delete

# Copy to cloud storage
gsutil -m cp -r $backup_dir gs://your-backup-bucket/mongodb/
```

#### Disaster Recovery Plan
- **RTO**: Recovery Time Objective - 4 hours
- **RPO**: Recovery Point Objective - 1 hour
- **Backup Frequency**: Every 1 hour
- **Verification**: Daily backup validation
- **Retension**: 90 days rolling backups

## 📋 Changelog Format

### Version Format
Follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

### Changelog Structure
```
# Changelog

## [2.1.0] - 2024-01-15

### Added
- New challenge system with gamification
- Real-time metrics dashboard
- Social features and leaderboards
- Mobile-responsive design improvements

### Changed
- Improved video processing pipeline
- Enhanced authentication security
- Updated UI/UX design system
- Optimized database queries

### Fixed
- Video upload timeout issues
- Memory leaks in analysis engine
- Authentication token refresh bugs
- Cross-browser compatibility issues

### Security
- Updated dependencies to patch vulnerabilities
- Implemented rate limiting for API endpoints
- Added input validation for all user data
- Enhanced JWT token security

## [2.0.1] - 2024-01-08

### Fixed
- Critical bug in facial analysis processing
- Memory allocation issues in worker processes
- Database connection pool exhaustion

## [2.0.0] - 2024-01-01

### Added
- Complete rewrite with Next.js 13
- Real-time WebSocket communication
- Advanced AI analysis capabilities
- Comprehensive gamification system

### Breaking Changes
- New API endpoint structure
- Updated database schema
- Modified authentication flow
```

## 🆘 Support & Community

### Getting Help

#### Documentation
- [User Guide](https://docs.vaanix.com/guide)
- [API Documentation](https://docs.vaanix.com/api)
- [Developer Docs](https://docs.vaanix.com/development)
- [FAQ](https://docs.vaanix.com/faq)

#### Community Support
- **GitHub Discussions**: [Community Forum](https://github.com/yourusername/vaanix/discussions)
- **Stack Overflow**: Tag questions with `vaanix`
- **Discord**: [Community Chat](https://discord.gg/vaanix)
- **Twitter**: [@vaanixplatform](https://twitter.com/vaanixplatform)

#### Professional Support
- **Email**: support@vaanix.com
- **Enterprise**: enterprise@vaanix.com
- **SLA**: 24-hour response for paid plans
- **Consulting**: Available for custom implementations

### Issue Reporting

#### Before Creating an Issue
1. Check existing issues and documentation
2. Try the latest version
3. Create a minimal reproduction
4. Include environment details

#### Issue Templates
Available in `.github/ISSUE_TEMPLATE/`:
- Bug Report
- Feature Request
- Documentation Issue
- Security Report
- Question/Support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### License Summary

**You can:**
- ✅ Use for personal projects
- ✅ Use for commercial projects
- ✅ Modify the code
- ✅ Distribute your modifications

**You must:**
- 📝 Include original copyright notice
- 📝 Include license text in distributions

**You cannot:**
- ❌ Hold the authors liable
- ❌ Use trademarks without permission

For commercial licensing options, contact licensing@vaanix.com

## 🙏 Acknowledgments

### Technology Partners
- **OpenRouter** for LLM services and API access
- **MediaPipe** for advanced computer vision capabilities
- **OpenCV** for robust image processing
- **Whisper** for state-of-the-art speech recognition
- **Next.js** for modern React framework
- **FastAPI** for high-performance Python backend

### Open Source Projects
- **Framer Motion** for smooth animations
- **Shadcn/ui** for accessible UI components
- **Tailwind CSS** for utility-first styling
- **Celery** for distributed task processing
- **Redis** for caching and queuing
- **MongoDB** for flexible data storage

### Contributors
Thanks to all the amazing people who have contributed to VAANIX:

[![Contributors](https://contrib.rocks/image?repo=yourusername/vaanix)](https://github.com/yourusername/vaanix/graphs/contributors)

### Research & Inspiration
- Public speaking research methodologies
- Educational psychology principles
- Gamification best practices
- User experience design patterns
- Accessibility standards and guidelines

## 🚀 Roadmap

### Q1 2024
- [ ] Mobile application development
- [ ] Advanced analytics dashboard
- [ ] Integration with video conferencing platforms
- [ ] Multi-language support (Spanish, French, German)

### Q2 2024
- [ ] AI-powered personalized coaching
- [ ] Virtual reality presentation practice
- [ ] Advanced challenge system
- [ ] Integration with professional speaking platforms

### Q3 2024
- [ ] Voice cloning for practice scenarios
- [ ] Team/corporate training features
- [ ] Advanced progress visualization
- [ ] API marketplace for third-party integrations

### Q4 2024
- [ ] Enterprise-grade security features
- [ ] Advanced collaboration tools
- [ ] Certification program integration
- [ ] Global community features

### Long-term Vision
- [ ] AI mentorship with personality matching
- [ ] Cross-platform AR presentation tools
- [ ] Professional speaking career platform
- [ ] Global speaking community network

---

<p align="center">
  <strong>Built with ❤️ for better communication</strong>
  <br/>
  <strong>VAANIX - Transform Your Speaking Journey</strong>
</p>

<p align="center">
  <a href="https://vaanix.com">Website</a> •
  <a href="https://docs.vaanix.com">Documentation</a> •
  <a href="https://github.com/yourusername/vaanix/issues">Issues</a> •
  <a href="https://github.com/yourusername/vaanix/discussions">Community</a>
</p>