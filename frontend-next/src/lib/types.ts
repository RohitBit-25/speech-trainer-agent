export interface AnalysisResponse {
    facial_expression_response: string; // JSON string
    voice_analysis_response: string; // JSON string
    content_analysis_response: string; // JSON string
    feedback_response: string; // JSON string
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export interface FacialAnalysis {
    summary: string;
    emotions: Record<string, number>;
    eye_contact: number;
}

export interface VoiceAnalysis {
    transcription: string;
    pitch: number;
    pace: number;
    volume: string;
}

export interface FeedbackAnalysis {
    scores: Record<string, number>;
    total_score: number;
    interpretation: string;
    feedback_summary: string;
}

export interface ContentAnalysis {
    structure: string;
    clarity: number;
    persuasion: number;
}

export interface ParsedAnalysisResult {
    facial: FacialAnalysis;
    voice: VoiceAnalysis;
    content: ContentAnalysis;
    feedback: FeedbackAnalysis;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
}

export interface UserProfile {
    xp: number;
    level: number;
    title: string;
    achievements: Achievement[];
}
