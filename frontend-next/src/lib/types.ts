// ============================================================================
// AI/ML REAL-TIME METRICS
// ============================================================================

export interface EmotionAnalysis {
    emotion: string;
    confidence: number;
    engagement_score: number;
    engagement_level: string;
    eye_contact_score: number;
    smile_score: number;
    face_detected: boolean;
    emotional_state: string | null;
}

export interface VoiceQualityMetrics {
    speech_rate_wpm: number;
    speech_rate_quality: string;
    pitch_hz: number;
    pitch_variation_semitones: number;
    pitch_quality: string;
    clarity_score: number;
    volume_db: number;
    volume_consistency: number;
    speech_energy: number;
    speech_energy_stability: number;
    filler_words: string[];
    filler_word_density: number;
    overall_voice_score: number;
    recommendations: string[];
    transcript?: string;
}

export interface PerformanceScore {
    total_score: number;
    voice_score: number;
    facial_score: number;
    content_score: number;
    pacing_score: number;
    grade: string;
    is_good_frame: boolean;
    feedback_priority: string[];
    strengths: string[];
    weaknesses: string[];
    areas_for_improvement?: string[];
    timestamp: string;
}

export interface RealtimeFeedback {
    type: string;
    session_id: string;
    feedback: string;
    facial_analysis: EmotionAnalysis;
    voice_analysis: VoiceQualityMetrics;
    score: PerformanceScore;
    timestamp: string;
}

export interface SessionMetrics {
    total_frames: number;
    average_score: number;
    max_score: number;
    min_score: number;
    good_frames_count: number;
    good_frames_percentage: number;
    improvement_trend: string;
    best_component: string;
    worst_component: string;
    component_averages: Record<string, number>;
}

export interface SessionSummary {
    session_id: string;
    user_id: string;
    difficulty: string;
    duration_seconds: number;
    total_frames: number;
    total_feedback_given: number;
    statistics: SessionMetrics;
    recent_feedback: Array<{
        timestamp: string;
        feedback: string;
        voice_score: number;
        engagement: number;
    }>;
    final_metrics: PerformanceScore;
}

// ============================================================================
// LEGACY / BATCH ANALYSIS TYPES
// ============================================================================

export interface AnalysisResponse {
    facial_expression_response: string;
    voice_analysis_response: string;
    content_analysis_response: string;
    feedback_response: string;
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

export interface HistoryItem {
    id: number;
    task_id: string;
    video_filename: string;
    status: string;
    created_at: string;
    total_score: number | null;
    feedback_summary: string | null;
}
