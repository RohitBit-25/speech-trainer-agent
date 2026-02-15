from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.worker import analyze_video_task
from celery.result import AsyncResult
from sqlalchemy.orm import Session
from app.db import models, database
import shutil
import os
import uuid

# Initialize FastAPI app
app = FastAPI()

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
