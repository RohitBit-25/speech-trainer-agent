"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { VideoDropzone } from "@/components/upload/VideoDropzone";
import { SystemConsole } from "@/components/analysis/SystemConsole";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { startAnalysis, pollAnalysis } from "@/lib/api";

export default function Home() {
    const [isUploading, setIsUploading] = useState(false); // Local loading state for UI
    const [taskId, setTaskId] = useState<string | null>(null);
    const setAnalyzing = useAppStore((state) => state.setAnalyzing);
    const setResult = useAppStore((state) => state.setResult);
    const setVideoFile = useAppStore((state) => state.setVideoFile);
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
            toast.success("Mission Accomplished!", { description: "Analysis complete." });

            // Small delay to let user see "Analysis Completed" in console
            setTimeout(() => {
                router.push("/analysis");
            }, 1000);

        } catch (error) {
            toast.error("System Failure", { description: "Analysis sequence aborted." });
            console.error(error);
            setIsUploading(false); // Only reset if failed, otherwise navigate away
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

        </main>
    );
}
