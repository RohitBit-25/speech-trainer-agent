"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TranscriptProps {
    text?: string;
    isLoading?: boolean;
}

export function Transcript({ text, isLoading }: TranscriptProps) {
    return (
        <Card className="h-full flex flex-col border-border/50">
            <CardHeader className="py-3 px-4 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Transcript
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[200px]">
                <ScrollArea className="h-full w-full absolute inset-0">
                    <div className="p-4 text-sm font-mono leading-relaxed text-muted-foreground">
                        {isLoading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 w-3/4 bg-muted rounded"></div>
                                <div className="h-4 w-1/2 bg-muted rounded"></div>
                                <div className="h-4 w-5/6 bg-muted rounded"></div>
                            </div>
                        ) : text ? (
                            text
                        ) : (
                            <span className="italic opacity-50">No transcript available.</span>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
