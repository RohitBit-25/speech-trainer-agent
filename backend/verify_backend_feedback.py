import asyncio
import websockets
import json
import time

async def test_websocket():
    uri = "ws://localhost:8000/ws/realtime-analysis/test-session-123"
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket Connection Successful!")
            
            # Send initial message (simulating audio/video data)
            msg = {
                "type": "audio_data",
                "data": "simulated_audio_base64_chunk",
                "timestamp": time.time()
            }
            await websocket.send(json.dumps(msg))
            print("Sent test message")
            
            # Wait for response (feedback)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                print(f"Received: {data}")
                
                if "feedback" in data:
                    print("✅ Received Feedback Structure")
                if "metrics" in data:
                    print(f"✅ Received Metrics: {data['metrics']}")
                    
            except asyncio.TimeoutError:
                print("⚠️ No immediate response (might be waiting for more data)")
            
            print("✅ Test Complete - Closing Connection")
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
