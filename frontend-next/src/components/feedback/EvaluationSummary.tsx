"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EvaluationSummaryProps {
    scores: Record<string, number>;
    totalScore: number;
    averageScore: number;
    interpretation: string;
    summary: string;
}

export function EvaluationSummary({ scores, totalScore, averageScore, interpretation, summary }: EvaluationSummaryProps) {
    return (
        <Card className="h-full border-border/50">
            <CardHeader>
                <CardTitle>Evaluation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {Object.entries(scores).map(([criterion, score]) => (
                        <div key={criterion} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{criterion}</span>
                                <span className="font-mono">{score}/5</span>
                            </div>
                            <Progress value={(score / 5) * 100} className="h-2" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{totalScore}/25</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Score</div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{averageScore.toFixed(2)}/5</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Average</div>
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <h4 className="font-semibold text-sm">Overall Assessment</h4>
                    <p className="text-sm font-medium text-primary">{interpretation}</p>
                    <div className="text-sm text-muted-foreground bg-muted/10 p-3 rounded-md italic border-l-2 border-primary">
                        "{summary}"
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
