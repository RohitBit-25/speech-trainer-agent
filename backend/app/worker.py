import os
from celery import Celery
from app.agents.coordinator_agent import coordinator_agent
from agno.agent import RunOutput
from fastapi.encoders import jsonable_encoder

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
)

@celery_app.task(bind=True, name="analyze_video_task")
def analyze_video_task(self, file_path: str):
    """
    Celery task to run the coordinator agent analysis asynchronously.
    """
    import sys
    import io
    import redis
    import time
    
    # Redis connection for publishing logs
    r = redis.from_url(REDIS_URL)
    
    class RedisStreamer(io.StringIO):
        def __init__(self, task_id):
            super().__init__()
            self.task_id = task_id
            
        def write(self, s):
            if s and s.strip():
                # Publish log to Redis channel
                r.publish(f"task_logs:{self.task_id}", s)
            super().write(s)
            
    # Redirect stdout to capture agent output
    original_stdout = sys.stdout
    streamer = RedisStreamer(self.request.id)
    sys.stdout = streamer
    
    try:
        # Update state to processing
        self.update_state(state='PROGRESS', meta={'status': 'Analyzing video...'})
        r.publish(f"task_logs:{self.request.id}", "Initializing Coordinator Agent...\n")
        
        prompt = f"Analyze the following video: {file_path}"
        response: RunOutput = coordinator_agent.run(prompt)
        
        # Serialize the response
        result = jsonable_encoder(response.content)
        
        # Save to Database
        from app.db.database import SessionLocal
        from app.db import models
        import json
        from datetime import datetime
        
        db = SessionLocal()
        try:
            db_record = db.query(models.AnalysisResult).filter(models.AnalysisResult.task_id == self.request.id).first()
            if db_record:
                db_record.status = "COMPLETED"
                db_record.completed_at = datetime.utcnow()
                
                def parse_if_string(val):
                    if isinstance(val, str):
                        try:
                            return json.loads(val)
                        except:
                            return val
                    return val

                db_record.facial_analysis = parse_if_string(result.get('facial_expression_response'))
                db_record.voice_analysis = parse_if_string(result.get('voice_analysis_response'))
                db_record.content_analysis = parse_if_string(result.get('content_analysis_response'))
                db_record.feedback_analysis = parse_if_string(result.get('feedback_response'))
                
                db_record.strengths = result.get('strengths')
                db_record.weaknesses = result.get('weaknesses')
                db_record.suggestions = result.get('suggestions')
                
                # Extract total score if possible (it's inside feedback)
                try:
                    db_record.total_score = float(db_record.feedback_analysis.get('total_score', 0))
                except:
                    pass
                
                db.commit()
                r.publish(f"task_logs:{self.request.id}", "Analysis Completed Successfully.\n")
                r.publish(f"task_logs:{self.request.id}", "DONE") # Signal end of stream
        except Exception as db_e:
            r.publish(f"task_logs:{self.request.id}", f"Database Error: {str(db_e)}\n")
            print(f"Database error: {db_e}")
        finally:
            db.close()
        
        return result
    except Exception as e:
        r.publish(f"task_logs:{self.request.id}", f"Error: {str(e)}\n")
        raise e
    finally:
        # Restore stdout
        sys.stdout = original_stdout
