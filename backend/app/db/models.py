from sqlalchemy import Column, Integer, String, JSON, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    analyses = relationship("AnalysisResult", back_populates="user")
    realtime_sessions = relationship("RealtimeSession", back_populates="user")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for backward compatibility
    video_filename = Column(String)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # JSON columns for the detailed analysis
    facial_analysis = Column(JSON, nullable=True)
    voice_analysis = Column(JSON, nullable=True)
    content_analysis = Column(JSON, nullable=True)
    feedback_analysis = Column(JSON, nullable=True)
    
    # Summary scores/lists
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    
    total_score = Column(Float, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="analyses")


class RealtimeSession(Base):
    """Model for tracking real-time practice sessions"""
    __tablename__ = "realtime_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Session configuration
    mode = Column(String, default="practice")  # practice, challenge, timed
    difficulty = Column(String, default="intermediate")  # beginner, intermediate, expert
    
    # Session timing
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Session stats
    max_combo = Column(Integer, default=0)
    total_xp_earned = Column(Integer, default=0)
    average_score = Column(Float, nullable=True)
    filler_words_count = Column(Integer, default=0)
    
    # Relationship
    user = relationship("User", back_populates="realtime_sessions")
    metrics = relationship("RealtimeMetrics", back_populates="session", cascade="all, delete-orphan")
    achievements = relationship("RealtimeAchievement", back_populates="session", cascade="all, delete-orphan")


class RealtimeMetrics(Base):
    """Model for storing real-time performance metrics during a session"""
    __tablename__ = "realtime_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("realtime_sessions.session_id"), nullable=False)
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Performance scores (0-100)
    facial_score = Column(Float, default=0.0)
    voice_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    
    # Game mechanics
    combo_count = Column(Integer, default=0)
    multiplier = Column(Float, default=1.0)
    total_score = Column(Integer, default=0)
    
    # Detected issues
    filler_word_detected = Column(String, nullable=True)  # The actual filler word
    looking_away = Column(Integer, default=0)  # Boolean as int
    speaking_too_fast = Column(Integer, default=0)  # Boolean as int
    
    # Relationship
    session = relationship("RealtimeSession", back_populates="metrics")


class RealtimeAchievement(Base):
    """Model for tracking achievements unlocked during real-time sessions"""
    __tablename__ = "realtime_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("realtime_sessions.session_id"), nullable=False)
    
    # Achievement details
    achievement_type = Column(String, nullable=False)  # first_combo, perfect_minute, no_fillers, etc.
    achievement_name = Column(String, nullable=False)
    achievement_description = Column(String, nullable=True)
    
    # Rewards
    xp_earned = Column(Integer, default=0)
    
    # Timestamp
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("RealtimeSession", back_populates="achievements")
