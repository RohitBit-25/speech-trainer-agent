import { ParsedAnalysisResult, HistoryItem } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    return fetch(url, {
        ...options,
        credentials: 'include',
    });
}

// Safely parse a value if it happens to be a JSON string
const parseIfString = (val: any): any => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
    }
    return val;
};

// Unwrap single-element arrays returned by the LLM
const unwrapArray = (val: any): any => {
    if (Array.isArray(val) && val.length === 1) return val[0];
    return val;
};

const safeGet = (obj: any, ...keys: string[]): any => {
    for (const key of keys) {
        if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
};

/**
 * Map the raw LLM voice_analysis_response to our VoiceAnalysis type.
 * The LLM may use: speech_rate_wpm, pitch_variation, volume_consistency, transcription
 */
function mapVoiceAnalysis(raw: any) {
    if (!raw) return { transcription: "No transcription available.", pitch: 0, pace: 0, volume: "N/A" };
    const r = unwrapArray(parseIfString(raw));
    return {
        transcription: safeGet(r, 'transcription', 'transcript', 'text') || "No transcription available.",
        pitch: parseFloat(safeGet(r, 'pitch_hz', 'pitch_variation', 'pitch') || '0') || 0,
        pace: parseFloat(safeGet(r, 'speech_rate_wpm', 'speech_rate', 'pace') || '0') || 0,
        volume: safeGet(r, 'volume_consistency', 'volume_db', 'volume') || "N/A",
        summary: safeGet(r, 'summary', 'voice_summary'),
    };
}

/**
 * Map the raw LLM facial_expression_response to our FacialAnalysis type.
 */
function mapFacialAnalysis(raw: any) {
    if (!raw) return { summary: "Facial analysis unavailable.", emotions: {}, eye_contact: 0 };
    const r = unwrapArray(parseIfString(raw));

    // Build emotions map from emotion_timeline if present
    let emotions: Record<string, number> = {};
    const timeline = safeGet(r, 'emotion_timeline');
    if (Array.isArray(timeline)) {
        timeline.forEach((entry: any) => {
            const emo = entry.emotion || entry.dominant_emotion;
            if (emo) emotions[emo] = (emotions[emo] || 0) + 1;
        });
    }

    // Fall back to pre-computed emotion_counts from the backend (populated by worker)
    if (Object.keys(emotions).length === 0) {
        const emotionCounts = safeGet(r, 'emotion_counts');
        if (emotionCounts && typeof emotionCounts === 'object' && !Array.isArray(emotionCounts)) {
            emotions = emotionCounts;
        }
    }

    // Fall back to direct emotions object
    const directEmotions = safeGet(r, 'emotions', 'emotion_scores');
    if (Object.keys(emotions).length === 0 && directEmotions && typeof directEmotions === 'object' && !Array.isArray(directEmotions)) {
        emotions = directEmotions;
    }

    const engagement = safeGet(r, 'engagement_metrics', 'engagement');
    const eyeContact = typeof engagement === 'object'
        ? (safeGet(engagement, 'eye_contact_frequency', 'eye_contact') || 0)
        : (safeGet(r, 'eye_contact', 'eye_contact_score') || 0);

    const dominantEmotion = Object.keys(emotions).sort((a, b) => (emotions[b] || 0) - (emotions[a] || 0))[0] || 'neutral';

    const summary = safeGet(r, 'summary', 'facial_summary') ||
        `Dominant emotion: ${dominantEmotion}. Eye contact: ${eyeContact}`;

    return {
        summary,
        emotions,
        eye_contact: eyeContact,
        confidence: safeGet(r, 'confidence', 'emotion_confidence') || 0,
        engagement: safeGet(r, 'engagement_score') || 0,
    };
}

/**
 * Map the raw LLM content_analysis_response to our ContentAnalysis type.
 */
function mapContentAnalysis(raw: any) {
    if (!raw) return { structure: "N/A", clarity: 0, persuasion: 0 };
    const r = unwrapArray(parseIfString(raw));
    return {
        structure: safeGet(r, 'structure', 'speech_structure', 'organization') || "N/A",
        clarity: parseFloat(safeGet(r, 'clarity', 'clarity_score', 'clarity_index') || '0') || 0,
        persuasion: parseFloat(safeGet(r, 'persuasion', 'persuasion_score', 'persuasiveness') || '0') || 0,
    };
}

/**
 * Map the raw LLM feedback_response to our FeedbackAnalysis type.
 */
function mapFeedbackAnalysis(raw: any) {
    if (!raw) return { scores: {}, total_score: 0, interpretation: "No feedback.", feedback_summary: "No feedback available." };
    const r = unwrapArray(parseIfString(raw));
    return {
        scores: safeGet(r, 'scores', 'component_scores') || {},
        total_score: parseFloat(safeGet(r, 'total_score', 'overall_score', 'score') || '0') || 0,
        interpretation: safeGet(r, 'interpretation', 'grade_interpretation', 'overall_assessment') || "N/A",
        feedback_summary: safeGet(r, 'feedback_summary', 'summary', 'feedback', 'overall_feedback') || "No summary.",
    };
}

export async function startAnalysis(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("video", file);

    const uploadResponse = await fetchWithAuth(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
    }

    const { task_id } = await uploadResponse.json();

    if (!task_id) {
        throw new Error("No task_id received from backend");
    }

    return task_id;
}

export async function pollAnalysis(task_id: string): Promise<ParsedAnalysisResult> {
    let retries = 0;
    const maxRetries = 600; // Timeout after ~20 minutes

    while (retries < maxRetries) {
        const statusResponse = await fetchWithAuth(`${API_URL}/status/${task_id}`);

        if (!statusResponse.ok) {
            await sleep(2000);
            retries++;
            continue;
        }

        const statusData = await statusResponse.json();

        if (statusData.state === "SUCCESS") {
            const data = statusData.result;

            return {
                facial: mapFacialAnalysis(data.facial_expression_response),
                voice: mapVoiceAnalysis(data.voice_analysis_response),
                content: mapContentAnalysis(data.content_analysis_response),
                feedback: mapFeedbackAnalysis(data.feedback_response),
                strengths: Array.isArray(data.strengths) ? data.strengths : [],
                weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
                suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
            } as ParsedAnalysisResult;

        } else if (statusData.state === "FAILURE") {
            throw new Error(`Analysis failed: ${statusData.error || "Unknown error"}`);
        }

        await sleep(2000);
        retries++;
    }

    throw new Error("Analysis timed out");
}

export async function uploadVideo(file: File): Promise<ParsedAnalysisResult> {
    const taskId = await startAnalysis(file);
    return await pollAnalysis(taskId);
}

export async function getHistory(): Promise<HistoryItem[]> {
    const response = await fetchWithAuth(`${API_URL}/history`);
    if (!response.ok) {
        throw new Error("Failed to fetch history");
    }
    return await response.json();
}

export async function getAnalysis(taskId: string): Promise<ParsedAnalysisResult> {
    const response = await fetchWithAuth(`${API_URL}/analysis/${taskId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch analysis");
    }
    const data = await response.json();

    return {
        facial: mapFacialAnalysis(data.facial),
        voice: mapVoiceAnalysis(data.voice),
        content: mapContentAnalysis(data.content),
        feedback: mapFeedbackAnalysis(data.feedback),
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };
}
