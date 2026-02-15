"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAnalysis } from "@/lib/api";
import { ParsedAnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Smile, Mic2, FileText, Trophy, Activity } from "lucide-react";
import { toast } from "sonner";
import { AgentCard } from "@/components/analysis/AgentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ComparisonContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id1 = searchParams.get("id1");
    const id2 = searchParams.get("id2");

    const [data1, setData1] = useState<ParsedAnalysisResult | null>(null);
    const [data2, setData2] = useState<ParsedAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id1 || !id2) {
                toast.error("Invalid Parameters", { description: "Missing mission IDs for comparison." });
                return;
            }

            try {
                const [res1, res2] = await Promise.all([
                    getAnalysis(id1),
                    getAnalysis(id2)
                ]);
                setData1(res1);
                setData2(res2);
            } catch (error) {
                console.error("Comparison load failed:", error);
                toast.error("Data Corrupted", { description: "Could not retrieve mission data." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id1, id2]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!data1 || !data2) return null;

    // Helper to render diff
    const RenderDiff = ({ val1, val2, label, unit = "" }: { val1: number, val2: number, label: string, unit?: string }) => {
        const diff = val2 - val1;
        const isPositive = diff > 0;
        return (
            <div className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                <span className="text-xs font-mono text-zinc-400">{label}</span>
                <div className="flex items-center gap-4">
                    <span className="font-mono text-zinc-500">{val1}{unit}</span>
                    <ArrowLeft className="h-3 w-3 text-zinc-600 rotate-180" />
                    <span className="font-mono text-white">{val2}{unit}</span>
                    <span className={`text-xs font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}{diff.toFixed(1)}{unit}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="container py-8 max-w-7xl animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    BACK_TO_ARCHIVES
                </Button>
                <div className="h-8 w-[2px] bg-zinc-700"></div>
                <h1 className="text-2xl font-pixel text-white">MISSION_COMPARISON_PROTOCOL</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* Center Divider Line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-zinc-800 -translate-x-1/2 z-0"></div>
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-zinc-950 border border-zinc-700 p-2 rounded-full">
                    <Trophy className="h-4 w-4 text-primary" />
                </div>

                {/* Column 1 */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 p-4 border border-zinc-700 text-center">
                        <div className="font-pixel text-xs text-zinc-500 uppercase mb-1">MISSION A</div>
                        <div className="font-mono text-sm text-primary">{id1}</div>
                    </div>

                    <AgentCard
                        title="FACIAL_RECOGNITION"
                        icon={Smile}
                        content={data1.facial.summary}
                        className="border-blue-900/30 opacity-80"
                    />

                    {/* Metrics 1 */}
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardHeader className="py-2"><CardTitle className="text-xs font-pixel text-zinc-500">AUDIO_METRICS</CardTitle></CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex justify-between text-xs font-mono"><span className="text-zinc-500">PITCH</span> <span>{data1.voice.pitch} Hz</span></div>
                            <div className="flex justify-between text-xs font-mono"><span className="text-zinc-500">PACE</span> <span>{data1.voice.pace} WPM</span></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 p-4 border border-zinc-700 text-center">
                        <div className="font-pixel text-xs text-zinc-500 uppercase mb-1">MISSION B</div>
                        <div className="font-mono text-sm text-green-400">{id2}</div>
                    </div>

                    <AgentCard
                        title="FACIAL_RECOGNITION"
                        icon={Smile}
                        content={data2.facial.summary}
                        className="border-blue-500/50 text-blue-400"
                    />

                    {/* Metrics 2 */}
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardHeader className="py-2"><CardTitle className="text-xs font-pixel text-zinc-500">AUDIO_METRICS</CardTitle></CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex justify-between text-xs font-mono"><span className="text-zinc-500">PITCH</span> <span>{data2.voice.pitch} Hz</span></div>
                            <div className="flex justify-between text-xs font-mono"><span className="text-zinc-500">PACE</span> <span>{data2.voice.pace} WPM</span></div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delta Report */}
            <Card className="mt-8 bg-zinc-900 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                <CardHeader className="border-b-4 border-zinc-700 bg-zinc-950">
                    <CardTitle className="font-pixel text-lg text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-yellow-500" />
                        DELTA_ANALYSIS
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2">
                    <RenderDiff val1={data1.voice.pitch} val2={data2.voice.pitch} label="PITCH_VARIANCE" unit="Hz" />
                    <RenderDiff val1={data1.voice.pace} val2={data2.voice.pace} label="SPEECH_VELOCITY" unit="wpm" />
                    <RenderDiff val1={data1.content.clarity} val2={data2.content.clarity} label="CONTENT_CLARITY" />
                    <RenderDiff val1={data1.content.persuasion} val2={data2.content.persuasion} label="PERSUASION_INDEX" />
                </CardContent>
            </Card>

        </div>
    );
}

export default function ComparisonPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        }>
            <ComparisonContent />
        </Suspense>
    );
}
