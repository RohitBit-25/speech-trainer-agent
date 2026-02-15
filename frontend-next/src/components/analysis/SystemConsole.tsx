"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Cpu, Activity } from "lucide-react";
import { audioController } from "@/lib/audio";

interface SystemConsoleProps {
    taskId: string | null;
    isAnalyzing: boolean;
    onComplete?: () => void;
}

export function SystemConsole({ taskId, isAnalyzing, onComplete }: SystemConsoleProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!taskId || !isAnalyzing) return;

        // Reset logs on new task
        setLogs(["Creating secure connection...", "Initializing neural link..."]);

        // Connect to SSE stream
        const url = `http://localhost:8000/stream/${taskId}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            const data = event.data;

            if (data === "Analysis Completed.") {
                eventSource.close();
                if (onComplete) onComplete();
            }

            audioController.playTyping();
            setLogs(prev => [...prev, data]);
        };

        eventSource.onerror = (err) => {
            console.error("SSE Error:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [taskId, isAnalyzing, onComplete]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [logs]);

    if (!isAnalyzing && logs.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-3xl mx-auto mt-8 font-mono text-xs"
        >
            <div className="bg-zinc-950 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[300px]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b-4 border-zinc-700">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Terminal className="h-4 w-4" />
                        <span className="font-pixel text-[10px] tracking-wider">SYSTEM_LOGS_V1.0</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-3 w-3 text-primary animate-pulse" />
                            <span className="text-primary">CPU: {Math.floor(Math.random() * 30 + 40)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-primary animate-pulse" />
                            <span className="text-primary">MEM: 64KB</span>
                        </div>
                    </div>
                </div>

                {/* Console Output */}
                <div className="relative flex-1 bg-black p-4 overflow-hidden">
                    {/* Scanlines */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%]"></div>

                    <ScrollArea className="h-full pr-4" ref={scrollRef}>
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-green-500/90 break-all"
                                >
                                    <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}]</span>
                                    <span className="mr-2 text-green-700">{">"}</span>
                                    {log}
                                </motion.div>
                            ))}
                            <div className="animate-pulse text-green-500">_</div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </motion.div>
    );
}
