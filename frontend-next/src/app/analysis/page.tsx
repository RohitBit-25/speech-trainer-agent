"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { Transcript } from "@/components/analysis/Transcript";
import { AgentCard } from "@/components/analysis/AgentCard";
import { Smile, Mic2, FileText, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generatePDF } from "@/lib/pdf";
import { Download } from "lucide-react";

export default function AnalysisPage() {
    const router = useRouter();
    const result = useAppStore((state) => state.result);
    const videoFile = useAppStore((state) => state.videoFile);
    const updateTranscription = useAppStore((state) => state.updateTranscription);

    useEffect(() => {
        // Redirect if no result
        if (!result) {
            router.push("/studio");
        }
    }, [result, router]);

    if (!result) return null;

    return (
        <div className="container py-8 space-y-8 max-w-screen-2xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-zinc-700 pb-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-pixel text-white mb-2 flex items-center gap-3">
                        <span className="text-primary">MISSION_REPORT</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-sm border border-primary/50">FINALIZED</span>
                    </h1>
                    <p className="font-mono text-zinc-400 text-sm">
                        Performance analytics for mission ID: <span className="text-zinc-200">#SPEECH_{Math.floor(Math.random() * 9999)}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => generatePDF('mission-report')}
                        className="font-pixel text-xs bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-500 hover:border-blue-500 text-white h-12 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all hover:translate-x-1"
                    >
                        EXPORT_REPORT
                        <Download className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => router.push("/feedback")}
                        className="font-pixel text-xs bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-500 hover:border-primary text-white h-12 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all hover:translate-x-1"
                    >
                        FULL_DIAGNOSTICS
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div id="mission-report" className="space-y-8 p-4 bg-background">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    {/* Video Feed */}
                    <div className="lg:col-span-2 h-full">
                        <VideoPlayer src={videoFile ? URL.createObjectURL(videoFile) : undefined} />
                    </div>
                    {/* Comm Logs */}
                    <div className="lg:col-span-1 h-full">
                        <Transcript
                            text={result.voice.transcription}
                            onSave={updateTranscription}
                        />
                    </div>
                </div>

                {/* Analysis Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AgentCard
                        title="FACIAL_RECOGNITION"
                        icon={Smile}
                        content={result.facial.summary}
                        className="border-blue-500/50 text-blue-400"
                    />
                    <AgentCard
                        title="AUDIO_WAVEFORM"
                        icon={Mic2}
                        content={`Pitch: ${result.voice.pitch}Hz | Pace: ${result.voice.pace}wpm | Vol: ${result.voice.volume}`}
                        className="border-purple-500/50 text-purple-400"
                    />
                    <AgentCard
                        title="CONTENT_SYNTAX"
                        icon={FileText}
                        content={`Structure: ${result.content.structure} | Clarity Index: ${result.content.clarity}/10`}
                        className="border-green-500/50 text-green-400"
                    />
                </div>
            </div>
        </div >
    );
}
