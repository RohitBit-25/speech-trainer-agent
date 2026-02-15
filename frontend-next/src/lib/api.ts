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

        // The backend returns the raw Agent response. We need to parse it if it's a string, 
        // or just return it if it's already an object. 
        // Based on the mock data structure, we expect an object with facial, voice, content, etc.
        // If the agent returns a stringified JSON, we might need to parse it. 
        // For now, assuming the agent returns the structured object directly or we fit it.

        return data as ParsedAnalysisResult;

    } catch (error) {
        console.error("Error uploading video:", error);
        throw error;
    }
}
