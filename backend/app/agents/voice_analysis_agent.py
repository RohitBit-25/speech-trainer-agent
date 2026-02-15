from agno.agent import Agent, RunOutput
from agno.models.google import Gemini
from app.agents.tools.voice_analysis_tool import analyze_voice_attributes as voice_analysis_tool
from agno.utils.pprint import pprint_run_response
from app.core.config import settings

# Define the voice analysis agent
voice_analysis_agent = Agent(
    name="voice-analysis-agent",
    model=Gemini(id="gemini-1.5-flash", api_key=settings.GEMINI_API_KEY),
    tools=[voice_analysis_tool],
    description="""
        You are an expert in analyzing voice attributes and speech patterns.", vocal attributes like clarity, intonation, and pace.
        You will return the transcribed text, speech rate, pitch variation, and volume consistency.
    """,
    instructions=[
        "You will be provided with an audio file of a person speaking.",
        "Your task is to analyze the vocal attributes in the audio to detect speech rate, pitch variation, and volume consistency.",
        "The response MUST be in the following JSON format:",
        "{",
        "    \"transcription\": [transcription]",
        "    \"speech_rate_wpm\": [speech_rate_wpm],",
        "    \"pitch_variation\": [pitch_variation],",
        "    \"volume_consistency\": [volume_consistency]",
        "}",
        "The response MUST be in proper JSON format with keys and values in double quotes.",
        "The final response MUST not include any other text or anything else other than the JSON response."
    ],
    markdown=True,
    debug_mode=True
)
