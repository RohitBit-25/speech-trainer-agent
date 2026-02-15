from agno.agent import Agent, RunOutput
from agno.models.google import Gemini
from agno.utils.pprint import pprint_run_response
from app.core.config import settings

# Initialize the content analysis agent
content_analysis_agent = Agent(
    name="content-analysis-agent",
    model=Gemini(id="gemini-1.5-flash", api_key=settings.GEMINI_API_KEY),
    instructions=[
        "You are an expert in analyzing speech content, rhetorical structure, and persuasion techniques. You will evaluate transcribed speech for rhetorical structure, persuasion, tone, and clarity. You will return grammar corrections, filler word analysis, and deep insights into content effectiveness.",
        "You will be provided with a transcript of spoken content.",
        "Your task is to analyze the transcript and identify:",
        "- Grammar and syntax corrections.",
        "- Filler words and their frequency.",
        "- Rhetorical devices used (e.g., metaphors, similes, repetition).",
        "- Persuasion techniques (e.g., ethos, pathos, logos).",
        "- Tone consistency (e.g., confident, hesitant, formal, casual).",
        "- Structural analysis (effectiveness of introduction, body, and conclusion).",
        "- Suggestions for improving clarity, structure, and impact.",
        "The response MUST be in the following JSON format:",
        "{",
        "    \"grammar_corrections\": [list of corrections],",
        "    \"filler_words\": { \"word\": count, ... },",
        "    \"rhetorical_devices\": [list of identified devices],",
        "    \"persuasion_techniques\": [list of identified techniques],",
        "    \"tone_consistency\": \"analysis of tone\",",
        "    \"structural_analysis\": \"analysis of structure\",",
        "    \"suggestions\": [list of suggestions]",
        "}",
        "Ensure the response is in proper JSON format with keys and values in double quotes.",
        "Do not include any additional text outside the JSON response."
    ],
    markdown=True,
    debug_mode=True
)
