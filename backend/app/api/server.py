from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.worker import analyze_video_task
from celery.result import AsyncResult
from sqlalchemy.orm import Session
from app.db import models, database
from app.api.auth import router as auth_router
from app.api.websocket import manager, handle_websocket_message
import shutil
import os
import uuid
from datetime import datetime

# Initialize FastAPI app
app = FastAPI()

# Include authentication router
app.include_router(auth_router)

# Create tables
models.Base.metadata.create_all(bind=database.engine)

# Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # To be replaced with the frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request body model
class AnalysisRequest(BaseModel):
    video_url: str

class RealtimeSessionRequest(BaseModel):
    mode: str = "practice"  # practice, challenge, timed
    difficulty: str = "intermediate"  # beginner, intermediate, expert

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Define the entry point
@app.get("/")
async def root():
    return {"message": "Welcome to the video analysis API!"}

# Define the analysis endpoint
@app.post("/analyze")
async def analyze(video: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate file type
    allowed_types = ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"]
    if video.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}")
        
    # Validate file size (approximate, using seek/tell if needed, or reading chunks)
    # Using spooled file, we can check size if rolled over to disk or internal attribute
    # For now, let's rely on content-length header if available or limit read
    # Better: check file size after saving or check content-length header
    if video.size and video.size > 50 * 1024 * 1024: # 50MB
         raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
         
    # Create temp directory if not exists
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(video.filename)[1]
    temp_filename = f"{uuid.uuid4()}{file_extension}"
    temp_file_path = os.path.join(temp_dir, temp_filename)
    
    try:
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
            
        # Check size after save to be sure
        file_size = os.path.getsize(temp_file_path)
        if file_size > 50 * 1024 * 1024:
            os.remove(temp_file_path)
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
            
        # Get absolute path for the agent
        absolute_path = os.path.abspath(temp_file_path)
        
        # Trigger Celery task
        task = analyze_video_task.delay(absolute_path)
        
        # Create DB Record
        db_record = models.AnalysisResult(
            task_id=task.id,
            video_filename=video.filename,
            status="PENDING"
        )
        db.add(db_record)
        db.commit()
            
        return JSONResponse(content={"task_id": task.id, "status": "processing"})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{task_id}")
async def get_status(task_id: str):
    task_result = AsyncResult(task_id)
    
    if task_result.state == 'PENDING':
        return {"state": task_result.state, "status": "Pending..."}
    elif task_result.state != 'FAILURE':
        return {
            "state": task_result.state,
            "result": task_result.result if task_result.state == 'SUCCESS' else None
        }
    else:
        return {
            "state": task_result.state,
            "error": str(task_result.info)
        }

from sse_starlette.sse import EventSourceResponse
import redis
import asyncio

# Get Redis URL from env or default to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

@app.get("/stream/{task_id}")
async def stream_logs(task_id: str):
    async def event_generator():
        r = redis.from_url(REDIS_URL)
        pubsub = r.pubsub()
        pubsub.subscribe(f"task_logs:{task_id}")
        
        # Yield initial message
        yield {"data": "Connection Established..."}
        
        try:
            while True:
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    data = message['data'].decode('utf-8')
                    if data == "DONE":
                        yield {"data": "Analysis Completed."}
                        break
                    yield {"data": data}
                await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            pubsub.close()
            
    return EventSourceResponse(event_generator())

# History Endpoint
@app.get("/history")
async def get_history(db: Session = Depends(get_db)):
    results = db.query(models.AnalysisResult).order_by(models.AnalysisResult.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "task_id": r.task_id,
            "video_filename": r.video_filename,
            "status": r.status,
            "created_at": r.created_at,
            "total_score": r.total_score,
            "feedback_summary": r.feedback_analysis.get("feedback_summary") if r.feedback_analysis else None
        }
        for r in results
    ]

