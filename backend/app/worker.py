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
        
        return result
    except Exception as e:
        # In case of failure, we might want to return the error
        raise e
