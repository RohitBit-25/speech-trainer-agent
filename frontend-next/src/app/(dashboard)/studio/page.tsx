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

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STUDIO_CONFIG = {
    VERSION: '2.4.9',
    TERMINAL_ID: 'STUDIO_TERMINAL_01',
    XP_REWARD: 500,
    METRIC_UPDATE_INTERVAL: 3000,
    TIME_UPDATE_INTERVAL: 1000,
    SCAN_ANIMATION_DURATION: 3,
    PULSE_ANIMATION_DURATION: 2,
    REDIRECT_DELAY: 1000,
    METRICS: {
        CPU: { min: 30, max: 60, label: 'CPU_LOAD' },
        MEMORY: { min: 60, max: 80, label: 'MEM_ALLOC' },
        NETWORK: { min: 80, max: 95, label: 'NET_UPLINK' },
        DISK: { min: 20, max: 60, label: 'DISK_I/O' }
    }
} as const;

const UI_TEXT = {
    header: {
        terminal: STUDIO_CONFIG.TERMINAL_ID,
        network: {
            label: 'NET:',
            status: 'CONNECTED'
        },
        security: {
            label: 'SEC:',
            status: 'ENCRYPTED'
        },
        liveIndicator: 'LIVE'
    },
    sidebar: {
        metrics: 'System Metrics',
        queue: 'Queue',
        nodes: 'Nodes',
        signal: 'Signal',
        terminalHint: 'Awaiting input stream...',
        recentBatches: 'Recent Batches',
        sessionStats: 'Session Stats',
        analyses: 'Analyses',
        avgScore: 'Avg Score'
    },
    main: {
        title: 'UPLINK_MODULE',
        subtitle: 'Awaiting Neural Link Connection'
    },
    footer: {
        version: 'VER',
        environment: 'ENV',
        envStatus: 'SECURE',
        latency: 'LATENCY',
        latencyValue: '12ms',
        poweredBy: 'POWERED BY',
        systemStatus: 'SYSTEM OPERATIONAL',
        branding: [
            { text: 'VAANI', color: 'text-white' },
            { text: 'X', color: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse' }
        ]
    },
    toast: {
        upload: {
            info: 'Initializing system uplink...',
            infoDesc: 'Establishing secure connection.',
            success: 'Mission Accomplished!',
            successDesc: 'Analysis complete.'
        },
        errors: {
            default: {
                title: 'System Failure',
                desc: 'Analysis sequence aborted.'
            },
            network: {
                title: 'Connection Error',
                desc: 'Cannot reach backend server. Please ensure the backend is running on port 8000.'
            },
            timeout: {
                title: 'Timeout Error',
                desc: 'Analysis took too long. Please try with a shorter video.'
            },
            apiKey: {
                title: 'API Configuration Error',
                desc: 'Gemini API key is missing or invalid. Check backend .env file.'
            }
        }
    }
} as const;

const BATCH_DATA = [
    { id: 783, status: 'DONE', score: 87, color: 'green' as const },
    { id: 782, status: 'DONE', score: 92, color: 'primary' as const },
    { id: 781, status: 'DONE', score: 78, color: 'yellow' as const }
] as const;

const SESSION_STATS = {
    analyses: { value: 24, color: 'text-primary' },
    avgScore: { value: 86, color: 'text-secondary' }
} as const;

const ACHIEVEMENTS = {
    firstUpload: 'first_upload',
    perfectPitch: 'perfect_pitch',
    perfectPitchRange: { min: 80, max: 120 }
} as const;

const METRIC_COLORS = {
    primary: 'bg-primary/80',
    secondary: 'bg-secondary/80',
    accent: 'bg-purple-500/80'
} as const;

const STATUS_COLORS = {
    active: 'text-primary border-primary/30 bg-primary/5',
    standby: 'text-zinc-600 border-zinc-800 bg-zinc-950',
    warning: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5'
} as const;

const BATCH_COLORS = {
    green: { bg: 'bg-green-500/10', text: 'text-green-500', bar: 'bg-green-500' },
    primary: { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
    yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', bar: 'bg-yellow-500' }
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// Animated metric bar component
function MetricBar({ label, value, color = "primary" }: { label: string; value: number; color?: "primary" | "secondary" | "accent" }) {
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
                    className={cn("h-full rounded-full", METRIC_COLORS[color])}
                />
            </div>
        </div>
    );
}

// Decorative data node
function DataNode({ label, value, icon: Icon, status = "active" }: { label: string; value: string; icon: any; status?: keyof typeof STATUS_COLORS }) {
    return (
        <div className={cn(
            "border rounded-lg p-3 transition-all duration-300",
            STATUS_COLORS[status]
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
                transition={{ duration: STUDIO_CONFIG.SCAN_ANIMATION_DURATION, repeat: Infinity, ease: "linear" }}
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
        }, STUDIO_CONFIG.TIME_UPDATE_INTERVAL);

        // Animate metrics dynamically
        const metricsInterval = setInterval(() => {
            setMetrics({
                cpu: Math.floor(Math.random() * (STUDIO_CONFIG.METRICS.CPU.max - STUDIO_CONFIG.METRICS.CPU.min)) + STUDIO_CONFIG.METRICS.CPU.min,
                mem: Math.floor(Math.random() * (STUDIO_CONFIG.METRICS.MEMORY.max - STUDIO_CONFIG.METRICS.MEMORY.min)) + STUDIO_CONFIG.METRICS.MEMORY.min,
                net: Math.floor(Math.random() * (STUDIO_CONFIG.METRICS.NETWORK.max - STUDIO_CONFIG.METRICS.NETWORK.min)) + STUDIO_CONFIG.METRICS.NETWORK.min,
                disk: Math.floor(Math.random() * (STUDIO_CONFIG.METRICS.DISK.max - STUDIO_CONFIG.METRICS.DISK.min)) + STUDIO_CONFIG.METRICS.DISK.min
            });
        }, STUDIO_CONFIG.METRIC_UPDATE_INTERVAL);

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
            toast.info(UI_TEXT.toast.upload.info, { description: UI_TEXT.toast.upload.infoDesc });

            const newTaskId = await startAnalysis(file);
            setTaskId(newTaskId);

            const result = await pollAnalysis(newTaskId);

            setResult(result);
            addXP(STUDIO_CONFIG.XP_REWARD);
            unlockAchievement(ACHIEVEMENTS.firstUpload);

            if (result.voice?.pitch && 
                result.voice.pitch > ACHIEVEMENTS.perfectPitchRange.min && 
                result.voice.pitch < ACHIEVEMENTS.perfectPitchRange.max) {
                unlockAchievement(ACHIEVEMENTS.perfectPitch);
            }

            toast.success(UI_TEXT.toast.upload.success, { description: UI_TEXT.toast.upload.successDesc });

            setTimeout(() => {
                router.push("/analysis");
            }, STUDIO_CONFIG.REDIRECT_DELAY);

        } catch (error: any) {
            console.error("Analysis error:", error);
            let errorConfig: { title: string; desc: string } = UI_TEXT.toast.errors.default;

            if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
                errorConfig = UI_TEXT.toast.errors.network;
            } else if (error.message?.includes("timeout")) {
                errorConfig = UI_TEXT.toast.errors.timeout;
            } else if (error.message?.includes("API key")) {
                errorConfig = UI_TEXT.toast.errors.apiKey;
            }

            toast.error(errorConfig.title, { description: errorConfig.desc });
            setIsUploading(false);
            setAnalyzing(false);
            setTaskId(null);
        }
    };

    return (
        <main className="h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-black via-zinc-950 to-black relative overflow-hidden flex flex-col font-mono text-zinc-400">
            {/* ─── ENHANCED SCIFI GRID BACKGROUND ───────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Primary grid with glow */}
                <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:80px_80px]"></div>
                {/* Secondary finer grid */}
                <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.05),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.05),transparent_50%)]"></div>
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_80%,black_100%)]"></div>
                {/* Animated scan line */}
                <ScanLine />
            </div>

            {/* ─── ENHANCED HEADER: STATUS BAR ──────────────────────────────── */}
            <header className="h-16 border-b-2 border-primary/20 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between px-6 z-20 shrink-0 shadow-[0_4px_20px_rgba(251,146,60,0.1)]">
                <div className="flex items-center gap-6">
                    <motion.div
                        className="flex items-center gap-3 text-primary"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: STUDIO_CONFIG.PULSE_ANIMATION_DURATION, repeat: Infinity }}
                    >
                        <div className="relative">
                            <Activity className="h-5 w-5" />
                            <motion.div 
                                className="absolute inset-0 bg-primary/30 blur-md rounded-full"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <span className="text-sm font-bold tracking-[0.25em]">{UI_TEXT.header.terminal}</span>
                    </motion.div>
                    <div className="h-5 w-[2px] bg-gradient-to-b from-transparent via-zinc-700 to-transparent"></div>
                    <div className="flex items-center gap-5 text-[11px] tracking-widest">
                        <motion.div 
                            className="flex items-center gap-2 group cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Wifi className="h-3.5 w-3.5 text-green-500 group-hover:text-green-400 transition-colors" />
                            <span className="text-zinc-500">{UI_TEXT.header.network.label}</span>
                            <span className="text-green-500 font-medium group-hover:text-green-400 transition-colors">{UI_TEXT.header.network.status}</span>
                        </motion.div>
                        <motion.div 
                            className="flex items-center gap-2 group cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Shield className="h-3.5 w-3.5 text-secondary group-hover:text-cyan-400 transition-colors" />
                            <span className="text-zinc-500">{UI_TEXT.header.security.label}</span>
                            <span className="text-secondary font-medium group-hover:text-cyan-400 transition-colors">{UI_TEXT.header.security.status}</span>
                        </motion.div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <motion.div 
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-primary/30 bg-primary/5 backdrop-blur-sm shadow-[0_0_15px_rgba(251,146,60,0.2)]"
                        animate={{ boxShadow: [
                            "0_0_15px_rgba(251,146,60,0.2)",
                            "0_0_25px_rgba(251,146,60,0.4)",
                            "0_0_15px_rgba(251,146,60,0.2)"
                        ]}}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Radio className="h-3.5 w-3.5 text-primary" />
                        </motion.div>
                        <span className="font-pixel text-[11px] text-primary font-bold">{UI_TEXT.header.liveIndicator}</span>
                    </motion.div>
                    <div className="font-pixel text-[11px] text-zinc-500 tabular-nums bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                        {currentTime}
                    </div>
                </div>
            </header>

            {/* ─── ENHANCED MAIN COCKPIT AREA ─────────────────────────────── */}
            <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden relative z-10">

                {/* LEFT COLUMN: Enhanced System Metrics */}
                <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 border-r-2 border-zinc-800/50 pr-6">
                    {/* System Status Panel */}
                    <div className="space-y-4 p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500 mb-3">
                            <Cpu className="w-4 h-4 text-primary" />
                            <span>{UI_TEXT.sidebar.metrics}</span>
                        </div>
                        <MetricBar label={STUDIO_CONFIG.METRICS.CPU.label} value={metrics.cpu} color="primary" />
                        <MetricBar label={STUDIO_CONFIG.METRICS.MEMORY.label} value={metrics.mem} color="secondary" />
                        <MetricBar label={STUDIO_CONFIG.METRICS.NETWORK.label} value={metrics.net} color="accent" />
                        <MetricBar label={STUDIO_CONFIG.METRICS.DISK.label} value={metrics.disk} color="primary" />
                    </div>

                    {/* Data Nodes */}
                    <div className="grid grid-cols-2 gap-3">
                        <DataNode label={UI_TEXT.sidebar.queue} value="001" icon={Database} status="active" />
                        <DataNode label={UI_TEXT.sidebar.nodes} value="04" icon={Zap} status="standby" />
                    </div>

                    {/* Visualizer */}
                    <div className="flex-1 border-2 border-zinc-800/50 rounded-xl bg-zinc-950/40 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-zinc-600 font-medium">{UI_TEXT.sidebar.signal}</div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="w-28 h-28 rounded-full border-2 border-primary/20"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute w-20 h-20 rounded-full border-2 border-secondary/30"
                                animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            />
                            <motion.div 
                                className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(251,146,60,0.8)]"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </div>
                        {/* Grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49%,rgba(63,63,70,0.1)_50%,transparent_51%),linear-gradient(to_bottom,transparent_49%,rgba(63,63,70,0.1)_50%,transparent_51%)] bg-[size:20px_20px]" />
                    </div>

                    {/* Terminal hint */}
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider text-center py-2 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                        <Terminal className="w-3 h-3 inline mr-1.5" />
                        {UI_TEXT.sidebar.terminalHint}
                    </div>
                </div>

                {/* CENTER COLUMN: Enhanced Main Interface */}
                <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center relative">
                    {/* Enhanced Corner Brackets with animated glow */}
                    <motion.div 
                        className="absolute top-0 left-0 w-16 h-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                        <div className="absolute top-0 left-0 h-full w-[3px] bg-gradient-to-b from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                    </motion.div>
                    <motion.div 
                        className="absolute top-0 right-0 w-16 h-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="absolute top-0 right-0 w-full h-[3px] bg-gradient-to-l from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                        <div className="absolute top-0 right-0 h-full w-[3px] bg-gradient-to-b from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                    </motion.div>
                    <motion.div 
                        className="absolute bottom-0 left-0 w-16 h-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                        <div className="absolute bottom-0 left-0 h-full w-[3px] bg-gradient-to-t from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                    </motion.div>
                    <motion.div 
                        className="absolute bottom-0 right-0 w-16 h-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="absolute bottom-0 right-0 w-full h-[3px] bg-gradient-to-l from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                        <div className="absolute bottom-0 right-0 h-full w-[3px] bg-gradient-to-t from-primary via-primary/50 to-transparent shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div>
                    </motion.div>

                    {/* Subtle animated border frame */}
                    <motion.div 
                        className="absolute inset-4 border-2 border-zinc-800/40 rounded-xl pointer-events-none"
                        animate={{ borderColor: ["rgba(39,39,42,0.4)", "rgba(251,146,60,0.2)", "rgba(39,39,42,0.4)"] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    <div className="w-full max-w-2xl space-y-8 relative z-20">
                        {/* Enhanced Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4 mb-12"
                        >
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-12 h-12 rounded-full border-2 border-primary/40 flex items-center justify-center relative shadow-[0_0_20px_rgba(251,146,60,0.3)]"
                                >
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </motion.div>
                            </div>
                            <motion.h1 
                                className="text-5xl md:text-6xl font-bold font-pixel text-white tracking-tighter relative"
                                animate={{ 
                                    textShadow: [
                                        "0 0 20px rgba(251,146,60,0.3), 0 0 40px rgba(251,146,60,0.2)",
                                        "0 0 30px rgba(251,146,60,0.5), 0 0 60px rgba(251,146,60,0.3)",
                                        "0 0 20px rgba(251,146,60,0.3), 0 0 40px rgba(251,146,60,0.2)"
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                {UI_TEXT.main.title}
                            </motion.h1>
                            <div className="flex items-center justify-center gap-3">
                                <motion.div 
                                    className="h-[2px] w-16 bg-gradient-to-r from-transparent via-primary to-transparent"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <p className="text-sm text-primary/80 tracking-[0.35em] uppercase font-medium">
                                    {UI_TEXT.main.subtitle}
                                </p>
                                <motion.div 
                                    className="h-[2px] w-16 bg-gradient-to-l from-transparent via-primary to-transparent"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
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
                <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 border-l-2 border-zinc-800/50 pl-6">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500 mb-2">
                        <Terminal className="w-4 h-4 text-cyan-400" />
                        <span>{UI_TEXT.sidebar.recentBatches}</span>
                    </div>
                    <div className="space-y-3">
                        {BATCH_DATA.map((batch, i) => (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.02, x: -5 }}
                                className="group border-2 border-zinc-800/60 hover:border-zinc-700 rounded-xl p-4 bg-zinc-950/40 hover:bg-zinc-900/50 transition-all cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-zinc-400 font-medium text-sm">BATCH_00{batch.id}</span>
                                    <span className={cn(
                                        "text-[10px] px-2.5 py-1 rounded-full font-medium",
                                        BATCH_COLORS[batch.color].bg,
                                        BATCH_COLORS[batch.color].text
                                    )}>{batch.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${batch.score}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                            className={cn("h-full rounded-full", BATCH_COLORS[batch.color].bar)}
                                        />
                                    </div>
                                    <span className="text-zinc-500 font-pixel text-[11px] min-w-[35px] text-right">{batch.score}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-auto border-t-2 border-zinc-800/50 pt-5 space-y-4">
                        <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">{UI_TEXT.sidebar.sessionStats}</div>
                        <div className="grid grid-cols-2 gap-3">
                            <motion.div 
                                className="text-center p-4 rounded-xl bg-zinc-950/50 border-2 border-zinc-800/50 hover:border-primary/30 transition-all cursor-pointer group backdrop-blur-sm"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div 
                                    className={`text-2xl font-pixel ${SESSION_STATS.analyses.color} group-hover:scale-110 transition-transform`}
                                    animate={{ textShadow: [
                                        "0 0 10px rgba(251,146,60,0.3)",
                                        "0 0 20px rgba(251,146,60,0.5)",
                                        "0 0 10px rgba(251,146,60,0.3)"
                                    ]}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {SESSION_STATS.analyses.value}
                                </motion.div>
                                <div className="text-[10px] text-zinc-600 uppercase mt-2 font-medium">{UI_TEXT.sidebar.analyses}</div>
                            </motion.div>
                            <motion.div 
                                className="text-center p-4 rounded-xl bg-zinc-950/50 border-2 border-zinc-800/50 hover:border-secondary/30 transition-all cursor-pointer group backdrop-blur-sm"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div 
                                    className={`text-2xl font-pixel ${SESSION_STATS.avgScore.color} group-hover:scale-110 transition-transform`}
                                    animate={{ textShadow: [
                                        "0 0 10px rgba(34,211,238,0.3)",
                                        "0 0 20px rgba(34,211,238,0.5)",
                                        "0 0 10px rgba(34,211,238,0.3)"
                                    ]}}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                >
                                    {SESSION_STATS.avgScore.value}
                                </motion.div>
                                <div className="text-[10px] text-zinc-600 uppercase mt-2 font-medium">{UI_TEXT.sidebar.avgScore}</div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── ENHANCED FOOTER: KEYLINE ─────────────────────────────────── */}
            <div className="h-8 border-t border-zinc-800/50 bg-zinc-950/90 flex items-center justify-between px-6 text-[9px] uppercase tracking-widest shrink-0">
                <div className="flex items-center gap-6">
                    <span className="text-zinc-600">{UI_TEXT.footer.version} <span className="text-zinc-500">{STUDIO_CONFIG.VERSION}</span></span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-600">{UI_TEXT.footer.environment} <span className="text-green-500/70">{UI_TEXT.footer.envStatus}</span></span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-600">{UI_TEXT.footer.latency} <span className="text-primary/70">{UI_TEXT.footer.latencyValue}</span></span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-600 flex items-center gap-1.5">
                        {UI_TEXT.footer.poweredBy}
                        <span className="flex items-center gap-0.5 font-pixel">
                            {UI_TEXT.footer.branding.map((part, idx) => (
                                <span key={idx} className={part.color}>{part.text}</span>
                            ))}
                        </span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-green-500"
                    />
                    <span className="text-zinc-600">{UI_TEXT.footer.systemStatus}</span>
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
