import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001")
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

settings = Settings()
