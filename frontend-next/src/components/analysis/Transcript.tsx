import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface TranscriptProps {
    text?: string;
    isLoading?: boolean;
}

export function Transcript({ text, isLoading }: TranscriptProps) {
    return (
        <Card className="h-full flex flex-col bg-zinc-950 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
            <CardHeader className="py-2 px-4 border-b-4 border-zinc-700 bg-zinc-900 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-pixel text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <Terminal className="h-3 w-3 text-green-500" />
                    COMM_LOGS
                </CardTitle>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-600 rounded-sm"></div>
                    <div className="w-2 h-2 bg-zinc-600 rounded-sm"></div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[200px] bg-black/50">
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
                <ScrollArea className="h-full w-full absolute inset-0">
                    <div className="p-4 text-sm font-mono leading-relaxed text-green-400/90 whitespace-pre-wrap">
                        {isLoading ? (
                            <div className="space-y-2 animate-pulse">
                                <span className="inline-block w-20 h-4 bg-green-500/20 mr-2"></span>
                                <span className="inline-block w-40 h-4 bg-green-500/20"></span>
                                <div className="h-4 w-3/4 bg-green-500/10 rounded"></div>
                            </div>
                        ) : text ? (
                            <>
                                <span className="text-zinc-500 mr-2 select-none">$</span>
                                {text}
                                <span className="animate-blink inline-block w-2 h-4 bg-green-500 ml-1 align-middle"></span>
                            </>
                        ) : (
                            <span className="italic opacity-50 text-zinc-500">
                                <span className="text-zinc-500 mr-2 select-none">$</span>
                                NO_DATA_RECEIVED...
                            </span>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
