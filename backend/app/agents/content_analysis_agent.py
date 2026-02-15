from agno.agent import Agent
from agno.models.together import Together
from app.core.config import settings

# Define the content analysis agent
content_analysis_agent = Agent(
    name="content-analysis-agent",
    model=Together(
        id="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        api_key=settings.TOGETHER_API_KEY
    ),
    description="""
        You are a highly advanced content analysis agent that evaluates transcribed speech for rhetorical structure, persuasion, tone, and clarity.
        You will return grammar corrections, filler word analysis, and deep insights into content effectiveness.
    """,
    instructions=[
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
    show_tool_calls=True,
    debug_mode=True
)
