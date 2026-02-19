"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import { VideoDropzone } from "@/components/upload/VideoDropzone";
import { SystemConsole } from "@/components/analysis/SystemConsole";
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { QuickHelp } from '@/components/tutorial/HelpTooltip';
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { startAnalysis, pollAnalysis } from "@/lib/api";

export default function StudioPage() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");

    const setAnalyzing = useAppStore((state) => state.setAnalyzing);
    const setResult = useAppStore((state) => state.setResult);
    const setVideoFile = useAppStore((state) => state.setVideoFile);
    const addXP = useAppStore((state) => state.addXP);
    const unlockAchievement = useAppStore((state) => state.unlockAchievement);
    const router = useRouter();

    useEffect(() => {
        // Initialize time immediately to avoid hydration mismatch if possible, 
        // but for now setting it in effect ensures client-side rendering matches.
        setCurrentTime(new Date().toISOString().split('T')[1].split('.')[0] + " UTC");

        const interval = setInterval(() => {
            setCurrentTime(new Date().toISOString().split('T')[1].split('.')[0] + " UTC");
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setAnalyzing(true);
        setVideoFile(file);
        setTaskId(null);

        try {
            toast.info("Initializing system uplink...", { description: "Establishing secure connection." });

            const newTaskId = await startAnalysis(file);
            setTaskId(newTaskId);

            const result = await pollAnalysis(newTaskId);

            setResult(result);
            addXP(500);
            unlockAchievement('first_upload');

            if (result.voice.pitch > 80 && result.voice.pitch < 120) {
                unlockAchievement('perfect_pitch');
            }

            toast.success("Mission Accomplished!", { description: "Analysis complete." });

            setTimeout(() => {
                router.push("/analysis");
            }, 1000);

        } catch (error: any) {
            console.error("Analysis error:", error);
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
        <main className="flex min-h-screen flex-col items-center p-6 md:p-12 relative overflow-hidden bg-black selection:bg-primary/30">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black"></div>
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>

            {/* System Status Header */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-12 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    <span className="font-pixel text-xs text-green-500 tracking-widest">SYSTEM ONLINE</span>
                </div>
                <div className="font-mono text-xs text-zinc-600 flex items-center gap-4">
                    <span>SECURE_CONNECTION_ESTABLISHED</span>
                    <span className="text-zinc-500 px-2 border-l border-zinc-800">{currentTime}</span>
                </div>
            </div>

            <div className="w-full max-w-4xl z-10 text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                    <Activity className="h-5 w-5 text-primary mr-2" />
                    <span className="text-xs font-pixel text-zinc-400">AI ANALYSIS MODULE V2.0</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-pixel text-white mb-6 tracking-tight drop-shadow-2xl">
                    MISSION_CONTROL
                </h1>
                <p className="text-zinc-400 font-mono max-w-lg mx-auto leading-relaxed">
                    Upload your transmission for deep neural analysis. Our AI agents are standing by to deconstruct your performance.
                </p>
            </div>

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
