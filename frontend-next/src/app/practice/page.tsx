"use client";

import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff, Play, Square, Settings, BookOpen, Loader2 } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useRealtimeAnalysis } from '@/hooks/useRealtimeAnalysis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import { QuickHelp } from '@/components/tutorial/HelpTooltip';
import { DifficultySelector } from '@/components/practice/DifficultySelector';
import { MultiplierDisplay } from '@/components/game/MultiplierDisplay';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Lazy load heavy real-time components
const PerformanceMeters = lazy(() => import('@/components/realtime/PerformanceMeters').then(mod => ({ default: mod.PerformanceMeters })));
const ComboCounter = lazy(() => import('@/components/realtime/ComboCounter').then(mod => ({ default: mod.ComboCounter })));
const LiveFeedback = lazy(() => import('@/components/realtime/LiveFeedback').then(mod => ({ default: mod.LiveFeedback })));
const AchievementPopup = lazy(() => import('@/components/realtime/AchievementPopup').then(mod => ({ default: mod.AchievementPopup })));
const LiveTranscript = lazy(() => import('@/components/realtime/LiveTranscript').then(mod => ({ default: mod.LiveTranscript })));
const PerformanceMonitor = lazy(() => import('@/components/realtime/PerformanceMonitor').then(mod => ({ default: mod.PerformanceMonitor })));

