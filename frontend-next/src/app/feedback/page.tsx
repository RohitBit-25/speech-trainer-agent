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

    // Transform scores for Radar Chart
    const scores = result.feedback.scores;
    const radarData = Object.keys(scores).map((key) => ({
        subject: key.split(" ")[0], // Shorten name for chart
        A: scores[key],
        fullMark: 5
    }));

    return (
        <div className="container py-6 space-y-6 max-w-screen-2xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detailed Feedback</h1>
                        <p className="text-muted-foreground">Comprehensive breakdown of your performance.</p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Left Col: Radar Chart */}
                <div className="lg:col-span-1 h-[400px]">
                    <FeedbackRadarChart data={radarData} />
                </div>

                {/* Middle Col: Summary */}
                <div className="lg:col-span-1">
                    <EvaluationSummary
                        scores={result.feedback.scores}
                        totalScore={result.feedback.total_score}
                        averageScore={result.feedback.total_score / 5} // Approximate or calculate from scores
                        interpretation={result.feedback.interpretation}
                        summary={result.feedback.feedback_summary}
                    />
                </div>

                {/* Right Col: Details */}
                <div className="lg:col-span-1">
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
