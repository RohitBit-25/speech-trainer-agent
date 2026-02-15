"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface FeedbackPointsProps {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export function FeedbackPoints({ strengths, weaknesses, suggestions }: FeedbackPointsProps) {
    return (
        <div className="space-y-6">
            <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Strengths
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {strengths.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Weaknesses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {weaknesses.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <Lightbulb className="h-5 w-5" />
                        Suggestions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {suggestions.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
