import { ParsedAnalysisResult } from "./types";

const API_URL = "http://localhost:8000";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function startAnalysis(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("video", file);

    const uploadResponse = await fetch(`${API_URL}/analyze`, {
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
    const maxRetries = 600; // Timeout after ~20 minutes (assuming 2s interval) - increased for long analysis

    while (retries < maxRetries) {
        const statusResponse = await fetch(`${API_URL}/status/${task_id}`);

        if (!statusResponse.ok) {
            await sleep(2000);
            retries++;
            continue;
        }

        const statusData = await statusResponse.json();

        if (statusData.state === "SUCCESS") {
            const data = statusData.result;

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
