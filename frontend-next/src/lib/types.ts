export interface AnalysisResponse {
    facial_expression_response: string; // JSON string
    voice_analysis_response: string; // JSON string
    content_analysis_response: string; // JSON string
    feedback_response: string; // JSON string
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export interface ParsedAnalysisResult {
    facial: any;
    voice: any;
    content: any;
    feedback: any;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}
