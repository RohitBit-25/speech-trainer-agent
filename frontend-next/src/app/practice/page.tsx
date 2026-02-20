"use client";

import { useEffect, useRef, useState, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff, Play, Square, BookOpen, Loader2, Trophy, Zap, Clock, Target, RotateCcw, Flame, Shield, Swords, Plus, Minus } from 'lucide-react';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useAICoach } from '@/hooks/useAICoach';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { QuickHelp } from '@/components/tutorial/HelpTooltip';
import { DifficultySelector } from '@/components/practice/DifficultySelector';
import { MultiplierDisplay } from '@/components/game/MultiplierDisplay';
import { RealtimeDashboard } from '@/components/realtime/RealtimeDashboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Lazy load heavy real-time components
const PerformanceMeters = lazy(() => import('@/components/realtime/PerformanceMeters').then(mod => ({ default: mod.PerformanceMeters })));
const ComboCounter = lazy(() => import('@/components/realtime/ComboCounter').then(mod => ({ default: mod.ComboCounter })));
const AICoach = lazy(() => import('@/components/realtime/AICoach').then(mod => ({ default: mod.AICoach })));
const AchievementPopup = lazy(() => import('@/components/realtime/AchievementPopup').then(mod => ({ default: mod.AchievementPopup })));
const LiveTranscript = lazy(() => import('@/components/realtime/LiveTranscript').then(mod => ({ default: mod.LiveTranscript })));
const PerformanceMonitor = lazy(() => import('@/components/realtime/PerformanceMonitor').then(mod => ({ default: mod.PerformanceMonitor })));