const ComponentLoader = () => (
    <div className="flex items-center justify-center p-4 bg-zinc-900/50 rounded-lg animate-pulse h-full min-h-[100px]">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
    </div>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PracticePage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mode, setMode] = useState<'practice' | 'challenge' | 'timed'>('practice');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [newAchievements, setNewAchievements] = useState<any[]>([]);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showDifficultySelector, setShowDifficultySelector] = useState(false);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
    const [multiplierBreakdown, setMultiplierBreakdown] = useState<any>({});
    const [user, setUser] = useState<any>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const frameIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const { stream, isStreaming, error: webrtcError, startStream, stopStream, captureFrame } = useWebRTC({
        video: videoEnabled,
        audio: audioEnabled,
        frameRate: 30
    });

    const {
        isConnected,
        metrics,
        error: wsError,
        connect,
        disconnect,
        sendVideoFrame,
        requestFeedback
    } = useRealtimeAnalysis();

    // Speech recognition
    const {
        transcript,
        interimTranscript,
        segments,
        isListening: isTranscribing,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition();

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
            setUser(JSON.parse(userData));
        }
    }, []);

    // Handle new achievements
    useEffect(() => {
        if (metrics?.new_achievements && metrics.new_achievements.length > 0) {
            setNewAchievements(metrics.new_achievements);
        }
    }, [metrics?.new_achievements]);

    // Update multiplier from metrics
    useEffect(() => {
        if (metrics?.multiplier) {
            setCurrentMultiplier(metrics.multiplier);
            // Calculate breakdown
            setMultiplierBreakdown({
                base: difficulty === 'beginner' ? 1.0 : difficulty === 'intermediate' ? 1.5 : 2.0,
                combo: metrics.combo > 5 ? 0.1 * Math.floor(metrics.combo / 5) : 0,
                streak: 0, // TODO: Get from user profile
                perfect: (metrics.facial_score > 90 && metrics.voice_score > 90) ? 0.5 : 0
            });
        }
    }, [metrics?.multiplier, metrics?.combo, metrics?.facial_score, metrics?.voice_score, difficulty]);

    const handleStartSession = async () => {
        try {
            // Start camera/mic
            await startStream();

            // Start speech recognition
            startListening();

            // Create session on backend
            const response = await fetch(`${API_URL}/realtime/start-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, difficulty })
            });

            const data = await response.json();
            setSessionId(data.session_id);

            // Connect WebSocket
            connect(data.session_id);

            // Start recording
            setIsRecording(true);

            // Start sending frames (every 100ms = 10 FPS)
            frameIntervalRef.current = setInterval(() => {
                const frame = captureFrame();
                if (frame) {
                    sendVideoFrame(frame);
                }

                // Request feedback every 500ms
                requestFeedback();
            }, 100);

        } catch (error) {
            console.error('Failed to start session:', error);
        }
    };

    const handleStopSession = async () => {
        // Stop frame capture
        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
        }

        // Stop recording
        setIsRecording(false);

        // Stop speech recognition
        stopListening();

        // Disconnect WebSocket
        disconnect();

        // Stop camera/mic
        stopStream();

        // End session on backend
        if (sessionId) {
            try {
                const response = await fetch(`${API_URL}/realtime/end-session/${sessionId}`, {
                    method: 'POST'
                });
                const sessionData = await response.json();

                // Submit to leaderboard if score is good
                if (sessionData.average_score && sessionData.average_score > 50) {
                    const userId = localStorage.getItem("user_id") || "";
                    const username = user?.name || "Anonymous";

                    await fetch(`${API_URL}/game/leaderboard/submit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            username: username,
                            score: sessionData.average_score * currentMultiplier,
                            difficulty: difficulty,
                            session_id: sessionId
                        })
                    });

                    toast.success(`Score submitted to leaderboard!`, {
                        description: `${Math.round(sessionData.average_score * currentMultiplier)} points`
                    });
                }
            } catch (error) {
                console.error('Failed to end session:', error);
            }
        }

        setSessionId(null);

        // Reset transcript after a short delay to allow viewing
        setTimeout(() => {
            resetTranscript();
        }, 1000);
    };

    return (
        <div className="flex flex-col h-screen bg-black text-zinc-100 overflow-hidden font-mono selection:bg-primary/30">
            {/* --- TOP NAVIGATION BAR --- */}
            <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-20">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-pixel text-lg md:text-xl text-primary leading-none tracking-tight">PRACTICE_MODE<span className="opacity-50">.v1</span></h1>
                        <p className="hidden md:block text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Real-time Analysis Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
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

                {/* LEFT COLUMN: Video & Transcript (The Action) */}
                <div className="flex-[2] flex flex-col gap-3 md:gap-4 min-h-0 lg:h-full">

                    {/* VIDEO STAGE - Dynamic Height */}
                    <div className="relative flex-1 min-h-[300px] md:min-h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col group">
                        {isStreaming ? (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform scale-x-[-1]" // Mirror video
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

                                {isRecording && (
                                    <div className={`px-3 py-1.5 bg-black/40 backdrop-blur-md border rounded-full font-pixel text-[10px] flex items-center gap-2 ${isConnected ? 'border-green-500/30 text-green-400' : 'border-yellow-500/30 text-yellow-400'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        {isConnected ? 'ONLINE' : 'CONNECTING'}
                                    </div>
                                )}
                            </div>

                            {/* Floating Multiplier in Video */}
                            {isRecording && metrics && (
                                <div className="flex justify-end">
                                    <Suspense fallback={null}>
                                        <div className="transform scale-75 md:scale-100 origin-bottom-right">
                                            <ComboCounter
                                                combo={metrics.combo}
                                                multiplier={metrics.multiplier}
                                                status={metrics.combo_status}
                                            />
                                        </div>
                                    </Suspense>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TRANSCRIPT AREA (Fixed Height) */}
                    <div className="h-[180px] lg:h-[200px] flex-shrink-0 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
                        <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/30 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isTranscribing ? 'bg-primary animate-pulse' : 'bg-zinc-700'}`} />
                                <span className="text-[10px] font-pixel text-zinc-500 uppercase tracking-wider">Live Transcript</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <Suspense fallback={<ComponentLoader />}>
                                <LiveTranscript
                                    transcript={transcript}
                                    interimTranscript={interimTranscript}
                                    segments={segments}
                                    isListening={isTranscribing}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Performance & Controls */}
                <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0 lg:h-full lg:overflow-hidden">

                    {/* SCROLLABLE ANALYTICS CONTAINER */}
                    <div className="flex-1 flex flex-col gap-3 md:gap-4 overflow-y-auto custom-scrollbar min-h-0 pr-1">

                        {/* SCORE CARD */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <label className="text-[10px] font-pixel text-zinc-500 mb-1 block uppercase tracking-wider">Session Score</label>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl md:text-5xl font-pixel text-primary tracking-tighter drop-shadow-[0_2px_10px_rgba(var(--primary-rgb),0.3)]">
                                            {metrics ? metrics.total_score.toLocaleString() : "0000"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-2 bg-zinc-800/50 rounded-lg">
                                    <Settings className="h-5 w-5 text-zinc-500" />
                                </div>
                            </div>

                            {isRecording && metrics && (
                                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                    <MultiplierDisplay
                                        multiplier={currentMultiplier}
                                        breakdown={multiplierBreakdown}
                                        showBreakdown={true}
                                    />
                                </div>
                            )}
                        </div>

                        {/* ANALYTICS METERS */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
                            <h3 className="text-xs font-pixel text-zinc-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                <span className="w-1 h-4 bg-primary rounded-full"></span>
                                Performance Metrics
                            </h3>
                            <Suspense fallback={<ComponentLoader />}>
                                <PerformanceMeters
                                    facialScore={metrics?.facial_score || 0}
                                    voiceScore={metrics?.voice_score || 0}
                                    engagementScore={metrics ? (metrics.facial_score + metrics.voice_score) / 2 : 0}
                                />
                            </Suspense>
                        </div>

                        {/* AI INSIGHTS */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-5 flex-1 min-h-[150px] backdrop-blur-sm">
                            <h3 className="text-xs font-pixel text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                AI Feedback Feed
                            </h3>
                            <div className="relative">
                                <Suspense fallback={null}>
                                    <LiveFeedback
                                        messages={metrics?.feedback_messages?.map(msg => ({
                                            type: msg.type as 'positive' | 'warning' | 'error',
                                            message: msg.message,
                                            icon: msg.type === 'positive' ? 'smile' : 'alert-triangle'
                                        })) || [
                                                { type: 'warning', message: 'Analyze system standing by...', icon: 'mic' }
                                            ]}
                                    />
                                </Suspense>
                            </div>
                        </div>

                        {/* CONFIGURATION (Idle Only) */}
                        {!isRecording && (
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-4">
                                <div>
                                    <label className="text-[10px] font-pixel text-zinc-500 mb-2 block uppercase">Training Mode</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['practice', 'challenge', 'timed'] as const).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={`py-2 font-pixel text-[10px] rounded-lg border transition-all duration-200 ${mode === m
                                                    ? 'bg-primary/10 text-primary border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]'
                                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                                                    }`}
                                            >
                                                {m.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <label className="text-[10px] font-pixel text-zinc-500 mb-2 block uppercase">Difficulty</label>
                                    <DifficultySelector
                                        onSelect={(diff) => setDifficulty(diff as 'beginner' | 'intermediate' | 'expert')}
                                        currentLevel={1}
                                        selectedDifficulty={difficulty}
                                        variant="compact"
                                    />
                                </div>
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
                                className="flex-1 font-pixel h-12 bg-primary text-black hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Play className="h-4 w-4 mr-2 fill-current" />
                                START SESSION
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStopSession}
                                variant="destructive"
                                className="flex-1 font-pixel h-12 rounded-xl animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                            >
                                <Square className="h-4 w-4 mr-2 fill-current" />
                                STOP ANALYSIS
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            {/* ERROR TOAST AREA */}
            {(webrtcError || wsError) && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
                    <div className="bg-red-950/90 border border-red-500/50 p-4 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-md">
                        <div className="mt-1 h-2 w-2 bg-red-500 rounded-full animate-ping flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-red-400 font-pixel text-xs mb-1">SYSTEM_ERROR</h4>
                            <p className="text-red-200 font-mono text-xs break-words">
                                {webrtcError || wsError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Keep your modals and hidden monitors here */}
            <Suspense fallback={null}><AchievementPopup achievements={newAchievements} onDismiss={() => setNewAchievements([])} /></Suspense>
            <Suspense fallback={null}><PerformanceMonitor wsLatency={0} messageQueue={0} show={isRecording} /></Suspense>
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} mode="practice" />
            <QuickHelp title="Practice Mode Tips" tips={["Maintain eye contact", "120-160 WPM speed", "Avoid filler words"]} />
        </div>
    );
}
