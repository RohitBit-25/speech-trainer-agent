"use client";

import { useEffect } from "react";
import { FeedbackRadarChart } from "@/components/feedback/RadarChart";
import { EvaluationSummary } from "@/components/feedback/EvaluationSummary";
import { FeedbackPoints } from "@/components/feedback/FeedbackPoints";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function FeedbackPage() {
    const router = useRouter();
    const result = useAppStore((state) => state.result);

    useEffect(() => {
        if (!result) {
            router.push("/");
        }
    }, [result, router]);

    if (!result) return null;

    if (!result.feedback) {
        return (
            <div className="container py-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-pixel text-red-500 mb-4">SYSTEM_ERROR: DATA_CORRUPTED</h1>
                <p className="font-mono text-zinc-400 mb-8 max-w-md">
                    The analysis module failed to generate a complete diagnostic report. Partial data may be missing.
                </p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/studio')}
                    className="font-pixel border-zinc-700 hover:bg-zinc-800"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    RETURN_TO_BASE
                </Button>
            </div>
        );
    }

    // Transform scores for Radar Chart
    const scores = result.feedback.scores;
    const radarData = Object.keys(scores).map((key) => ({
        subject: key.split(" ")[0], // Shorten name for chart
        A: scores[key],
        fullMark: 5
    }));

    return (
        <div className="container py-8 space-y-8 max-w-screen-2xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-4 border-zinc-700 pb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="font-pixel text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        BACK_TO_HITCH
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-pixel text-white flex items-center gap-2">
                            SYSTEM_DIAGNOSTICS
                            <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
                        </h1>
                        <p className="text-xs font-mono text-zinc-500 mt-1">
                            LOG_ID: <span className="text-zinc-300">#EVAL_{Date.now().toString().slice(-6)}</span>
                        </p>
                    </div>
                </div>
                <Button variant="outline" className="font-pixel text-xs border-2 border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black">
                    <Download className="mr-2 h-4 w-4" />
                    EXPORT_LOGS
                </Button>
            </div>

            {/* Diagnostics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Left Col: Radar Chart */}
                <div className="lg:col-span-1 h-[450px]">
                    <FeedbackRadarChart data={radarData} />
                </div>

                {/* Middle Col: Summary */}
                <div className="lg:col-span-1 h-full">
                    <EvaluationSummary
                        scores={result.feedback.scores}
                        totalScore={result.feedback.total_score}
                        averageScore={result.feedback.total_score / 5}
                        interpretation={result.feedback.interpretation}
                        summary={result.feedback.feedback_summary}
                    />
                </div>

                {/* Right Col: Details (Scrollable if needed) */}
                <div className="lg:col-span-1 h-full">
                    <FeedbackPoints
                        strengths={result.strengths}
                        weaknesses={result.weaknesses}
                        suggestions={result.suggestions}
                    />
                </div>
            </div>
        </div>
    );
}
