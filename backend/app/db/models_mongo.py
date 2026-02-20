from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

# Custom ObjectId type for Pydantic
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# ============= USER MODELS =============

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


# ============= ANALYSIS RESULT MODELS =============

class AnalysisResultBase(BaseModel):
    task_id: str
    user_id: Optional[str] = None
    video_filename: str
    status: str = "PENDING"

class AnalysisResultCreate(AnalysisResultBase):
    pass

class AnalysisResultInDB(AnalysisResultBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # Analysis data
    facial_analysis: Optional[Dict[str, Any]] = None
    voice_analysis: Optional[Dict[str, Any]] = None
    content_analysis: Optional[Dict[str, Any]] = None
    feedback_analysis: Optional[Dict[str, Any]] = None
    
    # Summary
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    total_score: Optional[float] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ============= REALTIME SESSION MODELS =============

class RealtimeSessionBase(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    mode: str = "practice"
    difficulty: str = "intermediate"

class RealtimeSessionCreate(RealtimeSessionBase):
    pass

class RealtimeSessionInDB(RealtimeSessionBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    
    # Stats
    average_score: Optional[float] = None
    max_combo: Optional[int] = None
    total_xp_earned: Optional[int] = None
    filler_words_count: Optional[int] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ============= REALTIME METRICS MODELS =============

class RealtimeMetricsBase(BaseModel):
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Scores
    facial_score: float = 0.0
    voice_score: float = 0.0
    content_score: float = 0.0
    total_score: float = 0.0
    
    # Combo
    combo_count: int = 0
    combo_multiplier: float = 1.0
    
    # Detailed metrics
    eye_contact_score: float = 0.0
    smile_score: float = 0.0
    engagement_score: float = 0.0
    pitch_hz: float = 0.0
    volume_db: float = 0.0
    speech_rate_wpm: float = 0.0
    
    # Flags
    filler_word_detected: Optional[str] = None
    speaking_too_fast: bool = False
    speaking_too_slow: bool = False

class RealtimeMetricsInDB(RealtimeMetricsBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ============= REALTIME ACHIEVEMENT MODELS =============

class RealtimeAchievementBase(BaseModel):
    session_id: str
    achievement_type: str
    achievement_name: str
    achievement_description: str
    xp_earned: int = 0

class RealtimeAchievementInDB(RealtimeAchievementBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    unlocked_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ============= DIFFICULTY CONFIG MODELS =============

class DifficultyConfig(BaseModel):
    level: str  # "beginner", "intermediate", "expert"
    target_scores: Dict[str, int]  # Minimum scores required
    time_limit: Optional[int] = None  # Seconds (None = unlimited)
    filler_word_tolerance: int  # Max allowed filler words
    pace_range: tuple[int, int]  # Min/max WPM
    multiplier_base: float  # Score multiplier
    xp_multiplier: float  # XP multiplier
    unlock_level: int  # User level required to unlock


# ============= CHALLENGE MODELS =============

class ChallengeBase(BaseModel):
    challenge_id: str
    type: str  # "daily", "weekly", "achievement"
    title: str
    description: str
    difficulty: str = "intermediate"
    
class ChallengeRequirements(BaseModel):
    min_score: Optional[float] = None
    min_duration: Optional[int] = None  # seconds
    max_filler_words: Optional[int] = None
    min_sessions: Optional[int] = None
    perfect_categories: Optional[List[str]] = None  # ["facial", "voice", "content"]
    specific_metrics: Optional[Dict[str, Any]] = None
    
    # Micro-challenge specific fields for speech skill improvement
    min_eye_contact_percent: Optional[float] = None  # 0-100
    target_wpm_min: Optional[int] = None  # Minimum words per minute
    target_wpm_max: Optional[int] = None  # Maximum words per minute
    min_facial_confidence: Optional[float] = None  # 0-100
    min_content_clarity: Optional[float] = None  # 0-100
    volume_min_db: Optional[float] = None  # Minimum volume in dB
    volume_max_db: Optional[float] = None  # Maximum volume in dB
    min_engagement_score: Optional[float] = None  # 0-100
    consecutive_good_sessions: Optional[int] = None  # Streak requirement
    target_session_count: Optional[int] = None  # For "complete N sessions" type
    skill_category: Optional[str] = None  # "body_language", "voice_control", "content_clarity", "presence"

class ChallengeRewards(BaseModel):
    xp: int
    badge_id: Optional[str] = None
    title: Optional[str] = None

class ChallengeInDB(ChallengeBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    requirements: ChallengeRequirements
    rewards: ChallengeRewards
    expires_at: Optional[datetime] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ============= USER CHALLENGE MODELS =============

class UserChallengeBase(BaseModel):
    user_id: str
    challenge_id: str
    
class UserChallengeInDB(UserChallengeBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    progress: float = 0.0  # 0-100
    current_value: float = 0.0  # Current metric value
    target_value: float = 0.0  # Target metric value
    completed: bool = False
    completed_at: Optional[datetime] = None
    claimed: bool = False
    claimed_at: Optional[datetime] = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ============= LEADERBOARD MODELS =============

class LeaderboardEntryBase(BaseModel):
    user_id: str
    username: str
    score: float
    difficulty: str
    session_id: str
    
class LeaderboardEntryInDB(LeaderboardEntryBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    rank: Optional[int] = None
    category: str  # "daily", "weekly", "all_time"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