const ComponentLoader = () => (
    <div className="flex items-center justify-center p-4 bg-zinc-900/50 rounded-lg animate-pulse h-full min-h-[100px]">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
    </div>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so', 'right', 'okay'];

// ─── Arena Loadout Panel ───────────────────────────────────────────────────────
// ─── Arena Loadout Panel ───────────────────────────────────────────────────────
function ArenaLoadout({
    mode, setMode, difficulty, setDifficulty, bestScore, streak, multiplier
}: {
    mode: 'practice' | 'challenge' | 'timed';
    setMode: (m: 'practice' | 'challenge' | 'timed') => void;
    difficulty: 'beginner' | 'intermediate' | 'expert';
    setDifficulty: (d: 'beginner' | 'intermediate' | 'expert') => void;
    bestScore: number;
    streak: number;
    multiplier: number;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    const modeConfig = [
        { id: 'practice' as const, label: 'PRACTICE', icon: <Shield className="h-4 w-4" />, desc: 'Free session', color: 'border-blue-500/50 text-blue-400 bg-blue-500/10' },
        { id: 'challenge' as const, label: 'CHALLENGE', icon: <Swords className="h-4 w-4" />, desc: 'Top score', color: 'border-orange-500/50 text-orange-400 bg-orange-500/10' },
        { id: 'timed' as const, label: 'TIMED', icon: <Clock className="h-4 w-4" />, desc: '2-min limit', color: 'border-red-500/50 text-red-400 bg-red-500/10' },
    ];
    const diffConfig = [
        { id: 'beginner' as const, label: 'ROOKIE', mult: '1.0×', color: 'text-green-400 border-green-500/40 bg-green-500/10' },
        { id: 'intermediate' as const, label: 'VETERAN', mult: '1.5×', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
        { id: 'expert' as const, label: 'LEGEND', mult: '2.0×', color: 'text-red-400 border-red-500/40 bg-red-500/10' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Header / Toggle */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-pixel text-zinc-500 uppercase tracking-widest">Session Config</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6 p-0 text-zinc-500 hover:text-primary">
                    {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                    >
                        {/* Arena stats bar */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'BEST', value: bestScore > 0 ? bestScore.toFixed(0) : '---', icon: <Trophy className="h-3.5 w-3.5 text-yellow-500" />, color: 'text-yellow-400' },
                                { label: 'STREAK', value: `${streak}🔥`, icon: <Flame className="h-3.5 w-3.5 text-orange-500" />, color: 'text-orange-400' },
                                { label: 'MULT', value: `${multiplier.toFixed(1)}×`, icon: <Zap className="h-3.5 w-3.5 text-primary" />, color: 'text-primary' },
                            ].map(s => (
                                <div key={s.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2 text-center">
                                    <div className="flex justify-center mb-1">{s.icon}</div>
                                    <div className={`font-pixel text-sm ${s.color}`}>{s.value}</div>
                                    <div className="text-[9px] font-mono text-zinc-600 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mode selector */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3 space-y-2">
                            <label className="text-[9px] font-pixel text-zinc-500 uppercase tracking-widest">Mode</label>
                            <div className="space-y-1.5">
                                {modeConfig.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 text-left ${mode === m.id ? m.color : 'border-zinc-800 text-zinc-500 bg-zinc-900/50 hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className={mode === m.id ? '' : 'opacity-40'}>{m.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-pixel text-[10px] truncate">{m.label}</div>
                                        </div>
                                        {mode === m.id && (
                                            <motion.div
                                                layoutId="mode-indicator"
                                                className="w-1.5 h-1.5 rounded-full bg-current"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty selector */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3 space-y-2">
                            <label className="text-[9px] font-pixel text-zinc-500 uppercase tracking-widest">Difficulty</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {diffConfig.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setDifficulty(d.id)}
                                        className={`py-2 rounded-lg border transition-all duration-200 text-center ${difficulty === d.id ? d.color : 'border-zinc-800 text-zinc-600 bg-zinc-900/50 hover:border-zinc-700'
                                            }`}
                                    >
                                        <div className="font-pixel text-[9px]">{d.label}</div>
                                        <div className="text-[8px] font-mono opacity-70 mt-0.5">{d.mult}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isExpanded && (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <div className="flex items-center gap-2">
                        {mode === 'practice' && <Shield className="h-3 w-3 text-blue-400" />}
                        {mode === 'challenge' && <Swords className="h-3 w-3 text-orange-400" />}
                        {mode === 'timed' && <Clock className="h-3 w-3 text-red-400" />}
                        <span className="uppercase">{mode}</span>
                    </div>
                    <div className={difficulty === 'expert' ? 'text-red-400' : difficulty === 'intermediate' ? 'text-yellow-400' : 'text-green-400'}>
                        {difficulty.toUpperCase()}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// ─── Waveform Visualizer ───────────────────────────────────────────────────────
function WaveformVisualizer({ isActive }: { isActive: boolean }) {
    const bars = Array.from({ length: 20 });
    return (
        <div className="flex items-center justify-center gap-[3px] h-8">
            {bars.map((_, i) => (
                <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-primary"
                    animate={isActive ? {
                        height: [4, Math.random() * 24 + 4, 4],
                        opacity: [0.4, 1, 0.4],
                    } : { height: 4, opacity: 0.2 }}
                    transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.05,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
}

// ─── Session Summary Screen ────────────────────────────────────────────────────
interface SessionSummaryProps {
    score: number;
    duration: number;
    fillerCount: number;
    facialScore: number;
    voiceScore: number;
    xpEarned: number;
    onRestart: () => void;
}

function SessionSummary({ score, duration, fillerCount, facialScore, voiceScore, xpEarned, onRestart }: SessionSummaryProps) {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const overallGrade = score >= 80 ? 'S' : score >= 65 ? 'A' : score >= 50 ? 'B' : score >= 35 ? 'C' : 'D';
    const gradeColor = score >= 80 ? 'text-yellow-400' : score >= 65 ? 'text-green-400' : score >= 50 ? 'text-blue-400' : score >= 35 ? 'text-orange-400' : 'text-red-400';

    const stats = [
        { label: "Final Score", value: score.toFixed(0), unit: "pts", icon: <Trophy className="h-4 w-4 text-yellow-500" />, color: "text-yellow-400" },
        { label: "Operation Time", value: `${mins}:${secs.toString().padStart(2, '0')}`, unit: "min", icon: <Clock className="h-4 w-4 text-blue-400" />, color: "text-blue-400" },
        { label: "Filler Words", value: fillerCount.toString(), unit: "used", icon: <Target className="h-4 w-4 text-red-400" />, color: fillerCount > 10 ? "text-red-400" : fillerCount > 5 ? "text-orange-400" : "text-green-400" },
        { label: "Credits Earned", value: `+${xpEarned}`, unit: "xp", icon: <Zap className="h-4 w-4 text-primary" />, color: "text-primary" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 md:p-6"
        >
            {/* Scanlines Background */}
            <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>

            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-black border-4 border-zinc-700 shadow-[16px_16px_0px_#000] w-full max-w-2xl relative z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-4 border-zinc-800 bg-zinc-900 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rotate-45 -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <Shield className="w-5 h-5 text-primary" />
                        <h2 className="font-pixel text-lg text-white uppercase tracking-widest">Post-Operation Report</h2>
                    </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-stretch">
                    {/* Grade Section */}
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="flex-shrink-0 flex flex-col items-center justify-center bg-zinc-950 border-4 border-zinc-800 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] w-full md:w-auto min-w-[200px]"
                    >
                        <div className="text-[10px] font-pixel text-zinc-500 mb-4 tracking-widest uppercase">Performance Rank</div>
                        <div className={`text-8xl md:text-9xl font-pixel ${gradeColor} drop-shadow-[0_0_15px_currentColor]`}>{overallGrade}</div>
                        <div className="text-xs font-mono text-zinc-400 mt-4 px-4 py-1 border border-zinc-800 bg-zinc-900 rounded-none">
                            {score >= 80 ? 'OUTSTANDING' : score >= 65 ? 'ACCEPTABLE' : score >= 50 ? 'MARGINAL' : 'UNACCEPTABLE'}
                        </div>
                    </motion.div>

                    {/* Stats Section */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="bg-zinc-900 border-l-4 border-zinc-800 p-3 relative group overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="text-[10px] font-mono text-zinc-500 uppercase">{stat.label}</div>
                                        {stat.icon}
                                    </div>
                                    <div className={`text-xl font-pixel ${stat.color} mt-2 relative z-10`}>{stat.value}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Breakdown Bars */}
                        <div className="space-y-4 pt-4 border-t-2 border-dashed border-zinc-800">
                            {[
                                { label: "Facial Diagnostics", value: facialScore, color: "bg-blue-500" },
                                { label: "Vocal Telemetry", value: voiceScore, color: "bg-green-500" },
                                { label: "Syntax Control", value: Math.max(0, 100 - fillerCount * 5), color: "bg-orange-500" },
                            ].map((bar, i) => (
                                <motion.div
                                    key={bar.label}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                >
                                    <div className="flex justify-between text-[10px] font-pixel text-zinc-400 mb-2 uppercase">
                                        <span>{bar.label}</span>
                                        <span className="text-zinc-300">{bar.value.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 bg-zinc-950 border border-zinc-800 w-full overflow-hidden shadow-inner p-[1px]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${bar.value}%` }}
                                            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                                            className={`h-full ${bar.color}`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-zinc-900 border-t-4 border-zinc-800">
                    <Button
                        onClick={onRestart}
                        className="w-full font-pixel text-sm h-14 bg-primary text-black hover:bg-white border-4 border-primary hover:border-white shadow-[4px_4px_0px_#000] hover:translate-y-[2px] transition-all rounded-none hover:shadow-none"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        INITIALIZE_NEXT_SESSION
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}



// ─── Countdown Timer ───────────────────────────────────────────────────────────
function CountdownTimer({ seconds, total }: { seconds: number; total: number }) {
    const pct = (seconds / total) * 100;
    const color = seconds > total * 0.5 ? 'text-green-400' : seconds > total * 0.25 ? 'text-yellow-400' : 'text-red-400';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return (
        <motion.div
            animate={seconds <= 10 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 border border-zinc-700/50 rounded-full"
        >
            <Clock className={`h-3.5 w-3.5 ${color}`} />
            <span className={`font-pixel text-sm ${color}`}>
                {mins}:{secs.toString().padStart(2, '0')}
            </span>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PracticePage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mode, setMode] = useState<'practice' | 'challenge' | 'timed'>('practice');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [newAchievements, setNewAchievements] = useState<any[]>([]);
    const [showTutorial, setShowTutorial] = useState(false);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
    const [multiplierBreakdown, setMultiplierBreakdown] = useState<any>({});
    const [user, setUser] = useState<any>(null);
    const [goodFramesCount, setGoodFramesCount] = useState(0);
    const [totalFramesProcessed, setTotalFramesProcessed] = useState(0);
    // Session state
    const [fillerCount, setFillerCount] = useState(0);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [timedSeconds, setTimedSeconds] = useState(120);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const [sessionStartTime, setSessionStartTime] = useState<number>(0);
    const [bestScore, setBestScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [comboStatus, setComboStatus] = useState<string>('');
    const [feedbackMessages, setFeedbackMessages] = useState<any[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const frameIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const durationRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const { stream, isStreaming, error: webrtcError, startStream, stopStream, captureFrame } = useWebRTC({
        video: videoEnabled,
        audio: audioEnabled,
        frameRate: 30
    });

    const { startCapture, stopCapture } = useAudioCapture();

    // AI Coach integration
    const {
        connect: aiConnect,
        disconnect: aiDisconnect,
        isConnected: aiCoachConnected,
        currentFeedback,
        currentScore,
        currentEmotion,
        currentVoice,
        sendVideoFrame: aiSendVideoFrame,
        sendAudioChunk: aiSendAudioChunk,
        endSession: aiEndSession,
        serverTranscript
    } = useAICoach({
        sessionId: sessionId || '',
        userId: user?.id || '',
        difficulty
    });

    // Keep track of connection status for interval closures
    const aiCoachConnectedRef = useRef(aiCoachConnected);

    useEffect(() => {
        aiCoachConnectedRef.current = aiCoachConnected;
    }, [aiCoachConnected]);

    // Auto-connect AI Coach when session starts


    useEffect(() => {
        if (sessionId && !aiCoachConnected) {
            aiConnect();
        }
    }, [sessionId, aiConnect, aiCoachConnected]);

    const {
        transcript,
        interimTranscript,
        segments,
        isListening: isTranscribing,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition();

    // Count filler words in transcript
    useEffect(() => {
        if (!transcript) return;
        const lower = transcript.toLowerCase();
        const count = FILLER_WORDS.reduce((acc, word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            return acc + (lower.match(regex)?.length || 0);
        }, 0);
        setFillerCount(count);
    }, [transcript]);

    // Set video stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);



    // Load user data
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try { setUser(JSON.parse(userData)); } catch (e) { console.error(e); }
        }
        const saved = localStorage.getItem("best_score");
        if (saved) setBestScore(parseFloat(saved));
    }, []);

    // Handle gamification and feedback messages from AI Coach
    useEffect(() => {
        if (currentScore) {
            // Update feedback messages if new feedback arrives
            if (currentFeedback) {
                setFeedbackMessages(prev => {
                    // Avoid duplicates based on content/timestamp if possible, 
                    // or just rudimentary check on the last message
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.message === currentFeedback.feedback) return prev;

                    return [...prev.slice(-4), {
                        type: 'ai_insight',
                        message: currentFeedback.feedback,
                        icon: 'sparkles'
                    }];
                });
            }

            // Update combo and multiplier based on score
            // We use functional state updates so we don't need 'combo' in dependencies
            if (currentScore.total_score >= 70) {
                setCombo(prev => prev + 1);
                setComboStatus('HOT STREAK!');
            } else {
                setCombo(0);
                setComboStatus('');
            }

            // Simple multiplier logic based on difficulty and combo
            // Recalculate based on current combo (accepting 1 frame lag which is fine)
            const baseMult = difficulty === 'beginner' ? 1.0 : difficulty === 'intermediate' ? 1.5 : 2.0;
            const comboBonus = combo > 5 ? 0.1 * Math.floor(combo / 5) : 0;
            const newMult = baseMult + comboBonus;

            setCurrentMultiplier(newMult);
            setMultiplierBreakdown({
                base: baseMult,
                combo: comboBonus,
                streak: 0, // Could be calculated if we tracked streak separately
                perfect: (currentScore.facial_score > 90 && currentScore.voice_score > 90) ? 0.5 : 0
            });
        }
    }, [currentScore, currentFeedback, difficulty]); // REMOVED 'combo' dependency

    // Effect to handle audio capture and send to AI Coach
    useEffect(() => {
        if (isRecording && stream && aiCoachConnected) {
            startCapture(stream, (audioData) => {
                // Send audio chunk with current transcript status if needed
                aiSendAudioChunk(audioData, transcript || interimTranscript);
            });
        } else if (!isRecording) {
            stopCapture();
        }
    }, [isRecording, stream, aiCoachConnected, transcript, interimTranscript, startCapture, stopCapture, aiSendAudioChunk]);






    const handleStartSession = async () => {
        try {
            await startStream();

            const response = await fetch(`${API_URL}/realtime/start-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode,
                    difficulty
                })
            });

            const data = await response.json();
            setSessionId(data.session_id);
            setSessionStartTime(Date.now());
            setFillerCount(0);
            setCombo(0);
            setFeedbackMessages([]);
            startListening();

            setIsRecording(true);

            // Start frame capture and send to AI Coach
            frameIntervalRef.current = setInterval(() => {
                const frame = captureFrame();
                console.log(`📸 Loop: Frame=${!!frame}, Connected=${aiCoachConnectedRef.current}`);
                if (frame && aiCoachConnectedRef.current) {
                    aiSendVideoFrame(frame as any);
                }
            }, 100);

            // Duration tracker
            durationRef.current = setInterval(() => {
                setSessionDuration(prev => prev + 1);
            }, 1000);

            // Timed mode countdown
            if (mode === 'timed') {
                setTimedSeconds(120);
                timerRef.current = setInterval(() => {
                    setTimedSeconds(prev => {
                        if (prev <= 1) {
                            handleStopSession();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

        } catch (error) {
            console.error('Failed to start session:', error);
            toast.error("Failed to start session");
        }
    };

    const handleStopSession = async () => {
        if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        if (durationRef.current) clearInterval(durationRef.current);

        setIsRecording(false);
        stopListening();
        stopCapture();

        // End AI coach session
        if (sessionId && aiCoachConnected) {
            await aiEndSession();
        }

        stopStream();

        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const finalScore = currentScore?.total_score || 0;
        const finalFacial = currentScore?.facial_score || 0;
        const finalVoice = currentScore?.voice_score || 0;
        const xpEarned = Math.round(finalScore * currentMultiplier * 0.5) + 50;

        // Update best score
        if (finalScore > bestScore) {
            setBestScore(finalScore);
            localStorage.setItem("best_score", finalScore.toString());
        }

        setSummaryData({
            score: finalScore,
            duration: elapsed,
            fillerCount,
            facialScore: finalFacial,
            voiceScore: finalVoice,
            xpEarned,
        });
        setShowSummary(true);

        if (sessionId) {
            try {
                const response = await fetch(`${API_URL}/realtime/end-session/${sessionId}`, { method: 'POST' });
                const sessionData = await response.json();

                if (sessionData.average_score && sessionData.average_score > 50) {
                    const userId = localStorage.getItem("user_id") || "";
                    const username = user?.name || "Anonymous";
                    await fetch(`${API_URL}/game/leaderboard/submit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            username,
                            score: sessionData.average_score * currentMultiplier,
                            difficulty,
                            session_id: sessionId
                        })
                    });
                }
            } catch (error) {
                console.error('Failed to end session:', error);
            }
        }

        setSessionId(null);
        setSessionDuration(0);
        setTimeout(() => resetTranscript(), 1000);
    };

    const handleRestart = () => {
        setShowSummary(false);
        setSummaryData(null);
    };

    return (
        <div className="flex flex-col h-screen bg-black text-zinc-100 overflow-hidden font-mono selection:bg-primary/30 relative">

            {/* Session Summary Overlay */}
            <AnimatePresence>
                {showSummary && summaryData && (
                    <SessionSummary
                        {...summaryData}
                        onRestart={handleRestart}
                    />
                )}
            </AnimatePresence>

            {/* --- TOP NAVIGATION BAR --- */}
            <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-pixel text-lg md:text-xl text-primary leading-none tracking-tight">PRACTICE_MODE<span className="opacity-50">.v2</span></h1>
                        <p className="hidden md:block text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Real-time Analysis Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filler word badge (always visible during session) */}
                    {isRecording && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-pixel text-[10px] ${fillerCount > 10 ? 'border-red-500/50 bg-red-500/10 text-red-400' : fillerCount > 5 ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : 'border-green-500/50 bg-green-500/10 text-green-400'}`}
                        >
                            <span>UM</span>
                            <span className="text-sm">{fillerCount}</span>
                        </motion.div>
                    )}
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Pilot</span>
                        <span className="text-sm font-pixel text-zinc-300">{user?.name || "GUEST"}</span>
                    </div>
                    <Button
                        onClick={() => setShowTutorial(true)}
                        variant="ghost"
                        size="sm"
                        className="font-pixel text-xs hover:bg-zinc-800 border border-transparent hover:border-zinc-700"
                    >
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">TUTORIAL</span>
                    </Button>
                </div>
            </header>

            {/* --- MAIN DASHBOARD AREA --- */}
            <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden p-2 md:p-4 gap-3 md:gap-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black">

                {/* LEFT COLUMN: Video & Transcript */}
                <div className="flex-[2] flex flex-col gap-3 md:gap-4 min-h-0 lg:h-full">

                    {/* VIDEO STAGE */}
                    <div className="relative flex-1 min-h-[300px] md:min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col group">
                        {isStreaming ? (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/40 backdrop-blur-sm">
                                <div className="p-6 rounded-full bg-zinc-800/50 mb-4 border border-zinc-700/50 shadow-inner">
                                    <Camera className="h-12 w-12 text-zinc-600" />
                                </div>
                                <p className="text-zinc-500 font-pixel text-sm tracking-wide">CAMERA_OFFLINE</p>
                            </div>
                        )}

                        {/* OVERLAYS (HUD) */}
                        <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between z-10">
                            <div className="flex justify-between items-start">
                                {isRecording && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 bg-red-500/10 backdrop-blur-md px-3 py-1.5 border border-red-500/30 rounded-full"
                                    >
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                        <span className="text-red-400 font-pixel text-[10px] tracking-widest">REC</span>
                                    </motion.div>
                                )}

                                {/* Timed countdown in HUD */}
                                {isRecording && mode === 'timed' && (
                                    <CountdownTimer seconds={timedSeconds} total={120} />
                                )}

                                {isRecording && mode !== 'timed' && (
                                    <div className={`px-3 py-1.5 bg-black/40 backdrop-blur-md border rounded-full font-pixel text-[10px] flex items-center gap-2 ${aiCoachConnected ? 'border-green-500/30 text-green-400' : 'border-yellow-500/30 text-yellow-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${aiCoachConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        {aiCoachConnected ? 'ONLINE' : 'CONNECTING'}
                                    </div>
                                )}
                            </div>

                            {/* HUD: AI Insights Overlay */}
                            <AnimatePresence>
                                {isRecording && feedbackMessages.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute bottom-6 left-6 max-w-sm pointer-events-none"
                                    >
                                        <div className="flex flex-col gap-2">
                                            {feedbackMessages.slice(-1).map((msg, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-black/60 backdrop-blur-md border-l-2 border-primary pl-3 py-2 pr-4 rounded-r-lg"
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Zap className="h-3 w-3 text-primary" />
                                                        <span className="text-[10px] font-pixel text-primary uppercase">AI_COACH_INSIGHT</span>
                                                    </div>
                                                    <p className="text-xs font-mono text-zinc-100 leading-relaxed shadow-sm">
                                                        {msg.message}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Combo Counter */}
                            {isRecording && combo > 0 && (
                                <div className="flex justify-end">
                                    <Suspense fallback={null}>
                                        <div className="transform scale-75 md:scale-100 origin-bottom-right">
                                            <ComboCounter
                                                combo={combo}
                                                multiplier={currentMultiplier}
                                                status={comboStatus}
                                            />
                                        </div>
                                    </Suspense>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* WAVEFORM + TRANSCRIPT AREA */}
                    <div className="h-[200px] lg:h-[220px] flex-shrink-0 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
                        <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-900/30 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isTranscribing ? 'bg-primary animate-pulse' : 'bg-zinc-700'}`} />
                                <span className="text-[10px] font-pixel text-zinc-500 uppercase tracking-wider">Live Transcript</span>
                            </div>
                            {/* Waveform */}
                            <WaveformVisualizer isActive={isTranscribing} />
                            {/* Filler word count inline */}
                            {isRecording && (
                                <div className="text-[10px] font-mono text-zinc-600">
                                    <span className={fillerCount > 5 ? 'text-red-400' : 'text-zinc-500'}>
                                        {fillerCount} filler{fillerCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <Suspense fallback={<ComponentLoader />}>
                                <LiveTranscript
                                    transcript={transcript}
                                    interimTranscript={interimTranscript}
                                    segments={segments}
                                    isListening={isTranscribing}
                                    serverTranscript={serverTranscript}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Performance & Controls */}
                <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0 lg:h-full lg:overflow-hidden">

                    {/* SCROLLABLE ANALYTICS CONTAINER */}
                    <div className="flex-1 flex flex-col gap-3 md:gap-4 overflow-y-auto custom-scrollbar min-h-0 pr-1 pb-2">

                        {/* SCORE CARD */}
                        <div className="flex-shrink-0 bg-black border-4 border-zinc-800 rounded-none p-5 shadow-[8px_8px_0px_#000] relative overflow-hidden group hover:border-zinc-700 transition-colors">
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <label className="text-[10px] font-pixel text-zinc-500 mb-1 block uppercase tracking-wider">Session Score</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl md:text-5xl font-pixel text-primary tracking-tighter leading-none drop-shadow-[0_2px_10px_rgba(var(--primary-rgb),0.3)]">
                                            {currentScore?.total_score?.toLocaleString() ?? "0000"}
                                        </span>
                                        <span className="text-xs font-pixel text-zinc-600">PTS</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <Trophy className="h-5 w-5 text-zinc-400" />
                                </div>
                            </div>

                            {isRecording && currentScore && (
                                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                    <MultiplierDisplay
                                        multiplier={currentMultiplier}
                                        breakdown={multiplierBreakdown}
                                    />
                                </div>
                            )}
                        </div>

                        {/* ANALYTICS METERS (Replaced with RealtimeDashboard when recording) */}
                        {!isRecording && (
                            <div className="bg-black border-4 border-zinc-800 rounded-none p-4 md:p-5 shadow-[8px_8px_0px_#000] relative group hover:border-zinc-700 transition-colors">
                                <h3 className="text-[10px] font-pixel text-zinc-500 mb-4 flex items-center gap-2 uppercase tracking-widest border-b-2 border-zinc-800 pb-2">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                    System Telemetry
                                </h3>
                                <Suspense fallback={<ComponentLoader />}>
                                    <PerformanceMeters
                                        facialScore={currentScore?.facial_score || 0}
                                        voiceScore={currentScore?.voice_score || 0}
                                        engagementScore={currentScore ? (currentScore.facial_score + currentScore.voice_score) / 2 : 0}
                                    />
                                </Suspense>
                            </div>
                        )}

                        {/* INLINE AI DASHBOARD */}
                        {isRecording && (
                            <Suspense fallback={<ComponentLoader />}>
                                <RealtimeDashboard
                                    emotion={currentEmotion}
                                    voice={currentVoice}
                                    score={currentScore}
                                    feedback={currentFeedback}
                                    isLoading={!aiCoachConnected}
                                    goodFramesPercentage={goodFramesCount / (totalFramesProcessed || 1) * 100}
                                />
                            </Suspense>
                        )}

                        {/* AI COACH */}
                        <div className="bg-black border-4 border-zinc-800 rounded-none p-4 shadow-[8px_8px_0px_#000] flex-1 min-h-[150px] relative group hover:border-zinc-700 transition-colors">
                            <h3 className="text-[10px] font-pixel text-primary mb-3 flex items-center gap-2 uppercase tracking-widest border-b-2 border-zinc-800 pb-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                AI_COACH_UPLINK
                            </h3>
                            <Suspense fallback={<ComponentLoader />}>
                                <AICoach
                                    isConnected={aiCoachConnected}
                                    isListening={isRecording}
                                    messages={feedbackMessages}
                                    facialScore={currentScore?.facial_score || 0}
                                    voiceScore={currentScore?.voice_score || 0}
                                />
                            </Suspense>
                        </div>

                        {/* ARENA LOADOUT (Idle Only) */}
                        {!isRecording && (
                            <div className="bg-black border-4 border-zinc-800 rounded-none p-4 shadow-[8px_8px_0px_#000] hover:border-zinc-700 transition-colors">
                                <ArenaLoadout
                                    mode={mode}
                                    setMode={setMode}
                                    difficulty={difficulty}
                                    setDifficulty={setDifficulty}
                                    bestScore={bestScore}
                                    streak={0}
                                    multiplier={currentMultiplier}
                                />
                            </div>
                        )}
                    </div>

                    {/* BOTTOM CONTROLS */}
                    <div className="flex-shrink-0 bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-lg">
                        <div className="flex gap-2 border-r border-zinc-800 pr-3">
                            <Button
                                variant={videoEnabled ? "secondary" : "ghost"}
                                size="icon"
                                className={`h-12 w-12 rounded-xl transition-all ${!videoEnabled && 'text-red-400 bg-red-500/10'}`}
                                onClick={() => setVideoEnabled(!videoEnabled)}
                                disabled={isRecording}
                            >
                                {videoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                            </Button>
                            <Button
                                variant={audioEnabled ? "secondary" : "ghost"}
                                size="icon"
                                className={`h-12 w-12 rounded-xl transition-all ${!audioEnabled && 'text-red-400 bg-red-500/10'}`}
                                onClick={() => setAudioEnabled(!audioEnabled)}
                                disabled={isRecording}
                            >
                                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            </Button>
                        </div>

                        {!isRecording ? (
                            <Button
                                onClick={handleStartSession}
                                className="flex-1 font-pixel text-sm h-14 bg-primary text-black hover:bg-white border-4 border-primary hover:border-white shadow-[4px_4px_0px_#000] hover:translate-y-[2px] transition-all rounded-none hover:shadow-[2px_2px_0px_#000]"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                EXECUTE_SESSION
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStopSession}
                                variant="destructive"
                                className="flex-1 font-pixel text-sm h-14 border-4 border-red-500 bg-red-600 text-white hover:bg-red-500 shadow-[4px_4px_0px_#000] hover:translate-y-[2px] transition-all rounded-none hover:shadow-[2px_2px_0px_#000]"
                            >
                                <Square className="h-4 w-4 mr-2" />
                                TERMINATE_SESSION
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            {/* Error Toast */}
            {(webrtcError) && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
                    <div className="bg-red-950/90 border border-red-500/50 p-4 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-md">
                        <div className="mt-1 h-2 w-2 bg-red-500 rounded-full animate-ping flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-red-400 font-pixel text-xs mb-1">SYSTEM_ERROR</h4>
                            <p className="text-red-200 font-mono text-xs break-words">{webrtcError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* End Main Container */}

            {/* Achievement Popup & Performance Monitor */}
            <Suspense fallback={null}><PerformanceMonitor wsLatency={0} messageQueue={0} show={isRecording} /></Suspense>
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} mode="practice" />
            <QuickHelp title="Arena Tips" tips={["Maintain eye contact with camera", "Speak at 120-160 WPM", "Avoid filler words (um, uh, like)", "Challenge mode scores go to leaderboard", "Timed mode = 2-minute countdown"]} />
        </div>
    );
}
