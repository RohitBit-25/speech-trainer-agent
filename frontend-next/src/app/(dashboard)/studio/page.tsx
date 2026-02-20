"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Zap, Shield, Radio, Cpu, Wifi, Database, Terminal, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { VideoDropzone } from "@/components/upload/VideoDropzone";
import { SystemConsole } from "@/components/analysis/SystemConsole";
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { QuickHelp } from '@/components/tutorial/HelpTooltip';
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { startAnalysis, pollAnalysis } from "@/lib/api";
import { cn } from "@/lib/utils";

// Animated metric bar component
function MetricBar({ label, value, color = "primary" }: { label: string; value: number; color?: "primary" | "secondary" | "accent" }) {
    const colorClasses = {
        primary: "bg-primary/80",
        secondary: "bg-secondary/80",
        accent: "bg-purple-500/80"
    };
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-600 uppercase tracking-wider">{label}</span>
                <span className="font-pixel text-zinc-500">{value}%</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", colorClasses[color])}
                />
            </div>
        </div>
    );
}

// Decorative data node
function DataNode({ label, value, icon: Icon, status = "active" }: { label: string; value: string; icon: any; status?: "active" | "standby" | "warning" }) {
    const statusColors = {
        active: "text-primary border-primary/30 bg-primary/5",
        standby: "text-zinc-600 border-zinc-800 bg-zinc-950",
        warning: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5"
    };
    return (
        <div className={cn(
            "border rounded-lg p-3 transition-all duration-300",
            statusColors[status]
        )}>
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3 h-3" />
                <span className="text-[9px] uppercase tracking-widest opacity-70">{label}</span>
            </div>
            <div className="font-pixel text-sm">{value}</div>
        </div>
    );
}

// Scanning line animation
function ScanLine() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}

