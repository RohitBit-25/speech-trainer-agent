import os
from celery import Celery
from app.core.config import settings

# Get Redis URL from env or default to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "speech_trainer_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Use 'solo' pool to avoid SIGSEGV crashes from forking processes
    # that use MediaPipe/OpenCV (known macOS fork-safety issue)
    worker_pool="solo",
)

@celery_app.task(bind=True, name="analyze_video_task")
def analyze_video_task(self, file_path: str):
    """
    Celery task to run the coordinator agent analysis asynchronously.
    
    Strategy: Run real Python tools for data extraction, then pass actual
    data to the LLM for generating feedback text (not hallucinating).
    """
    import sys
    import io
    import redis
    import json
    import re
    from datetime import datetime
    from fastapi.encoders import jsonable_encoder

    # Redis connection for publishing logs
    r = redis.from_url(REDIS_URL)

    class RedisStreamer(io.StringIO):
        def __init__(self, task_id):
            super().__init__()
            self.task_id = task_id

        def write(self, s):
            if s and s.strip():
                r.publish(f"task_logs:{self.task_id}", s)
            super().write(s)

    original_stdout = sys.stdout
    streamer = RedisStreamer(self.request.id)
    sys.stdout = streamer

    try:
        self.update_state(state='PROGRESS', meta={'status': 'Analyzing video...'})
        r.publish(f"task_logs:{self.request.id}", "Starting analysis pipeline...\n")

        # ─── STEP 1: Run Voice Analysis Tool Directly ────────────────────────────
        r.publish(f"task_logs:{self.request.id}", "Running voice analysis...\n")
        voice_data = {}
        try:
            from app.agents.tools.voice_analysis_tool import _analyze_voice_attributes_impl
            raw_voice = _analyze_voice_attributes_impl(file_path)
            
            if isinstance(raw_voice, str):
                raw_voice = json.loads(raw_voice)
            voice_data = raw_voice
            r.publish(f"task_logs:{self.request.id}", f"Voice analysis done: {list(voice_data.keys())}\n")
        except Exception as ve:
            import traceback
            err_msg = traceback.format_exc()
            r.publish(f"task_logs:{self.request.id}", f"Voice analysis error:\n{err_msg}\n")
            voice_data = {
                "transcription": f"Voice analysis error: {str(ve)}",
                "speech_rate_wpm": "0",
                "pitch_variation": "0",
                "volume_consistency": "0"
            }

        # ─── STEP 2: Run Facial Expressions Tool Directly ───────────────────────
        r.publish(f"task_logs:{self.request.id}", "Running facial expression analysis...\n")
        facial_data = {}
        try:
            from app.agents.tools.facial_expression_tool import _analyze_facial_expressions_impl
            raw_facial = _analyze_facial_expressions_impl(file_path)
            
            if isinstance(raw_facial, str):
                raw_facial = json.loads(raw_facial)
            facial_data = raw_facial
            r.publish(f"task_logs:{self.request.id}", f"Facial analysis done: {list(facial_data.keys())}\n")
        except Exception as fe:
            r.publish(f"task_logs:{self.request.id}", f"Facial analysis error: {str(fe)}\n")
            facial_data = {
                "emotion_timeline": [],
                "engagement_metrics": {"eye_contact_frequency": 0, "smile_frequency": 0}
            }

        # ─── STEP 3: Ask LLM for Content Analysis + Feedback Based on Real Data ─
        r.publish(f"task_logs:{self.request.id}", "Running LLM content analysis...\n")

        transcription = voice_data.get("transcription", "No transcription available")
        speech_rate = voice_data.get("speech_rate_wpm", "N/A")
        pitch_variation = voice_data.get("pitch_variation", "N/A")
        volume_consistency = voice_data.get("volume_consistency", "N/A")

        # Build emotion summary from timeline
        emotion_timeline = facial_data.get("emotion_timeline", [])
        emotion_counts: dict = {}
        for entry in emotion_timeline:
            emo = entry.get("emotion", "neutral")
            emotion_counts[emo] = emotion_counts.get(emo, 0) + 1
        dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "neutral"
        engagement = facial_data.get("engagement_metrics", {})
        eye_contact = engagement.get("eye_contact_frequency", 0)
        smile_freq = engagement.get("smile_frequency", 0)

        llm_prompt = f"""You are an elite public speaking coach. Analyze the following actual data from a user's speech and provide a structured JSON assessment.

### Actual Speech Data:
- Transcription: "{transcription}"
- Speech Rate: {speech_rate} WPM
- Pitch Variation: {pitch_variation}
- Volume Consistency: {volume_consistency}
- Facial Emotions Detected: {json.dumps(emotion_counts)}
- Eye Contact: {eye_contact:.2f}
- Smile Frequency: {smile_freq:.2f}

### Instructions:
1. Analyze the content based ONLY on the transcription provided.
2. If the transcription is empty or indicates an error, provide general public speaking coaching points in 'strengths', 'weaknesses', and 'suggestions' based on best practices, and mention that specific data was unavailable.
3. ALWAY provide exactly 3 items in 'strengths', 'weaknesses', and 'suggestions'.
4. Return a JSON object with the following structure:
{{
    "content_analysis_response": {{
        "structure": "Detailed assessment of the speech structure",
        "clarity": [Float 0-10],
        "persuasion": [Float 0-10],
        "summary": "Overall summary of the spoken content"
    }},
    "feedback_response": {{
        "total_score": [Float 0-100],
        "scores": {{
            "voice_score": [Float 0-100],
            "facial_score": [Float 0-100],
            "content_score": [Float 0-100]
        }},
        "interpretation": "A brief, punchy result title (e.g., 'Compelling Speaker', 'Needs Energy')",
        "feedback_summary": "Synthesized coaching feedback"
    }},
    "strengths": ["list of 3 specific strengths or general tips if data missing"],
    "weaknesses": ["list of 3 specific improvement areas or general traps to avoid"],
    "suggestions": ["list of 3 actionable coaching tips"]
}}

Return ONLY valid raw JSON."""

        # Call LLM via OpenRouter directly
        import httpx
        llm_response = {}
        try:
            llm_response_raw = httpx.post(
                settings.OPENROUTER_BASE_URL + "/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.OPENROUTER_MODEL,
                    "messages": [{"role": "user", "content": llm_prompt}],
                    "temperature": 0.1
                },
                timeout=60
            )
            llm_response_raw.raise_for_status()
            llm_json = llm_response_raw.json()
            llm_text = llm_json["choices"][0]["message"]["content"].strip()
            
            # Simple JSON extraction: find first '{' and last '}'
            start_idx = llm_text.find('{')
            end_idx = llm_text.rfind('}')
            if start_idx != -1 and end_idx != -1:
                llm_text = llm_text[start_idx:end_idx+1]
            
            llm_response = json.loads(llm_text)
            r.publish(f"task_logs:{self.request.id}", "LLM content analysis finished successfully.\n")
        except Exception as le:
            r.publish(f"task_logs:{self.request.id}", f"LLM Processing Error: {str(le)}\n")
            llm_response = {
                "content_analysis_response": {"structure": "Analysis failed", "clarity": 0, "persuasion": 0, "summary": "N/A"},
                "feedback_response": {"total_score": 0, "scores": {}, "interpretation": "Technical Error", "feedback_summary": str(le)},
                "strengths": [], "weaknesses": [], "suggestions": []
            }

        # ─── STEP 4: Build Full Result ───────────────────────────────────────────
        result = {
            "facial_expression_response": {
                "emotion_timeline": emotion_timeline,
                "engagement_metrics": engagement,
                "dominant_emotion": dominant_emotion,
                "emotion_counts": emotion_counts,
                "summary": f"Dominant emotion: {dominant_emotion}. Eye contact: {eye_contact:.0%}, Smile frequency: {smile_freq:.0%}"
            },
            "voice_analysis_response": {
                "transcription": transcription,
                "speech_rate_wpm": float(speech_rate) if str(speech_rate).replace('.','').isdigit() else 0,
                "pitch_variation": float(pitch_variation) if str(pitch_variation).replace('.','').isdigit() else 0,
                "volume_consistency": float(volume_consistency) if str(volume_consistency).replace('.','').isdigit() else 0,
            },
            "content_analysis_response": llm_response.get("content_analysis_response", {}),
            "feedback_response": llm_response.get("feedback_response", {}),
            "strengths": llm_response.get("strengths", []),
            "weaknesses": llm_response.get("weaknesses", []),
            "suggestions": llm_response.get("suggestions", []),
        }

        result = jsonable_encoder(result)

        # ─── STEP 5: Save to MongoDB ─────────────────────────────────────────────
        try:
            from app.db.mongodb import sync_analysis_results_collection
            result_doc = sync_analysis_results_collection.find_one({"task_id": self.request.id})
            if result_doc:
                update_data = {
                    "status": "COMPLETED",
                    "completed_at": datetime.utcnow(),
                    "facial_analysis": result["facial_expression_response"],
                    "voice_analysis": result["voice_analysis_response"],
                    "content_analysis": result["content_analysis_response"],
                    "feedback_analysis": result["feedback_response"],
                    "strengths": result.get("strengths"),
                    "weaknesses": result.get("weaknesses"),
                    "suggestions": result.get("suggestions"),
                    "total_score": result["feedback_response"].get("total_score", 0)
                }
                sync_analysis_results_collection.update_one(
                    {"task_id": self.request.id},
                    {"$set": update_data}
                )
            r.publish(f"task_logs:{self.request.id}", "Analysis Completed Successfully.\n")
            r.publish(f"task_logs:{self.request.id}", "DONE")
        except Exception as db_e:
            r.publish(f"task_logs:{self.request.id}", f"Database Error: {str(db_e)}\n")

        return result

    except Exception as e:
        r.publish(f"task_logs:{self.request.id}", f"Error: {str(e)}\n")
        raise e
    finally:
        sys.stdout = original_stdout
