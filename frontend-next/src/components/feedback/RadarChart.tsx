"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-center">Performance Chart</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Radar
                            name="Score"
                            dataKey="A"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