export default function StudioPage() {
    const [showTutorial, setShowTutorial] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");
    const [metrics, setMetrics] = useState({ cpu: 42, mem: 68, net: 85, disk: 34 });

    const setAnalyzing = useAppStore((state) => state.setAnalyzing);
    const setResult = useAppStore((state) => state.setResult);
    const setVideoFile = useAppStore((state) => state.setVideoFile);
    const addXP = useAppStore((state) => state.addXP);
    const unlockAchievement = useAppStore((state) => state.unlockAchievement);
    const router = useRouter();

    useEffect(() => {
        setCurrentTime(new Date().toISOString().split('T')[1].split('.')[0] + " UTC");

        const timeInterval = setInterval(() => {
            setCurrentTime(new Date().toISOString().split('T')[1].split('.')[0] + " UTC");
        }, 1000);

        // Animate metrics
        const metricsInterval = setInterval(() => {
            setMetrics({
                cpu: Math.floor(Math.random() * 30) + 30,
                mem: Math.floor(Math.random() * 20) + 60,
                net: Math.floor(Math.random() * 15) + 80,
                disk: Math.floor(Math.random() * 40) + 20
            });
        }, 3000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(metricsInterval);
        };
    }, []);

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setAnalyzing(true);
        setVideoFile(file);
        setTaskId(null);

        try {
            toast.info("Initializing system uplink...", { description: "Establishing secure connection." });

            const newTaskId = await startAnalysis(file);
            setTaskId(newTaskId);

            const result = await pollAnalysis(newTaskId);

            setResult(result);
            addXP(500);
            unlockAchievement('first_upload');

            if (result.voice?.pitch && result.voice.pitch > 80 && result.voice.pitch < 120) {
                unlockAchievement('perfect_pitch');
            }

            toast.success("Mission Accomplished!", { description: "Analysis complete." });

            setTimeout(() => {
                router.push("/analysis");
            }, 1000);

        } catch (error: any) {
            console.error("Analysis error:", error);
            let errorTitle = "System Failure";
            let errorDescription = "Analysis sequence aborted.";

            if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
                errorTitle = "Connection Error";
                errorDescription = "Cannot reach backend server. Please ensure the backend is running on port 8000.";
            } else if (error.message?.includes("timeout")) {
                errorTitle = "Timeout Error";
                errorDescription = "Analysis took too long. Please try with a shorter video.";
            } else if (error.message?.includes("API key")) {
                errorTitle = "API Configuration Error";
                errorDescription = "Gemini API key is missing or invalid. Check backend .env file.";
            }

            toast.error(errorTitle, { description: errorDescription });
            setIsUploading(false);
            setAnalyzing(false);
            setTaskId(null);
        }
    };

    return (
        <main className="h-[calc(100vh-4rem)] w-full bg-black relative overflow-hidden flex flex-col font-mono text-zinc-400">
            {/* ─── ENHANCED SCIFI GRID BACKGROUND ───────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Primary grid */}
                <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                {/* Secondary finer grid */}
                <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                {/* Radial vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_70%,black_100%)]"></div>
                {/* Animated scan line */}
                <ScanLine />
            </div>

            {/* ─── ENHANCED HEADER: STATUS BAR ──────────────────────────────── */}
            <header className="h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <motion.div
                        className="flex items-center gap-2 text-primary"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="relative">
                            <Activity className="h-4 w-4" />
                            <div className="absolute inset-0 bg-primary/50 blur-sm rounded-full" />
                        </div>
                        <span className="text-xs font-bold tracking-[0.2em]">STUDIO_TERMINAL_01</span>
                    </motion.div>
                    <div className="h-4 w-[1px] bg-zinc-800"></div>
                    <div className="flex items-center gap-4 text-[10px] tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <Wifi className="h-3 w-3 text-green-500" />
                            <span className="text-zinc-500">NET:</span>
                            <span className="text-green-500 font-medium">CONNECTED</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Shield className="h-3 w-3 text-secondary" />
                            <span className="text-zinc-500">SEC:</span>
                            <span className="text-secondary font-medium">ENCRYPTED</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/50">
                        <Radio className="h-3 w-3 text-primary animate-pulse" />
                        <span className="font-pixel text-[10px] text-zinc-400">LIVE</span>
                    </div>
                    <div className="font-pixel text-[10px] text-zinc-500 tabular-nums">
                        {currentTime}
                    </div>
                </div>
            </header>

            {/* ─── ENHANCED MAIN COCKPIT AREA ─────────────────────────────── */}
            <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden relative z-10">

                {/* LEFT COLUMN: Enhanced System Metrics */}
                <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 border-r border-zinc-800/50 pr-6">
                    {/* System Status Panel */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 mb-3">
                            <Cpu className="w-3 h-3" />
                            <span>System Metrics</span>
                        </div>
                        <MetricBar label="CPU_LOAD" value={metrics.cpu} color="primary" />
                        <MetricBar label="MEM_ALLOC" value={metrics.mem} color="secondary" />
                        <MetricBar label="NET_UPLINK" value={metrics.net} color="accent" />
                        <MetricBar label="DISK_I/O" value={metrics.disk} color="primary" />
                    </div>

                    {/* Data Nodes */}
                    <div className="grid grid-cols-2 gap-2">
                        <DataNode label="Queue" value="001" icon={Database} status="active" />
                        <DataNode label="Nodes" value="04" icon={Zap} status="standby" />
                    </div>

                    {/* Visualizer */}
                    <div className="flex-1 border border-zinc-800/50 rounded-lg bg-zinc-950/30 relative overflow-hidden">
                        <div className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-zinc-700">Signal</div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="w-24 h-24 rounded-full border border-primary/20"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute w-16 h-16 rounded-full border border-secondary/30"
                                animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            />
                            <div className="absolute w-2 h-2 bg-primary rounded-full" />
                        </div>
                        {/* Grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49%,rgba(63,63,70,0.1)_50%,transparent_51%),linear-gradient(to_bottom,transparent_49%,rgba(63,63,70,0.1)_50%,transparent_51%)] bg-[size:20px_20px]" />
                    </div>

                    {/* Terminal hint */}
                    <div className="text-[9px] text-zinc-700 uppercase tracking-wider text-center">
                        <Terminal className="w-3 h-3 inline mr-1" />
                        Awaiting input stream...
                    </div>
                </div>

                {/* CENTER COLUMN: Enhanced Main Interface */}
                <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center relative">
                    {/* Enhanced Corner Brackets with glow */}
                    <div className="absolute top-0 left-0 w-12 h-12">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/50 to-transparent"></div>
                        <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-primary/50 to-transparent"></div>
                    </div>
                    <div className="absolute top-0 right-0 w-12 h-12">
                        <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary/50 to-transparent"></div>
                        <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-primary/50 to-transparent"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-12 h-12">
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-primary/50 to-transparent"></div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-12 h-12">
                        <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary/50 to-transparent"></div>
                        <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-primary/50 to-transparent"></div>
                    </div>

                    {/* Subtle border frame */}
                    <div className="absolute inset-4 border border-zinc-800/30 rounded-lg pointer-events-none" />

                    <div className="w-full max-w-2xl space-y-8 relative z-20">
                        {/* Enhanced Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-3 mb-12"
                        >
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center"
                                >
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </motion.div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold font-pixel text-white tracking-tighter drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                                UPLINK_MODULE
                            </h1>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
                                <p className="text-xs text-primary/70 tracking-[0.3em] uppercase font-medium">
                                    Awaiting Neural Link Connection
                                </p>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50"></div>
                            </div>
                        </motion.div>

                        <VideoDropzone onUpload={handleUpload} isUploading={isUploading} />

                        <AnimatePresence>
                            {isUploading && taskId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-8 border-t border-zinc-800/50 pt-8"
                                >
                                    <SystemConsole taskId={taskId} isAnalyzing={isUploading} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT COLUMN: Enhanced Activity Log */}
                <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 border-l border-zinc-800/50 pl-6">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
                        <Terminal className="w-3 h-3" />
                        <span>Recent Batches</span>
                    </div>
                    <div className="space-y-3">
                        {[
                            { id: 783, status: "DONE", score: 87, color: "green" },
                            { id: 782, status: "DONE", score: 92, color: "primary" },
                            { id: 781, status: "DONE", score: 78, color: "yellow" },
                        ].map((batch, i) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group border border-zinc-800/50 hover:border-zinc-700 rounded-lg p-3 bg-zinc-950/30 hover:bg-zinc-900/30 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-500 font-medium">BATCH_00{batch.id}</span>
                                    <span className={cn(
                                        "text-[9px] px-2 py-0.5 rounded-full",
                                        batch.color === "green" && "bg-green-500/10 text-green-500",
                                        batch.color === "primary" && "bg-primary/10 text-primary",
                                        batch.color === "yellow" && "bg-yellow-500/10 text-yellow-500"
                                    )}>{batch.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${batch.score}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                            className={cn(
                                                "h-full rounded-full",
                                                batch.color === "green" && "bg-green-500",
                                                batch.color === "primary" && "bg-primary",
                                                batch.color === "yellow" && "bg-yellow-500"
                                            )}
                                        />
                                    </div>
                                    <span className="text-zinc-600 font-pixel text-[10px]">{batch.score}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-auto border-t border-zinc-800/50 pt-4 space-y-3">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600">Session Stats</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 rounded bg-zinc-950/50 border border-zinc-800/30">
                                <div className="text-lg font-pixel text-primary">24</div>
                                <div className="text-[9px] text-zinc-600 uppercase">Analyses</div>
                            </div>
                            <div className="text-center p-2 rounded bg-zinc-950/50 border border-zinc-800/30">
                                <div className="text-lg font-pixel text-secondary">86</div>
                                <div className="text-[9px] text-zinc-600 uppercase">Avg Score</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── ENHANCED FOOTER: KEYLINE ─────────────────────────────────── */}
            <div className="h-8 border-t border-zinc-800/50 bg-zinc-950/90 flex items-center justify-between px-6 text-[9px] uppercase tracking-widest shrink-0">
                <div className="flex items-center gap-6">
                    <span className="text-zinc-600">VER <span className="text-zinc-500">2.4.9</span></span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-600">ENV <span className="text-green-500/70">SECURE</span></span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-600">LATENCY <span className="text-primary/70">12ms</span></span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-600 flex items-center gap-1.5">
                        POWERED BY
                        <span className="flex items-center gap-0.5 font-pixel">
                            <span className="text-white">VA</span>
                            <span className="text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.8)]">AN</span>
                            <span className="text-white">I</span>
                            <span className="text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.8)] animate-pulse">X</span>
                        </span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-green-500"
                    />
                    <span className="text-zinc-600">SYSTEM OPERATIONAL</span>
                </div>
            </div>
            {/* Tutorial Modal */}
            <TutorialModal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                mode="studio"
            />
        </main>
    );
}
