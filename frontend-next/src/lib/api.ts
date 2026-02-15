import { ParsedAnalysisResult } from "./types";

const API_URL = "http://localhost:8000";

export async function uploadVideo(file: File): Promise<ParsedAnalysisResult> {
    const formData = new FormData();
    formData.append("video", file);

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Parse JSON strings from the backend response
        // The backend returns strings for these fields because they are from sub-agents
        const facial = typeof data.facial_expression_response === 'string'
            ? JSON.parse(data.facial_expression_response)
            : data.facial_expression_response;

        const voice = typeof data.voice_analysis_response === 'string'
            ? JSON.parse(data.voice_analysis_response)
            : data.voice_analysis_response;

        const content = typeof data.content_analysis_response === 'string'
            ? JSON.parse(data.content_analysis_response)
            : data.content_analysis_response;

        const feedback = typeof data.feedback_response === 'string'
            ? JSON.parse(data.feedback_response)
            : data.feedback_response;

        return {
            facial,
            voice,
            content,
            feedback,
            strengths: data.strengths,
            weaknesses: data.weaknesses,
            suggestions: data.suggestions
        } as ParsedAnalysisResult;

    } catch (error) {
        console.error("Error uploading video:", error);
        throw error;
    }
}