@app.get("/analysis/{task_id}")
async def get_analysis(task_id: str, db: Session = Depends(get_db)):
    result = db.query(models.AnalysisResult).filter(models.AnalysisResult.task_id == task_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Reconstruct the full response format expected by frontend
    # Note: The stored JSON might need parsing if it was stored as string, but here it is defined as JSON type in older steps. 
    # Let's assume it's dict.
    
    return {
        "facial": result.facial_analysis,
        "voice": result.voice_analysis,
        "content": result.content_analysis,
        "feedback": result.feedback_analysis,
        "strengths": result.strengths,
        "weaknesses": result.weaknesses,
        "suggestions": result.suggestions,
        "created_at": result.created_at
    }


# ============= REAL-TIME ANALYSIS ENDPOINTS =============

@app.post("/realtime/start-session")
async def start_realtime_session(request: RealtimeSessionRequest, db: Session = Depends(get_db)):
    """Start a new real-time practice session"""
    session_id = str(uuid.uuid4())
    
    # Create session record
    session = models.RealtimeSession(
        session_id=session_id,
        mode=request.mode,
        difficulty=request.difficulty
    )
    db.add(session)
    db.commit()
    
    return {
        "session_id": session_id,
        "mode": request.mode,
        "difficulty": request.difficulty,
        "started_at": session.started_at
    }


@app.post("/realtime/end-session/{session_id}")
async def end_realtime_session(session_id: str, db: Session = Depends(get_db)):
    """End a real-time practice session and calculate final stats"""
    session = db.query(models.RealtimeSession).filter(
        models.RealtimeSession.session_id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update session end time
    session.ended_at = datetime.utcnow()
    session.duration_seconds = int((session.ended_at - session.started_at).total_seconds())
    
    # Calculate stats from metrics
    metrics = db.query(models.RealtimeMetrics).filter(
        models.RealtimeMetrics.session_id == session_id
    ).all()
    
    if metrics:
        session.average_score = sum(m.total_score for m in metrics) / len(metrics)
        session.max_combo = max(m.combo_count for m in metrics)
    
    # Calculate total XP from achievements
    achievements = db.query(models.RealtimeAchievement).filter(
        models.RealtimeAchievement.session_id == session_id
    ).all()
    
    session.total_xp_earned = sum(a.xp_earned for a in achievements)
    
    db.commit()
    
    return {
        "session_id": session_id,
        "duration_seconds": session.duration_seconds,
        "average_score": session.average_score,
        "max_combo": session.max_combo,
        "total_xp_earned": session.total_xp_earned,
        "achievements_count": len(achievements)
    }


@app.get("/realtime/session/{session_id}/stats")
async def get_session_stats(session_id: str, db: Session = Depends(get_db)):
    """Get detailed statistics for a session"""
    session = db.query(models.RealtimeSession).filter(
        models.RealtimeSession.session_id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get achievements
    achievements = db.query(models.RealtimeAchievement).filter(
        models.RealtimeAchievement.session_id == session_id
    ).all()
    
    return {
        "session_id": session.session_id,
        "mode": session.mode,
        "difficulty": session.difficulty,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
        "duration_seconds": session.duration_seconds,
        "average_score": session.average_score,
        "max_combo": session.max_combo,
        "total_xp_earned": session.total_xp_earned,
        "filler_words_count": session.filler_words_count,
        "achievements": [
            {
                "type": a.achievement_type,
                "name": a.achievement_name,
                "description": a.achievement_description,
                "xp_earned": a.xp_earned,
                "unlocked_at": a.unlocked_at
            }
            for a in achievements
        ]
    }


@app.websocket("/ws/realtime-analysis/{session_id}")
async def realtime_analysis_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time video/audio analysis"""
    await manager.connect(session_id, websocket)
    
    # Get database session
    db = next(get_db())
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Process message and get response
            response = await handle_websocket_message(session_id, data, db)
            
            # Send response back to client
            await manager.send_message(session_id, response)
            
    except WebSocketDisconnect:
        manager.disconnect(session_id)
        db.close()
    except Exception as e:
        await manager.send_message(session_id, {"error": str(e)})
        manager.disconnect(session_id)
        db.close()
