try:
    print("Importing app.agents.realtime.realtime_feedback_agent...")
    from app.agents.realtime.realtime_feedback_agent import RealtimeFeedbackAgent
    print("Import successful!")
    
    print("Instantiating agent...")
    agent = RealtimeFeedbackAgent()
    print("Instantiation successful!")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
