from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.worker import analyze_video_task
from celery.result import AsyncResult
import shutil
import os
import uuid

# Initialize FastAPI app
app = FastAPI()

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

# Define the entry point
@app.get("/")
async def root():
    return {"message": "Welcome to the video analysis API!"}

# Define the analysis endpoint
@app.post("/analyze")
async def analyze(video: UploadFile = File(...)):
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
            
        # Get absolute path for the agent
        absolute_path = os.path.abspath(temp_file_path)
        
        # Trigger Celery task
        task = analyze_video_task.delay(absolute_path)
            
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
