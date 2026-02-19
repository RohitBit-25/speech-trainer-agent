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
        <main className="h-[calc(100vh-4rem)] w-full bg-black relative overflow-hidden flex flex-col font-mono text-zinc-400">
            {/* ─── SCIFI GRID BACKGROUND ────────────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"></div>
            </div>

            {/* ─── HEADER: STATUS BAR ───────────────────────────────────────── */}
            <header className="h-12 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-between px-6 z-10 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-primary/80">
                        <Activity className="h-4 w-4" />
                        <span className="text-xs font-bold tracking-widest">STUDIO_TERMINAL_01</span>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-800"></div>
                    <div className="text-[10px] text-zinc-600 tracking-widest">
                        NET_STATUS: <span className="text-green-500">CONNECTED</span>
                    </div>
                </div>
                <div className="font-pixel text-[10px] text-zinc-500">
                    {currentTime}
                </div>
            </header>

            {/* ─── MAIN COCKPIT AREA ────────────────────────────────────────── */}
            <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden relative z-10">

                {/* LEFT COLUMN: Data Readouts (Decorational) */}
                <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 border-r border-zinc-900/50 pr-6 opacity-60 pointer-events-none select-none">
                    <div className="space-y-1">
                        <div className="text-[9px] uppercase text-zinc-700 tracking-widest mb-2">System Metrics</div>
                        {['CPU_LOAD', 'MEM_ALLOC', 'NET_UPLINK', 'DISK_I/O'].map(label => (
                            <div key={label} className="flex justify-between items-center text-[10px]">
                                <span>{label}</span>
                                <span className="font-pixel text-primary/60">{Math.floor(Math.random() * 90) + 10}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="h-32 w-full border border-zinc-900 bg-zinc-950 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#333_3px)] opacity-20"></div>
                    </div>
                </div>

                {/* CENTER COLUMN: Main Inteface */}
                <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center relative">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-zinc-800"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-zinc-800"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-zinc-800"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-zinc-800"></div>

                    <div className="w-full max-w-2xl space-y-8 relative z-20">
                        <div className="text-center space-y-2 mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold font-pixel text-white tracking-tighter">
                                UPLINK_MODULE
                            </h1>
                            <p className="text-xs text-primary/60 tracking-[0.2em] uppercase">
                                Awaiting Neural Link Connection
                            </p>
                        </div>

                        <VideoDropzone onUpload={handleUpload} isUploading={isUploading} />

                        {isUploading && taskId && (
                            <div className="mt-8 border-t border-zinc-800 pt-8">
                                <SystemConsole taskId={taskId} isAnalyzing={isUploading} />
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Recent Logs / History */}
                <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 border-l border-zinc-900/50 pl-6 text-[10px]">
                    <div className="text-[9px] uppercase text-zinc-700 tracking-widest mb-2">Recent Batches</div>
                    <div className="space-y-3 opacity-50">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border border-zinc-900 p-2 bg-zinc-950/30">
                                <div className="flex justify-between text-zinc-500 mb-1">
                                    <span>BATCH_00{780 + i}</span>
                                    <span>DONE</span>
                                </div>
                                <div className="h-1 w-full bg-zinc-900 overflow-hidden">
                                    <div className="h-full bg-zinc-700 w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── FOOTER: KEYLINE ──────────────────────────────────────────── */}
            <div className="h-6 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 text-[9px] text-zinc-700 uppercase tracking-widest shrink-0">
                <span>VER 2.4.9</span>
                <span>SECURE_ENV</span>
            </div>
            {/* Tutorial Modal */}
            <TutorialModal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                mode="studio"
            />
        </main>
    );
}
