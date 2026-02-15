import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
    title: string;
    icon: LucideIcon;
    content?: string;
    isLoading?: boolean;
    className?: string; // Expecting border color classes to color-code the modules
}

export function AgentCard({ title, icon: Icon, content, isLoading, className }: AgentCardProps) {
    return (
        <Card className={cn(
            "flex flex-col h-full bg-zinc-900 border-4 shadow-[6px_6px_0px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1",
            className || "border-zinc-700"
        )}>
            <CardHeader className="py-2 px-3 border-b-4 border-inherit bg-black/20">
                <CardTitle className="text-xs font-pixel tracking-wider flex items-center gap-2 uppercase text-zinc-300">
                    <Icon className="h-4 w-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1">
                <div className="font-mono text-sm leading-relaxed text-zinc-300">
                    {isLoading ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-3 w-full bg-zinc-800 rounded-none mb-1"></div>
                            <div className="h-3 w-2/3 bg-zinc-800 rounded-none"></div>
                        </div>
                    ) : (
                        content || <span className="text-zinc-600 text-xs">AWAITING_ANALYSIS...</span>
                    )}
                </div>
            </CardContent>

            {/* Retro Status Bar footer */}
            <div className="px-3 py-1 bg-black/40 border-t-2 border-dashed border-inherit flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span>STATUS: {isLoading ? "SCANNING..." : "COMPLETE"}</span>
                <div className="flex gap-0.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={cn("w-1 h-2", isLoading ? "bg-zinc-700 animate-pulse" : "bg-current opacity-50")} />
                    ))}
                </div>
            </div>
        </Card>
    );
}
