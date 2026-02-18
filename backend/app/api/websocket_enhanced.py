"""
Enhanced WebSocket Implementation for Real-time AI Coach
Drop-in replacement for WebSocket.py with full AI/ML integration
"""

import json
import uuid
import asyncio
import base64
import numpy as np
import cv2
from datetime import datetime
from typing import Dict, Optional

# Add this import to integrate with new AI coach system
from app.core.ai_coach_session import AICoachSession


class EnhancedConnectionManager:
    """
    Manages WebSocket connections with integrated AI coaching
    """
    
    def __init__(self):
        self.active_connections: Dict[str, any] = {}
        self.active_sessions: Dict[str, AICoachSession] = {}
    
    async def connect(self, session_id: str, websocket, user_id: str, difficulty: str = "intermediate"):
        """Accept connection and initialize AI coach session"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        
        # Initialize AI coach session
        self.active_sessions[session_id] = AICoachSession(
            session_id=session_id,
            user_id=user_id,
            difficulty=difficulty
        )
        
        print(f"✅ Client connected: {session_id}")
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "session_id": session_id,
            "message": f"Connected to AI Coach (difficulty: {difficulty})",
            "timestamp": datetime.now().isoformat()
        })
    
    def disconnect(self, session_id: str):
        """Remove connection and cleanup session"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        
        if session_id in self.active_sessions:
            self.active_sessions[session_id].reset()
            del self.active_sessions[session_id]
        
        print(f"❌ Client disconnected: {session_id}")
    
    async def broadcast_to_session(self, session_id: str, message: dict):
        """Send message to specific session"""
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_json(message)
            except Exception as e:
                print(f"Error sending message: {e}")
    
    async def process_video_frame(self, session_id: str, message: dict) -> Dict:
        """Process incoming video frame"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        try:
            frame_data = message.get("frame_data")
            if not frame_data:
                return {"error": "No frame data"}
            
            session = self.active_sessions[session_id]
            result = await session.process_video_frame(frame_data)
            
            return result
        except Exception as e:
            print(f"Error processing video: {e}")
            return {"error": str(e)}
    
    async def process_audio_chunk(self, session_id: str, message: dict) -> Dict:
        """Process incoming audio chunk"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        try:
            audio_data = message.get("audio_data")
            transcript = message.get("transcript", "")
            
            if not audio_data:
                return {"error": "No audio data"}
            
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            session = self.active_sessions[session_id]
            result = await session.process_audio_chunk(audio_bytes, transcript)
            
            return result
        except Exception as e:
            print(f"Error processing audio: {e}")
            return {"error": str(e)}
    
    async def generate_feedback(self, session_id: str) -> Dict:
        """Generate AI coaching feedback"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        try:
            session = self.active_sessions[session_id]
            feedback = await session.generate_real_time_feedback()
            
            return feedback
        except Exception as e:
            print(f"Error generating feedback: {e}")
            return {"error": str(e), "feedback": "Keep practicing!"}
    
    async def calculate_score(self, session_id: str) -> Dict:
        """Calculate performance score"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        try:
            session = self.active_sessions[session_id]
            score = await session.calculate_frame_score()
            
            return score
        except Exception as e:
            print(f"Error calculating score: {e}")
            return {"error": str(e)}
    
    def get_session_summary(self, session_id: str) -> Dict:
        """Get session summary"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        try:
            session = self.active_sessions[session_id]
            summary = session.get_session_summary()
            
            return summary
        except Exception as e:
            print(f"Error getting summary: {e}")
            return {"error": str(e)}


# Global connection manager instance
connection_manager = EnhancedConnectionManager()


# Example WebSocket endpoint using FastAPI
# Add this to your FastAPI app (e.g., in app/api/websocket.py or app/api/server.py)

"""
from fastapi import WebSocket, WebSocketDisconnect
from app.api.websocket import connection_manager

@app.websocket("/ws/practice/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    # Extract query parameters
    user_id = websocket.query_params.get("user_id", "anonymous")
    difficulty = websocket.query_params.get("difficulty", "intermediate")
    
    # Connect client
    await connection_manager.connect(session_id, websocket, user_id, difficulty)
    
    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            # Route different message types
            if message_type == "video_frame":
                # Process video frame
                result = await connection_manager.process_video_frame(session_id, data)
                
                # Calculate score if we have both facial and voice data
                score_result = await connection_manager.calculate_score(session_id)
                
                # Periodically get feedback from AI coach
                feedback_result = await connection_manager.generate_feedback(session_id)
                
                # Send comprehensive response
                await connection_manager.broadcast_to_session(session_id, {
                    "type": "analysis_result",
                    "facial": result.get("facial_analysis", {}),
                    "score": score_result.get("score", {}),
                    "feedback": feedback_result.get("feedback", ""),
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "audio_chunk":
                # Process audio
                result = await connection_manager.process_audio_chunk(session_id, data)
                
                await connection_manager.broadcast_to_session(session_id, {
                    "type": "voice_analysis",
                    "voice": result.get("voice_analysis", {}),
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "get_summary":
                # Get session summary
                summary = connection_manager.get_session_summary(session_id)
                
                await connection_manager.broadcast_to_session(session_id, {
                    "type": "session_summary",
                    "summary": summary,
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "end_session":
                # End session gracefully
                summary = connection_manager.get_session_summary(session_id)
                
                await connection_manager.broadcast_to_session(session_id, {
                    "type": "session_ended",
                    "summary": summary,
                    "message": "Practice session ended. Great work!",
                    "timestamp": datetime.now().isoformat()
                })
                
                break
    
    except WebSocketDisconnect:
        connection_manager.disconnect(session_id)
        print(f"Client {session_id} disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        connection_manager.disconnect(session_id)
"""

