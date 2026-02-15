"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistory } from "@/lib/api";
import { HistoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, FileVideo, Activity, ArrowRight, GitCompare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistory();
                setHistory(data);
            } catch (error) {
                console.error("Failed to load history:", error);
                toast.error("System Error", { description: "Could not retrieve mission logs." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleSelect = (taskId: string) => {
        if (selectedIds.includes(taskId)) {
            setSelectedIds(prev => prev.filter(id => id !== taskId));
        } else {
            if (selectedIds.length < 2) {
                setSelectedIds(prev => [...prev, taskId]);
            } else {
                toast.warning("Limit Reached", { description: "Select only 2 missions for comparison." });
            }
        }
    };

    const handleCompare = () => {
        if (selectedIds.length === 2) {
            router.push(`/comparison?id1=${selectedIds[0]}&id2=${selectedIds[1]}`);
        }
    };

    const handleView = (taskId: string) => {
        // ideally we should load this into the store and go to /analysis
        // but our current /analysis page relies on the store state being set.
        // For now, let's just go to comparison with itself? Or implement a "Load" action.
        // Or better, make /analysis accept a query param ?taskId=...
        // But for this task, the primary goal is Comparison Mode.
        router.push(`/comparison?id1=${taskId}&id2=${taskId}`); // View single (compare with self)
    };

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8 border-b-4 border-zinc-700 pb-4">
                <div>
                    <h1 className="text-3xl font-pixel text-white mb-2">MISSION_ARCHIVES</h1>
                    <p className="font-mono text-zinc-400 text-sm">Select 2 missions to initiate comparative analysis.</p>
                </div>
                {selectedIds.length === 2 && (
                    <Button
                        onClick={handleCompare}
                        className="font-pixel bg-primary text-black hover:bg-primary/90 h-12 border-2 border-primary shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-bounce"
                    >
                        <GitCompare className="mr-2 h-4 w-4" />
                        COMPARE_MISSIONS
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((item) => (
                        <Card
                            key={item.task_id}
                            className={cn(
                                "bg-zinc-900 border-4 transition-all cursor-pointer hover:translate-y-[-4px]",
                                selectedIds.includes(item.task_id)
                                    ? "border-primary shadow-[8px_8px_0px_rgba(34,197,94,0.3)]"
                                    : "border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] hover:border-zinc-500"
                            )}
                            onClick={() => handleSelect(item.task_id)}
                        >
                            <CardHeader className="bg-zinc-950/50 border-b-2 border-zinc-800 py-3">
                                <CardTitle className="font-mono text-sm text-zinc-300 flex justify-between items-center">
                                    <span className="truncate max-w-[180px]" title={item.video_filename}>
                                        {item.video_filename}
                                    </span>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        item.status === "SUCCESS" ? "bg-green-500" : "bg-red-500"
                                    )} title={item.status} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileVideo className="h-3 w-3" />
                                        LOG #{item.id}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-pixel text-zinc-400">PERFORMANCE</span>
                                        <span className="text-xl font-bold font-mono text-primary">
                                            {item.total_score ? Math.round(item.total_score) : "--"}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${item.total_score || 0}%` }}
                                        />
                                    </div>
                                </div>

                                {item.feedback_summary && (
                                    <div className="text-xs text-zinc-400 line-clamp-2 bg-zinc-950 p-2 rounded border border-zinc-800 font-mono">
                                        {item.feedback_summary}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
