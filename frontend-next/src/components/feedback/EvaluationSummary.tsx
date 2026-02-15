import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu } from "lucide-react";

interface EvaluationSummaryProps {
    scores: Record<string, number>;
    totalScore: number;
    averageScore: number;
    interpretation: string;
    summary: string;
}

export function EvaluationSummary({ scores, totalScore, averageScore, interpretation, summary }: EvaluationSummaryProps) {
    return (
        <Card className="h-full bg-zinc-900 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex flex-col">
            <CardHeader className="py-2 px-4 border-b-4 border-zinc-700 bg-black/40">
                <CardTitle className="text-xs font-pixel text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <Cpu className="h-4 w-4 text-orange-500" />
                    SYSTEM_EVALUATION
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 p-6">
                <div className="space-y-4">
                    {Object.entries(scores).map(([criterion, score]) => (
                        <div key={criterion} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-mono w-full text-zinc-400 uppercase">
                                <span>{criterion.split(" ")[0]}</span>
                                <span className={score >= 4 ? "text-green-400" : score >= 3 ? "text-yellow-400" : "text-red-400"}>
                                    {score}/5
                                </span>
                            </div>
                            <Progress
                                value={(score / 5) * 100}
                                className="h-3 rounded-none bg-zinc-800 border-2 border-zinc-700"
                                indicatorClassName={score >= 4 ? "bg-green-500" : score >= 3 ? "bg-yellow-500" : "bg-red-500"}
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-dashed border-zinc-700">
                    <div className="text-center p-2 bg-black/40 border-2 border-zinc-700">
                        <div className="text-xl font-pixel text-primary">{totalScore}</div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Total Score</div>
                    </div>
                    <div className="text-center p-2 bg-black/40 border-2 border-zinc-700">
                        <div className="text-xl font-pixel text-primary">{averageScore.toFixed(1)}</div>
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">AVG Rating</div>
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-pixel border border-primary/50">
                        ASSESSMENT_LOG
                    </div>
                    <p className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide">{interpretation}</p>
                    <div className="text-xs font-mono text-zinc-500 bg-black/40 p-3 border-l-4 border-primary italic">
                        &quot;{summary}&quot;
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
