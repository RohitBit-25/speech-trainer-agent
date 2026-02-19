"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAnalysis } from "@/lib/api";
import { ParsedAnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Smile, Mic2, FileText, Trophy, Activity, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AgentCard } from "@/components/analysis/AgentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

function ComparisonContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id1 = searchParams.get("id1");
    const id2 = searchParams.get("id2");

    const [data1, setData1] = useState<ParsedAnalysisResult | null>(null);
    const [data2, setData2] = useState<ParsedAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id1 || !id2) {
                setError("Missing mission IDs for comparison.");
                return;
            }

            try {
                // Fetch individually to allow partial success or specific error handling
                const p1 = getAnalysis(id1).catch(() => null);
                const p2 = getAnalysis(id2).catch(() => null);

                const [res1, res2] = await Promise.all([p1, p2]);

                if (!res1 || !res2) { // If either failed
                    throw new Error("Failed to retrieve one or both mission logs.");
                }

                setData1(res1);
                setData2(res2);
            } catch (error: any) {
                console.error("Comparison load failed:", error);
                setError(error.message || "Could not retrieve mission data.");
                toast.error("Data Corrupted", { description: "Could not retrieve mission data." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id1, id2]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div className="font-pixel text-xs text-primary animate-pulse">INITIATING_COMPARISON_PROTOCOL...</div>
                </div>
            </div>
        );
    }

    if (error || !data1 || !data2) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4 max-w-md px-6">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                    <h2 className="font-pixel text-xl text-red-500">PROTOCOL_FAILURE</h2>
                    <p className="font-mono text-zinc-400 text-sm">{error || "Data unavailable."}</p>
                    <Button onClick={() => router.back()} variant="outline" className="font-pixel text-xs">
                        RETURN_TO_ARCHIVES
                    </Button>
                </div>
            </div>
        );
    }

    // Helper to render diff with improved visuals
    const RenderDiff = ({ val1, val2, label, unit = "", reverse = false }: { val1: number, val2: number, label: string, unit?: string, reverse?: boolean }) => {
        // Safe defaults
        const v1 = val1 || 0;
        const v2 = val2 || 0;

        let diff = v2 - v1;
        // For some metrics (like pacing), higher isn't always "better" in a simple way, 
        // but for score/clarity it is. 'reverse' prop handles things like 'filler words' where lower is better.

        const isPositive = reverse ? diff < 0 : diff > 0;
        const isNeutral = diff === 0;

        const colorClass = isNeutral ? "text-zinc-500" : isPositive ? "text-green-500" : "text-red-500";
        const iconRotation = diff > 0 ? "-rotate-45" : diff < 0 ? "rotate-45" : "rotate-90"; // Simple arrow logic or just use clear +/-

        return (
            <div className="flex justify-between items-center py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/30 px-2 rounded transition-colors">
                <span className="text-[10px] font-pixel text-zinc-500 uppercase tracking-wider">{label}</span>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-xs text-zinc-600">{v1.toFixed(1)}{unit}</span>
                    </div>

                    <ArrowLeft className="h-3 w-3 text-zinc-700" />

                    <div className="flex flex-col items-start w-16">
                        <span className="font-mono text-sm text-white font-bold">{v2.toFixed(1)}{unit}</span>
                    </div>

                    <div className={`w-16 text-right font-mono text-xs font-bold ${colorClass}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}{unit}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black animate-in fade-in duration-700">
            <div className="container py-8 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-pixel text-white tracking-tight">MISSION_COMPARISON_PROTOCOL</h1>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                                <span>ID: {id1?.slice(0, 8)}...</span>
                                <span>VS</span>
                                <span>ID: {id2?.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 px-3 py-1 rounded border border-zinc-800">
                        <span className="font-pixel text-[10px] text-green-500 flex items-center gap-2">
                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                            LIVE_ANALYSIS
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 relative">
                    {/* Divider visual for desktop */}
                    <div className="hidden md:absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent -translate-x-1/2 z-0"></div>

                    {/* Mission A */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
                        <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 border-l-4 border-l-zinc-500">
                            <div className="font-pixel text-sm text-zinc-400">MISSION_A</div>
                            <div className="font-mono text-xs text-zinc-600">{new Date(data1.created_at || Date.now()).toLocaleDateString()}</div>
                        </div>

                        {/* Agents Stack */}
                        <div className="space-y-4">
                            <AgentCard
                                title="FACIAL_RECOGNITION"
                                icon={Smile}
                                content={data1.facial?.summary || "No data"}
                                className="border-zinc-800 bg-zinc-950/50"
                            />
                            <AgentCard
                                title="VOICE_ANALYSIS"
                                icon={Mic2}
                                content={data1.voice?.summary || "No data"}
                                className="border-zinc-800 bg-zinc-950/50"
                            />
                        </div>
                    </motion.div>

                    {/* Mission B */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
                        <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 border-l-4 border-l-primary/50">
                            <div className="font-pixel text-sm text-primary">MISSION_B</div>
                            <div className="font-mono text-xs text-zinc-600">{new Date(data2.created_at || Date.now()).toLocaleDateString()}</div>
                        </div>

                        {/* Agents Stack */}
                        <div className="space-y-4">
                            <AgentCard
                                title="FACIAL_RECOGNITION"
                                icon={Smile}
                                content={data2.facial?.summary || "No data"}
                                className="border-primary/20 bg-primary/5"
                            />
                            <AgentCard
                                title="VOICE_ANALYSIS"
                                icon={Mic2}
                                content={data2.voice?.summary || "No data"}
                                className="border-primary/20 bg-primary/5"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Comparative Delta Report */}
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12">
                    <Card className="bg-zinc-900/40 border-2 border-zinc-800 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-primary to-zinc-800 opacity-50"></div>
                        <CardHeader className="border-b border-zinc-800/50 bg-zinc-950/30 py-4">
                            <CardTitle className="font-pixel text-lg text-white flex items-center gap-3">
                                <Activity className="h-5 w-5 text-primary" />
                                DELTA_ANALYSIS_REPORT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <RenderDiff val1={data1.voice?.pitch || 0} val2={data2.voice?.pitch || 0} label="PITCH_VARIANCE" unit=" Hz" />
                            <RenderDiff val1={data1.voice?.pace || 0} val2={data2.voice?.pace || 0} label="SPEECH_VELOCITY" unit=" wpm" />
                            <RenderDiff val1={data1.content?.clarity || 0} val2={data2.content?.clarity || 0} label="CONTENT_CLARITY" unit="%" />
                            <RenderDiff val1={data1.content?.persuasion || 0} val2={data2.content?.persuasion || 0} label="PERSUASION_INDEX" unit="%" />
                            <RenderDiff val1={data1.facial?.confidence || 0} val2={data2.facial?.confidence || 0} label="CONFIDENCE_SCORE" unit="%" />
                            <RenderDiff val1={data1.facial?.engagement || 0} val2={data2.facial?.engagement || 0} label="AUDIENCE_ENGAGEMENT" unit="%" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default function ComparisonPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
            </div>
        }>
            <ComparisonContent />
        </Suspense>
    );
}
