"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { Transcript } from "@/components/analysis/Transcript";
import { AgentCard } from "@/components/analysis/AgentCard";
import { Smile, Mic2, FileText, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function AnalysisPage() {
    const router = useRouter();
    const result = useAppStore((state) => state.result);
    const videoFile = useAppStore((state) => state.videoFile);

    useEffect(() => {
        // Redirect if no result
        if (!result) {
            router.push("/");
        }
    }, [result, router]);

    if (!result) return null;

    return (
        <div className="container py-6 space-y-6 max-w-screen-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
                    <p className="text-muted-foreground">Review your speech performance metrics.</p>
                </div>
                <Button onClick={() => router.push("/feedback")}>
                    View Detailed Feedback
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                <div className="lg:col-span-2 h-full">
                    <VideoPlayer src={videoFile ? URL.createObjectURL(videoFile) : undefined} />
                </div>
                <div className="lg:col-span-1 h-full">
                    <Transcript
                        text={result.voice.transcription}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AgentCard
                    title="Facial Expressions"
                    icon={Smile}
                    content={result.facial.summary}
                    className="border-blue-500/20"
                />
                <AgentCard
                    title="Voice Analysis"
                    icon={Mic2}
                    content={`Pitch: ${result.voice.pitch}Hz | Pace: ${result.voice.pace}wpm. Volume: ${result.voice.volume}`}
                    className="border-purple-500/20"
                />
                <AgentCard
                    title="Content Structure"
                    icon={FileText}
                    content={`Structure: ${result.content.structure}. Clarity Score: ${result.content.clarity}/10.`}
                    className="border-green-500/20"
                />
            </div>
        </div>
    );
}
