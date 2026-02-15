import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    src?: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
    if (!src) {
        return (
            <Card className="aspect-video w-full flex flex-col items-center justify-center bg-zinc-900 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                <div className="text-zinc-500 font-pixel text-xs animate-pulse">NO_SIGNAL</div>
                <div className="mt-2 text-[10px] text-zinc-600 font-mono">WAITING_FOR_INPUT...</div>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden bg-black border-4 border-primary shadow-[10px_10px_0px_rgba(0,0,0,0.5)] group">
            {/* Monitor Frame UI */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-900 border-b-4 border-primary z-10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-pixel text-[10px] text-primary tracking-widest">VISUAL_FEED_01</span>
                </div>
                <div className="font-mono text-[10px] text-zinc-400">REC: [ACTIVE]</div>
            </div>

            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

            <div className="pt-8 h-full w-full relative">
                <video
                    className="w-full h-full aspect-video object-contain"
                    controls
                    src={src}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Corner Accents */}
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary z-10 opacity-50"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary z-10 opacity-50"></div>
        </Card>
    );
}
