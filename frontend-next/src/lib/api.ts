import { ParsedAnalysisResult } from "./types";

// const API_URL = "http://localhost:8000"; // TODO: Use env var

export async function uploadVideo(file: File): Promise<ParsedAnalysisResult> {
    // Mock implementation for now since backend might not be running or reachable
    console.log("Uploading file:", file.name);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Return mock data
    return {
        facial: {
            emotions: { "happy": 0.8, "neutral": 0.2 },
            eye_contact: 85,
            summary: "Good eye contact and positive expression."
        },
        voice: {
            transcription: "This is a simulated transcript found in the implementation of the API client. It mimics the response from the backend.",
            pitch: 120,
            pace: 140,
            volume: "Consistent"
        },
        content: {
            structure: "Clear",
            clarity: 9,
            persuasion: 8
        },
        feedback: {
            scores: {
                "Content & Organization": 4,
                "Delivery & Vocal Quality": 3.5,
                "Body Language & Eye Contact": 4.5,
                "Audience Engagement": 3,
                "Language & Clarity": 5
            },
            total_score: 20,
            interpretation: "Great job! Your content is well-structured.",
            feedback_summary: "Strong opening and clear message."
        },
        strengths: ["Clear articulation", "Good structure", "Positive demeanor"],
        weaknesses: ["Slight monotony", "Could use more gestures"],
        suggestions: ["Vary your pitch", "Use hand movements to emphasize points"]
    };

    /* 
    // Real implementation:
    const formData = new FormData();
    formData.append("video", file); // Adjust field name based on backend expectation
  
    // Backend expects {"video_url": "path"} if local, or file upload?
    // The Streamlit app sends {"video_url": path} because it saves file locally first.
    // For web app, we likely need a proper upload endpoint or save to temp.
    // Assuming we need to adjust backend to accept file upload or we mock it.
    
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: formData, // If backend supports multipart/form-data
    });
  
    if (!response.ok) {
      throw new Error("Analysis failed");
    }
  
    const data: AnalysisResponse = await response.json();
  
    // Parse JSON strings inside the response
    return {
      facial: JSON.parse(data.facial_expression_response),
      voice: JSON.parse(data.voice_analysis_response),
      content: JSON.parse(data.content_analysis_response),
      feedback: JSON.parse(data.feedback_response),
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      suggestions: data.suggestions
    };
    */
}
