import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, AlertOctagon, Lightbulb } from "lucide-react";

interface FeedbackPointsProps {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export function FeedbackPoints({ strengths, weaknesses, suggestions }: FeedbackPointsProps) {
    return (
        <div className="space-y-6">

            {/* Strengths Module */}
            <Card className="bg-zinc-900 border-4 border-green-900/50 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                <CardHeader className="py-2 px-4 border-b-4 border-green-900/50 bg-green-500/10">
                    <CardTitle className="text-xs font-pixel flex items-center gap-2 text-green-500 uppercase tracking-wider">
                        <CheckSquare className="h-4 w-4" />
                        SYSTEM_OPTIMIZATIONS
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <ul className="space-y-2">
                        {strengths.map((item, i) => (
                            <li key={i} className="text-xs font-mono text-zinc-400 flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 bg-green-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Weaknesses Module */}
            <Card className="bg-zinc-900 border-4 border-red-900/50 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                <CardHeader className="py-2 px-4 border-b-4 border-red-900/50 bg-red-500/10">
                    <CardTitle className="text-xs font-pixel flex items-center gap-2 text-red-500 uppercase tracking-wider">
                        <AlertOctagon className="h-4 w-4" />
                        CRITICAL_WARNINGS
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <ul className="space-y-2">
                        {weaknesses.map((item, i) => (
                            <li key={i} className="text-xs font-mono text-zinc-400 flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 bg-red-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Suggestions Module */}
            <Card className="bg-zinc-900 border-4 border-yellow-900/50 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                <CardHeader className="py-2 px-4 border-b-4 border-yellow-900/50 bg-yellow-500/10">
                    <CardTitle className="text-xs font-pixel flex items-center gap-2 text-yellow-500 uppercase tracking-wider">
                        <Lightbulb className="h-4 w-4" />
                        PATCH_NOTES
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <ul className="space-y-2">
                        {suggestions.map((item, i) => (
                            <li key={i} className="text-xs font-mono text-zinc-400 flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 bg-yellow-500 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
