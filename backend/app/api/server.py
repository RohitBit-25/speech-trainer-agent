from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.worker import analyze_video_task
import logging
from celery.result import AsyncResult
from bson import ObjectId
from app.db.mongodb import (
    analysis_results_collection,
    realtime_sessions_collection,
    realtime_metrics_collection,
    realtime_achievements_collection,
    init_db
)
from app.api.auth import router as auth_router
from app.api.game import router as game_router
from app.api.websocket import manager, handle_websocket_message
import shutil
import os
import uuid
from datetime import datetime

# Initialize FastAPI app
app = FastAPI()

# Include routers
app.include_router(auth_router)
app.include_router(game_router)

# Initialize MongoDB on startup
@app.on_event("startup")
async def startup_db_client():
    await init_db()

# Configure CORS with restricted origins for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Add production domain here when deploying
        # "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Define the request body model
class AnalysisRequest(BaseModel):
    video_url: str

class RealtimeSessionRequest(BaseModel):
    mode: str = "practice"  # practice, challenge, timed
    difficulty: str = "intermediate"  # beginner, intermediate, expert



# Define the entry point
@app.get("/")
async def root():
    return {"message": "Welcome to the video analysis API!"}

# Define the analysis endpoint
@app.post("/analyze")
async def analyze(video: UploadFile = File(...)):
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
        
        # Create MongoDB Record
        result_doc = {
            "task_id": task.id,
            "video_filename": video.filename,
            "status": "PENDING",
            "created_at": datetime.utcnow()
        }
        await analysis_results_collection.insert_one(result_doc)
            
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
async def get_history():
    results = await analysis_results_collection.find().sort("created_at", -1).to_list(100)
    return [
        {
            "id": str(r["_id"]),
            "task_id": r["task_id"],
            "video_filename": r["video_filename"],
            "status": r["status"],
            "created_at": r["created_at"],
            "total_score": r.get("total_score"),
            "feedback_summary": r.get("feedback_analysis", {}).get("feedback_summary") if r.get("feedback_analysis") else None
        }
        for r in results
    ]

@app.get("/analysis/{task_id}")
async def get_analysis(task_id: str):
    result = await analysis_results_collection.find_one({"task_id": task_id})
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "facial": result.get("facial_analysis"),
        "voice": result.get("voice_analysis"),
        "content": result.get("content_analysis"),
        "feedback": result.get("feedback_analysis"),
        "strengths": result.get("strengths"),
        "weaknesses": result.get("weaknesses"),
        "suggestions": result.get("suggestions"),
        "created_at": result.get("created_at")
    }


# ============= REAL-TIME ANALYSIS ENDPOINTS =============

@app.post("/realtime/start-session")
async def start_realtime_session(request: RealtimeSessionRequest):
    """Start a new real-time practice session"""
    session_id = str(uuid.uuid4())
    
    # Create session document
    session_doc = {
        "session_id": session_id,
        "mode": request.mode,
        "difficulty": request.difficulty,
        "started_at": datetime.utcnow()
    }
    await realtime_sessions_collection.insert_one(session_doc)
    
    return {
        "session_id": session_id,
        "mode": request.mode,
        "difficulty": request.difficulty,
        "started_at": session_doc["started_at"]
    }


@app.post("/realtime/end-session/{session_id}")
async def end_realtime_session(session_id: str):
    """End a real-time practice session and calculate final stats"""
    session = await realtime_sessions_collection.find_one({"session_id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate end time and duration
    ended_at = datetime.utcnow()
    duration_seconds = int((ended_at - session["started_at"]).total_seconds())
    
    # Calculate stats from metrics
    metrics = await realtime_metrics_collection.find({"session_id": session_id}).to_list(1000)
    
    average_score = None
    max_combo = None
    if metrics:
        average_score = sum(m["total_score"] for m in metrics) / len(metrics)
        max_combo = max(m["combo_count"] for m in metrics)
    
    # Calculate total XP from achievements
    achievements = await realtime_achievements_collection.find({"session_id": session_id}).to_list(100)
    total_xp_earned = sum(a["xp_earned"] for a in achievements)
    
    # Update session
    await realtime_sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": ended_at,
            "duration_seconds": duration_seconds,
            "average_score": average_score,
            "max_combo": max_combo,
            "total_xp_earned": total_xp_earned
        }}
    )
    
    return {
        "session_id": session_id,
        "duration_seconds": duration_seconds,
        "average_score": average_score,
        "max_combo": max_combo,
        "total_xp_earned": total_xp_earned,
        "achievements_count": len(achievements)
    }


@app.get("/realtime/session/{session_id}/stats")
async def get_session_stats(session_id: str):
    """Get detailed statistics for a session"""
    session = await realtime_sessions_collection.find_one({"session_id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get achievements
    achievements = await realtime_achievements_collection.find({"session_id": session_id}).to_list(100)
    
    return {
        "session_id": session["session_id"],
        "mode": session["mode"],
        "difficulty": session["difficulty"],
        "started_at": session["started_at"],
        "ended_at": session.get("ended_at"),
        "duration_seconds": session.get("duration_seconds"),
        "average_score": session.get("average_score"),
        "max_combo": session.get("max_combo"),
        "total_xp_earned": session.get("total_xp_earned"),
        "filler_words_count": session.get("filler_words_count"),
        "achievements": [
            {
                "type": a["achievement_type"],
                "name": a["achievement_name"],
                "description": a["achievement_description"],
                "xp_earned": a["xp_earned"],
                "unlocked_at": a["unlocked_at"]
            }
            for a in achievements
        ]
    }


@app.websocket("/ws/realtime-analysis/{session_id}")
async def realtime_analysis_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time video/audio analysis"""
    try:
        logging.info(f"WS Connecting session {session_id}...")
        await manager.connect(session_id, websocket)
        logging.info(f"WS Connected session {session_id}")
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_json()
                
                # Process message and get response
                response = await handle_websocket_message(session_id, data)
                
                # Send response back to client
                await manager.send_message(session_id, response)
                
        except WebSocketDisconnect:
            logging.info(f"WS Disconnect session {session_id}")
            manager.disconnect(session_id)
        except Exception as e:
            logging.error(f"WS Error session {session_id}: {e}")
            import traceback
            traceback.print_exc()
            await manager.send_message(session_id, {"error": str(e)})
            manager.disconnect(session_id)
            
    except Exception as e:
        logging.error(f"WS Connection Setup Error for {session_id}: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.close()
        except:
            pass
