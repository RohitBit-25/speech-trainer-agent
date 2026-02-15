import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
    # Add other environment variables here as needed

settings = Settings()
