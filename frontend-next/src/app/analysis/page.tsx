"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { Transcript } from "@/components/analysis/Transcript";
import { AgentCard } from "@/components/analysis/AgentCard";
import { Smile, Mic2, FileText, ArrowRight } from "lucide-react";

export default function AnalysisPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // Mock data for demonstration
    useEffect(() => {
        // Simulate fetching analysis data
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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
                    <VideoPlayer src="/mock-video.mp4" /> {/* TODO: Replace with actual video source */}
                </div>
                <div className="lg:col-span-1 h-full">
                    <Transcript
                        isLoading={isLoading}
                        text="This is a simulated transcript. In a real scenario, this would contain the speech-to-text output from the analysis engine. The speaker started with a strong opening but hesitated slightly in the middle section..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AgentCard
                    title="Facial Expressions"
                    icon={Smile}
                    isLoading={isLoading}
                    content="The speaker maintained good eye contact (85%). Smile detection indicates positive engagement in the introduction. However, there were moments of slight frowning during the technical explanation."
                    className="border-blue-500/20"
                />
                <AgentCard
                    title="Voice Analysis"
                    icon={Mic2}
                    isLoading={isLoading}
                    content="Average pitch: 120Hz. Speaking rate: 140 wpm (Optimal). Volume consistency was generally good, but dropped slightly at the end of sentences. Pauses were used effectively for emphasis."
                    className="border-purple-500/20"
                />
                <AgentCard
                    title="Content Structure"
                    icon={FileText}
                    isLoading={isLoading}
                    content="The speech followed a clear 'Problem-Solution' structure. Introduction hook was effective. Transition phrases like 'Furthermore' and 'In conclusion' helped guide the listener. Argument strength: High."
                    className="border-green-500/20"
                />
            </div>
        </div>
    );
}
