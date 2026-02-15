"use client";

import { FeedbackRadarChart } from "@/components/feedback/RadarChart";
import { EvaluationSummary } from "@/components/feedback/EvaluationSummary";
import { FeedbackPoints } from "@/components/feedback/FeedbackPoints";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
    const router = useRouter();

    // Mock data
    const evaluationData = {
        scores: {
            "Content & Organization": 4,
            "Delivery & Vocal": 3.5,
            "Body Language": 4.5,
            "Engagement": 3,
            "Clarity": 5
        },
        totalScore: 20,
        averageScore: 4.0,
        interpretation: "Great job! Your content is well-structured and clear.",
        summary: "Strong opening and clear message. Work on vocal variety to keep the audience engaged throughout."
    };

    const radarData = [
        { subject: 'Content', A: 4, fullMark: 5 },
        { subject: 'Delivery', A: 3.5, fullMark: 5 },
        { subject: 'Body Lang', A: 4.5, fullMark: 5 },
        { subject: 'Engagement', A: 3, fullMark: 5 },
        { subject: 'Clarity', A: 5, fullMark: 5 },
    ];

    const strengths = [
        "Used effective pauses",
        "Clear problem statement",
        "Good eye contact"
    ];

    const weaknesses = [
        "Monotone voice in middle section",
        "Slight swaying"
    ];

    const suggestions = [
        "Try to vary your pitch for emphasis",
        "Plant your feet firmly to avoid swaying"
    ];

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
                        scores={evaluationData.scores}
                        totalScore={evaluationData.totalScore}
                        averageScore={evaluationData.averageScore}
                        interpretation={evaluationData.interpretation}
                        summary={evaluationData.summary}
                    />
                </div>

                {/* Right Col: Details */}
                <div className="lg:col-span-1">
                    <FeedbackPoints
                        strengths={strengths}
                        weaknesses={weaknesses}
                        suggestions={suggestions}
                    />
                </div>
            </div>
        </div>
    );
}
