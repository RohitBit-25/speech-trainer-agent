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
