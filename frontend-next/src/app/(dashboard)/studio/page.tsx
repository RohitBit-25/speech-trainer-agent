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
            <header className="h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <motion.div
                        className="flex items-center gap-2 text-primary"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: STUDIO_CONFIG.PULSE_ANIMATION_DURATION, repeat: Infinity }}
                    >
                        <div className="relative">
                            <Activity className="h-4 w-4" />
                            <div className="absolute inset-0 bg-primary/50 blur-sm rounded-full" />
                        </div>
                        <span className="text-xs font-bold tracking-[0.2em]">{UI_TEXT.header.terminal}</span>
                    </motion.div>
                    <div className="h-4 w-[1px] bg-zinc-800"></div>
                    <div className="flex items-center gap-4 text-[10px] tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <Wifi className="h-3 w-3 text-green-500" />
                            <span className="text-zinc-500">{UI_TEXT.header.network.label}</span>
                            <span className="text-green-500 font-medium">{UI_TEXT.header.network.status}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Shield className="h-3 w-3 text-secondary" />
                            <span className="text-zinc-500">{UI_TEXT.header.security.label}</span>
                            <span className="text-secondary font-medium">{UI_TEXT.header.security.status}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/50">
                        <Radio className="h-3 w-3 text-primary animate-pulse" />
                        <span className="font-pixel text-[10px] text-zinc-400">{UI_TEXT.header.liveIndicator}</span>
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
                            <span>{UI_TEXT.sidebar.metrics}</span>
                        </div>
                        <MetricBar label={STUDIO_CONFIG.METRICS.CPU.label} value={metrics.cpu} color="primary" />
                        <MetricBar label={STUDIO_CONFIG.METRICS.MEMORY.label} value={metrics.mem} color="secondary" />
                        <MetricBar label={STUDIO_CONFIG.METRICS.NETWORK.label} value={metrics.net} color="accent" />
                        <MetricBar label={STUDIO_CONFIG.METRICS.DISK.label} value={metrics.disk} color="primary" />
                    </div>

                    {/* Data Nodes */}
                    <div className="grid grid-cols-2 gap-2">
                        <DataNode label={UI_TEXT.sidebar.queue} value="001" icon={Database} status="active" />
                        <DataNode label={UI_TEXT.sidebar.nodes} value="04" icon={Zap} status="standby" />
                    </div>

                    {/* Visualizer */}
                    <div className="flex-1 border border-zinc-800/50 rounded-lg bg-zinc-950/30 relative overflow-hidden">
                        <div className="absolute top-2 left-2 text-[9px] uppercase tracking-widest text-zinc-700">{UI_TEXT.sidebar.signal}</div>
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
                        {UI_TEXT.sidebar.terminalHint}
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
                                {UI_TEXT.main.title}
                            </h1>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
                                <p className="text-xs text-primary/70 tracking-[0.3em] uppercase font-medium">
                                    {UI_TEXT.main.subtitle}
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
                        <span>{UI_TEXT.sidebar.recentBatches}</span>
                    </div>
                    <div className="space-y-3">
                        {BATCH_DATA.map((batch, i) => (
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
                                        BATCH_COLORS[batch.color].bg,
                                        BATCH_COLORS[batch.color].text
                                    )}>{batch.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${batch.score}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                            className={cn("h-full rounded-full", BATCH_COLORS[batch.color].bar)}
                                        />
                                    </div>
                                    <span className="text-zinc-600 font-pixel text-[10px]">{batch.score}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-auto border-t border-zinc-800/50 pt-4 space-y-3">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600">{UI_TEXT.sidebar.sessionStats}</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 rounded bg-zinc-950/50 border border-zinc-800/30">
                                <div className={`text-lg font-pixel ${SESSION_STATS.analyses.color}`}>{SESSION_STATS.analyses.value}</div>
                                <div className="text-[9px] text-zinc-600 uppercase">{UI_TEXT.sidebar.analyses}</div>
                            </div>
                            <div className="text-center p-2 rounded bg-zinc-950/50 border border-zinc-800/30">
                                <div className={`text-lg font-pixel ${SESSION_STATS.avgScore.color}`}>{SESSION_STATS.avgScore.value}</div>
                                <div className="text-[9px] text-zinc-600 uppercase">{UI_TEXT.sidebar.avgScore}</div>
                            </div>
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
