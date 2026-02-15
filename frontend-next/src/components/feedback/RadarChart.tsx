import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crosshair } from "lucide-react";

interface ChartData {
    subject: string;
    A: number;
    fullMark: number;
}

interface FeedbackRadarChartProps {
    data: ChartData[];
}

export function FeedbackRadarChart({ data }: FeedbackRadarChartProps) {
    return (
        <Card className="h-full bg-zinc-900 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
            {/* Retro grid background */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            <CardHeader className="py-2 px-4 border-b-4 border-zinc-700 bg-black/40 flex flex-row items-center justify-between z-10">
                <CardTitle className="text-xs font-pixel text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <Crosshair className="h-4 w-4 text-green-500 animate-spin-slow" />
                    PERFORMANCE_RADAR
                </CardTitle>
                <div className="text-[10px] font-mono text-zinc-600">TARGET_LOCK: ACTIVE</div>
            </CardHeader>
            <CardContent className="h-[300px] flex-1 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'var(--font-pixel)' }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 5]}
                            tick={{ fill: '#52525b', fontSize: 10 }}
                            axisLine={false}
                        />
                        <Radar
                            name="Score"
                            dataKey="A"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="#22c55e"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
