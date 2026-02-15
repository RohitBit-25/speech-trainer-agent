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
    try:
        # Update state to processing
        self.update_state(state='PROGRESS', meta={'status': 'Analyzing video...'})
        
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
                # Store the raw JSON content or parsed if preferred. 
                # Since the model has specific JSON columns:
                
                # Careful parsing: The agent returns strings for nested fields, but 'result' object here has them.
                # If they are already strings (JSON), we might need to parse them to store as JSON type in DB, 
                # or keep as is if DB column is JSON type (SQLAlchemy handles JSON type as python dicts usually).
                
                # 'result' is a dict. 'facial_expression_response' inside it is likely a JSON string.
                # Let's try to parse them if possible to store as structured JSON, or just store the whole thing.
                # But our model has specific columns. Let's map them.
                
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
        except Exception as db_e:
            print(f"Database error: {db_e}")
        finally:
            db.close()
        
        return result
    except Exception as e:
        # In case of failure, we might want to return the error
        raise e
