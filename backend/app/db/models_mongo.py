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
