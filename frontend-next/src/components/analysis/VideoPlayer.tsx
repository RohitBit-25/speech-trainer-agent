"use client";

import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
    src?: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
    if (!src) {
        return (
            <Card className="aspect-video w-full flex items-center justify-center bg-muted/50 border-2 border-dashed">
                <p className="text-muted-foreground">No video loaded</p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden bg-black border-primary/20 shadow-lg shadow-primary/5">
            <video
                className="w-full h-full aspect-video object-contain"
                controls
                src={src}
            >
                Your browser does not support the video tag.
            </video>
        </Card>
    );
}
