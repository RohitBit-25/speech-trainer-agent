from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Optional
import json
import uuid
import asyncio
import base64
import numpy as np
import cv2
from datetime import datetime

from app.db.mongodb import realtime_metrics_collection, realtime_achievements_collection
from app.agents.realtime.realtime_facial_agent import RealtimeFacialAgent
from app.agents.realtime.realtime_voice_agent import RealtimeVoiceAgent
from app.agents.realtime.realtime_feedback_agent import RealtimeFeedbackAgent


class ConnectionManager:
    """Manages WebSocket connections for real-time analysis sessions"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_agents: Dict[str, Dict] = {}
    
    async def connect(self, session_id: str, websocket: WebSocket):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        
        # Initialize agents for this session
        self.session_agents[session_id] = {
            "facial": RealtimeFacialAgent(),
            "voice": RealtimeVoiceAgent(),
            "feedback": RealtimeFeedbackAgent()
        }
    
    def disconnect(self, session_id: str):
        """Remove a WebSocket connection and cleanup agents"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        
        if session_id in self.session_agents:
            # Cleanup agents
            agents = self.session_agents[session_id]
            if "facial" in agents:
                del agents["facial"]
            if "voice" in agents:
                agents["voice"].reset()
            if "feedback" in agents:
                agents["feedback"].reset()
            
            del self.session_agents[session_id]
    
    async def send_message(self, session_id: str, message: dict):
        """Send a message to a specific session"""
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            await websocket.send_json(message)
    
    def get_agents(self, session_id: str) -> Optional[Dict]:
        """Get agents for a specific session"""
        return self.session_agents.get(session_id)


# Global connection manager
manager = ConnectionManager()





async def process_video_frame(session_id: str, frame_data: str) -> Dict:
    """
    Process a video frame and return analysis results.
    
    Args:
        session_id: Session identifier
        frame_data: Base64 encoded image data
        
    Returns:
        Analysis results dictionary
    """
    agents = manager.get_agents(session_id)
    if not agents:
        return {"error": "Session not found"}
    
    try:
        # Decode base64 image
        img_bytes = base64.b64decode(frame_data.split(',')[1] if ',' in frame_data else frame_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"error": "Invalid frame data"}
        
        # Analyze with facial agent
        facial_analysis = agents["facial"].analyze_frame(frame)
        agents["facial"].update_history(facial_analysis)
        
        return {
            "type": "facial_analysis",
            "data": facial_analysis
        }
    
    except Exception as e:
        return {"error": f"Frame processing error: {str(e)}"}


async def process_audio_chunk(session_id: str, audio_data: bytes, transcript: Optional[str] = None) -> Dict:
    """
    Process an audio chunk and return analysis results.
    
    Args:
        session_id: Session identifier
        audio_data: Raw audio bytes
        transcript: Optional transcription
        
    Returns:
        Analysis results dictionary
    """
    agents = manager.get_agents(session_id)
    if not agents:
        return {"error": "Session not found"}
    
    try:
        # Convert bytes to numpy array
        audio_array = np.frombuffer(audio_data, dtype=np.float32)
        
        # Analyze with voice agent
        voice_analysis = agents["voice"].analyze_audio_chunk(audio_array, transcript)
        
        return {
            "type": "voice_analysis",
            "data": voice_analysis
        }
    
    except Exception as e:
        return {"error": f"Audio processing error: {str(e)}"}


async def generate_feedback(session_id: str) -> Dict:
    """
    Generate real-time feedback based on latest analysis.
    
    Args:
        session_id: Session identifier
        db: Database session
        
    Returns:
        Feedback dictionary with scores, combo, and messages
    """
    agents = manager.get_agents(session_id)
    if not agents:
        return {"error": "Session not found"}
    
    try:
        # Get latest analysis from both agents
        facial_agent = agents["facial"]
        voice_agent = agents["voice"]
        feedback_agent = agents["feedback"]
        
        # Get average metrics
        facial_metrics = facial_agent.get_average_metrics()
        voice_metrics = voice_agent.get_session_stats()
        
        # Convert to format expected by feedback agent
        facial_analysis = {
            "engagement_score": facial_metrics.get("avg_engagement", 0),
            "eye_contact_score": facial_metrics.get("avg_eye_contact", 0) / 100,
            "smile_score": facial_metrics.get("avg_smile", 0) / 100
        }
        
        voice_analysis = {
            "voice_score": 70,  # Default, will be calculated based on metrics
            "pitch_variation": 10,  # Placeholder
            "volume_db": -30,  # Placeholder
            "speech_rate_wpm": voice_metrics.get("avg_speech_rate_wpm", 0),
            "filler_word_detected": None  # Will be set if detected
        }
        
        # Generate feedback
        feedback = feedback_agent.analyze_performance(facial_analysis, voice_analysis)
        
        # Store metrics in MongoDB
        metric_doc = {
            "session_id": session_id,
            "timestamp": datetime.utcnow(),
            "facial_score": feedback["facial_score"],
            "voice_score": feedback["voice_score"],
            "total_score": feedback["final_score"],
            "combo_count": feedback["combo"],
            "combo_multiplier": feedback["multiplier"],
            "engagement_score": facial_analysis["engagement_score"],
            "eye_contact_score": facial_analysis["eye_contact_score"] * 100,
            "smile_score": facial_analysis["smile_score"] * 100,
            "speech_rate_wpm": voice_analysis["speech_rate_wpm"]
        }
        await realtime_metrics_collection.insert_one(metric_doc)
        
        # Store achievements if any
        for achievement in feedback.get("new_achievements", []):
            achievement_doc = {
                "session_id": session_id,
                "achievement_type": achievement["id"],
                "achievement_name": achievement["name"],
                "achievement_description": achievement["description"],
                "xp_earned": achievement["xp"],
                "unlocked_at": datetime.utcnow()
            }
            await realtime_achievements_collection.insert_one(achievement_doc)
        
        return {
            "type": "feedback",
            "data": feedback
        }
    
    except Exception as e:
        return {"error": f"Feedback generation error: {str(e)}"}


async def handle_websocket_message(session_id: str, message: dict) -> Dict:
    """
    Handle incoming WebSocket messages and route to appropriate processor.
    
    Args:
        session_id: Session identifier
        message: Message dictionary
        db: Database session
        
    Returns:
        Response dictionary
    """
    message_type = message.get("type")
    
    if message_type == "video_frame":
        # Process video frame
        frame_data = message.get("data")
        return await process_video_frame(session_id, frame_data)
    
    elif message_type == "audio_chunk":
        # Process audio chunk
        audio_data = base64.b64decode(message.get("data"))
        transcript = message.get("transcript")
        return await process_audio_chunk(session_id, audio_data, transcript)
    
    elif message_type == "request_feedback":
        # Generate and send feedback
        return await generate_feedback(session_id)
    
    elif message_type == "ping":
        # Heartbeat
        return {"type": "pong"}
    
    else:
        return {"error": f"Unknown message type: {message_type}"}
