"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { VideoDropzone } from "@/components/upload/VideoDropzone";
import { SystemConsole } from "@/components/analysis/SystemConsole";
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { QuickHelp } from '@/components/tutorial/HelpTooltip';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { startAnalysis, pollAnalysis } from "@/lib/api";

export default function StudioPage() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // Local loading state for UI
    const [taskId, setTaskId] = useState<string | null>(null);
    const setAnalyzing = useAppStore((state) => state.setAnalyzing);
    const setResult = useAppStore((state) => state.setResult);
    const setVideoFile = useAppStore((state) => state.setVideoFile);
    const addXP = useAppStore((state) => state.addXP);
    const unlockAchievement = useAppStore((state) => state.unlockAchievement);
    const router = useRouter();

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setAnalyzing(true);
        setVideoFile(file);
        setTaskId(null);

        try {
            toast.info("Initializing system uplink...", { description: "Establishing secure connection." });

            // Step 1: Start Analysis & Get Task ID
            const newTaskId = await startAnalysis(file);
            setTaskId(newTaskId);

            // Step 2: Poll for results (Console will auto-connect using taskId)
            const result = await pollAnalysis(newTaskId);

            setResult(result);

            // Gamification Triggers
            addXP(500);
            unlockAchievement('first_upload');
            // Check for perfect pitch (mock check)
            if (result.voice.pitch > 80 && result.voice.pitch < 120) {
                // Just a dummy condition for valid pitch detection
                unlockAchievement('perfect_pitch');
            }

            toast.success("Mission Accomplished!", { description: "Analysis complete." });

            // Small delay to let user see "Analysis Completed" in console
            setTimeout(() => {
                router.push("/analysis");
            }, 1000);

        } catch (error: any) {
            console.error("Analysis error:", error);

            // Provide specific error messages
            let errorTitle = "System Failure";
            let errorDescription = "Analysis sequence aborted.";

            if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
                errorTitle = "Connection Error";
                errorDescription = "Cannot reach backend server. Please ensure the backend is running on port 8000.";
            } else if (error.message?.includes("timeout")) {
                errorTitle = "Timeout Error";
                errorDescription = "Analysis took too long. Please try with a shorter video.";
            } else if (error.message?.includes("API key")) {
                errorTitle = "API Configuration Error";
                errorDescription = "Gemini API key is missing or invalid. Check backend .env file.";
            }

            toast.error(errorTitle, { description: errorDescription });
            setIsUploading(false);
            setAnalyzing(false);
            setTaskId(null);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-6 md:p-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <Hero />

            <div className="w-full max-w-4xl z-10 space-y-8">
                <VideoDropzone onUpload={handleUpload} isUploading={isUploading} />

                {/* System Console appears during analysis */}
                {isUploading && taskId && (
                    <SystemConsole taskId={taskId} isAnalyzing={isUploading} />
                )}
            </div>

            {/* Tutorial Modal */}
            <TutorialModal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                mode="studio"
            />

            {/* Quick Help */}
            <QuickHelp
                title="Video Analysis Tips"
                tips={[
                    "Record in landscape mode with good lighting",
                    "Keep videos under 50MB (2-5 minutes ideal)",
                    "Ensure clear audio and visible face",
                    "Use 720p or 1080p resolution",
                    "Minimize background noise",
                    "Practice your speech before recording"
                ]}
            />

        </main>
    );
}
