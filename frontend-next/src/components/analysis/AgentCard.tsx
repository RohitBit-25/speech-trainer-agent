"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
    title: string;
    icon: LucideIcon;
    content?: string;
    isLoading?: boolean;
    className?: string;
}

export function AgentCard({ title, icon: Icon, content, isLoading, className }: AgentCardProps) {
    return (
        <Card className={cn("flex flex-col h-full border-border/50 transition-all hover:border-primary/50", className)}>
            <CardHeader className="py-3 px-4 border-b bg-muted/10">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm leading-relaxed text-muted-foreground">
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-5/6 bg-muted rounded"></div>
                        <div className="h-4 w-4/5 bg-muted rounded"></div>
                    </div>
                ) : (
                    content || <span className="italic opacity-50">Analysis pending...</span>
                )}
            </CardContent>
        </Card>
    );
}
