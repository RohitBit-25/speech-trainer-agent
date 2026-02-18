import asyncio
import websockets
import json
import base64
import numpy as np
import time

async def test_websocket():
    uri = "ws://localhost:8000/ws/realtime-analysis/test-session-123"
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            
            # 1. Send start session (simulated by just connecting in this simple server)
            
            # 2. Send dummy audio data (silence) to trigger processing
            print("Sending dummy audio data...")
            # Create 1 second of silence at 16kHz
            audio_data = np.zeros(16000, dtype=np.float32).tobytes()
            b64_audio = base64.b64encode(audio_data).decode('utf-8')
            
            # Send chunks for 20 seconds to trigger the 15s AI feedback timer
            # We need to send "audio_chunk" messages
            
            start_time = time.time()
            chunks_sent = 0
            
            while time.time() - start_time < 20:
                msg = {
                    "type": "audio_chunk",
                    "data": b64_audio,
                    "transcript": "This is a test sentence to check AI feedback."
                }
                await websocket.send(json.dumps(msg))
                chunks_sent += 1
                
                # Receive response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    data = json.loads(response)
                    
                    if data.get("type") == "voice_analysis":
                        # Request feedback explicitly as the frontend does
                        await websocket.send(json.dumps({"type": "request_feedback"}))
                        
                        feedback_response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                        feedback_data = json.loads(feedback_response)
                        
                        if feedback_data.get("type") == "feedback":
                            fb = feedback_data["data"]
                            # Check for AI insight
                            ai_messages = [m for m in fb.get("feedback_messages", []) if m["type"] == "ai_insight"]
                            if ai_messages:
                                print(f"\nSUCCESS! Received AI Insight: {ai_messages[0]['message']}")
                                return
                            
                except asyncio.TimeoutError:
                    pass
                
                print(".", end="", flush=True)
                await asyncio.sleep(0.5) # Send every 500ms
            
            print("\nTimed out waiting for AI feedback.")
            
    except Exception as e:
        print(f"\nConnection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
