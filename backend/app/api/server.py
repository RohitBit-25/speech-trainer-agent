from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.agents.coordinator_agent import coordinator_agent
from agno.agent import RunResponse
from app.core.config import settings
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
            
        prompt = f"Analyze the following video: {absolute_path}"
        response: RunResponse = coordinator_agent.run(prompt)
    
        # Assuming response.content is a Pydantic model or a dictionary
        json_compatible_response = jsonable_encoder(response.content)
        return JSONResponse(content=json_compatible_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup could happen here, or we keep files for debugging
        pass
