"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistory } from "@/lib/api";
import { HistoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, FileVideo, Activity, ArrowRight, GitCompare, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Fix auth access
        const userStr = localStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));

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
        router.push(`/comparison?id1=${taskId}&id2=${taskId}`);
    };

    return (
        <div className="w-full min-h-screen px-4 md:px-6 py-6 md:py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Activity className="h-6 w-6 text-primary" />
                            <h1 className="font-pixel text-4xl text-white tracking-tight">MISSION_LOGS</h1>
                        </div>
                        <p className="font-mono text-zinc-400 text-sm max-w-lg">
                            Review past performance data. Select two logs to initiate comparative analysis.
                        </p>
                    </div>

                    {selectedIds.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="text-right">
                                <div className="font-pixel text-xs text-zinc-500">SELECTION</div>
                                <div className="font-mono text-primary">{selectedIds.length} / 2</div>
                            </div>
                            <Button
                                onClick={handleCompare}
                                disabled={selectedIds.length !== 2}
                                className={cn(
                                    "font-pixel h-12 border-2 transition-all",
                                    selectedIds.length === 2
                                        ? "bg-primary text-black border-primary hover:bg-primary/90 shadow-[4px_4px_0px_rgba(34,197,94,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(34,197,94,1)]"
                                        : "bg-zinc-900 text-zinc-500 border-zinc-700 cursor-not-allowed"
                                )}
                            >
                                <GitCompare className="mr-2 h-4 w-4" />
                                COMPARE
                            </Button>
                        </motion.div>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-64 bg-zinc-900/40 border border-zinc-800 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <FileVideo className="h-16 w-16 text-zinc-800 mx-auto" />
                        <div className="font-pixel text-zinc-600 text-lg">NO_LOGS_FOUND</div>
                        <p className="text-zinc-500 font-mono text-sm">Complete your first training session to generate data.</p>
                        <Button variant="outline" onClick={() => router.push('/practice')}>
                            START_TRAINING
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item, i) => (
                            <motion.div
                                key={item.task_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card
                                    className={cn(
                                        "bg-zinc-900/60 backdrop-blur-sm border-2 transition-all cursor-pointer group relative overflow-hidden",
                                        selectedIds.includes(item.task_id)
                                            ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                                            : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/80"
                                    )}
                                    onClick={() => handleSelect(item.task_id)}
                                >
                                    {/* Selection Indicator */}
                                    <div className={cn(
                                        "absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors z-10",
                                        selectedIds.includes(item.task_id)
                                            ? "bg-primary border-primary"
                                            : "border-zinc-700 group-hover:border-zinc-500"
                                    )}>
                                        {selectedIds.includes(item.task_id) && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                                    </div>

                                    <CardHeader className="pb-3 relative">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <Badge variant="outline" className={cn(
                                                    "font-pixel text-[10px] px-2 py-0.5 border-none",
                                                    item.status === "SUCCESS" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                                )}>
                                                    {item.status}
                                                </Badge>
                                                <CardTitle className="font-mono text-sm text-white truncate max-w-[200px] block" title={item.video_filename}>
                                                    {item.video_filename}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Score Visual */}
                                        <div className="flex items-end gap-3">
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                                    <span>OVERALL_SCORE</span>
                                                    <span>{Math.round(item.total_score || 0)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.total_score || 0}%` }}
                                                        transition={{ duration: 1, delay: 0.2 }}
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            (item.total_score || 0) >= 80 ? "bg-green-500" :
                                                                (item.total_score || 0) >= 60 ? "bg-yellow-500" : "bg-red-500"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-2xl font-pixel text-white">
                                                {item.total_score ? Math.round(item.total_score) : "--"}
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/50">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <Clock className="h-3 w-3" />
                                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div onClick={(e) => e.stopPropagation()} className="pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs font-mono h-8 border-zinc-700 hover:bg-zinc-800 hover:text-white"
                                                onClick={() => handleView(item.task_id)}
                                            >
                                                VIEW_DETAILS <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
