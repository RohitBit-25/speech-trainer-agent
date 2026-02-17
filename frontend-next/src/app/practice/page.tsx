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
        <div className="w-full h-full flex flex-col px-4 md:px-6 py-4 md:py-6 overflow-hidden">
            {/* Header with Tutorial Button */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                    <h1 className="font-pixel text-2xl md:text-3xl text-primary mb-1">PRACTICE MODE</h1>
                    <p className="font-mono text-xs md:text-sm text-zinc-400">
                        Real-time AI feedback as you speak
                    </p>
                </div>
                <Button
                    onClick={() => setShowTutorial(true)}
                    variant="outline"
                    className="font-pixel text-xs border-2 border-primary"
                >
                    <BookOpen className="h-4 w-4 mr-2" />
                    HOW TO USE
                </Button>
            </div>

            {/* Main content - Dashboard Layout */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Left column - Video & Main Controls - Takes 2/3 width */}
                <div className="flex-[2] flex flex-col gap-4 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Video container - Flexible height */}
                    <div className="flex-1 min-h-[300px] relative bg-zinc-900 border-4 border-primary shadow-[8px_8px_0px_rgba(var(--primary-rgb),0.5)] flex flex-col">
                        {isStreaming ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <Camera className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                                    <p className="text-zinc-500 font-mono">Camera not active</p>
                                </div>
                            </div>
                        )}

                        {/* Recording indicator */}
                        {isRecording && (
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 font-pixel text-sm border-2 border-black"
                            >
                                <div className="w-2 h-2 bg-white rounded-full" />
                                RECORDING
                            </motion.div>
                        )}

                        {/* Connection status */}
                        {isRecording && (
                            <div className="absolute top-4 left-4">
                                <div className={`px-3 py-1 font-pixel text-xs border-2 border-black ${isConnected ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
                                    }`}>
                                    {isConnected ? '● CONNECTED' : '○ CONNECTING...'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls Bar */}
                    <div className="flex items-center justify-between gap-4 bg-zinc-900/50 p-3 rounded-lg border-2 border-zinc-800 flex-shrink-0">
                        <div className="flex gap-2">
                            <Button
                                variant={videoEnabled ? "default" : "outline"}
                                size="icon"
                                onClick={() => setVideoEnabled(!videoEnabled)}
                                disabled={isRecording}
                            >
                                {videoEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant={audioEnabled ? "default" : "outline"}
                                size="icon"
                                onClick={() => setAudioEnabled(!audioEnabled)}
                                disabled={isRecording}
                            >
                                {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            {!isRecording ? (
                                <Button
                                    onClick={handleStartSession}
                                    className="font-pixel w-full md:w-auto"
                                    size="lg"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    START PRACTICE
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStopSession}
                                    variant="destructive"
                                    className="font-pixel w-full md:w-auto"
                                    size="lg"
                                >
                                    <Square className="h-4 w-4 mr-2" />
                                    STOP
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Settings (when not recording) */}
                    {!isRecording && (
                        <div className="border-2 border-zinc-800 p-4 lg:p-6 space-y-4 flex-shrink-0 bg-zinc-900/30">
                            <h3 className="text-sm font-pixel text-primary mb-3">SESSION SETTINGS</h3>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Mode selection */}
                                <div>
                                    <label className="block text-xs font-pixel text-zinc-500 mb-2">MODE</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {(['practice', 'challenge', 'timed'] as const).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={`px-3 py-1.5 font-pixel text-xs border-2 transition-all ${mode === m
                                                    ? 'bg-primary text-black border-primary shadow-[2px_2px_0px_rgba(var(--primary-rgb),0.5)]'
                                                    : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                                    }`}
                                            >
                                                {m.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Difficulty selection */}
                                <div>
                                    <label className="block text-xs font-pixel text-zinc-500 mb-2">DIFFICULTY</label>
                                    <div className="flex gap-2">
                                        {(['beginner', 'intermediate', 'expert'] as const).map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={`px-3 py-1.5 font-pixel text-xs border-2 transition-all ${difficulty === d
                                                    ? 'bg-primary text-black border-primary shadow-[2px_2px_0px_rgba(var(--primary-rgb),0.5)]'
                                                    : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                                    }`}
                                            >
                                                {d.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Errors */}
                    {(webrtcError || wsError) && (
                        <div className="bg-red-500/20 border-2 border-red-500 p-4">
                            <p className="text-red-400 font-mono text-sm">
                                {webrtcError || wsError}
                            </p>
                        </div>
                    )}

                    {/* Live Transcript - Flexible height */}
                    <div className="flex-1 min-h-[200px] border-2 border-zinc-800 bg-black/50 overflow-hidden rounded-lg">
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

                {/* Right column - Stats - Takes 1/3 width */}
                <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pl-1 pr-2 custom-scrollbar">
                    {/* Multiplier Display */}
                    {isRecording && metrics && (
                        <MultiplierDisplay
                            multiplier={currentMultiplier}
                            breakdown={multiplierBreakdown}
                            showBreakdown={true}
                        />
                    )}

                    {/* Score display */}
                    {metrics && (
                        <div className="border-2 border-primary p-4 bg-primary/10">
                            <div className="text-center">
                                <div className="text-xs font-pixel text-zinc-400 mb-1">TOTAL SCORE</div>
                                <div className="text-4xl md:text-5xl font-pixel font-bold text-primary">
                                    {metrics.total_score.toLocaleString()}
                                </div>
                                <div className="text-xs font-pixel text-zinc-500 mt-1">
                                    AVG: {metrics.average_score.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance meters */}
                    {metrics && (
                        <div className="border-2 border-zinc-800 p-4">
                            <h3 className="text-sm font-pixel text-primary mb-3">PERFORMANCE</h3>
                            <Suspense fallback={<ComponentLoader />}>
                                <PerformanceMeters
                                    facialScore={metrics.facial_score}
                                    voiceScore={metrics.voice_score}
                                    engagementScore={(metrics.facial_score + metrics.voice_score) / 2}
                                />
                            </Suspense>
                        </div>
                    )}

                    {/* Combo counter */}
                    {metrics && (
                        <div>
                            <Suspense fallback={null}>
                                <ComboCounter
                                    combo={metrics.combo}
                                    multiplier={metrics.multiplier}
                                    status={metrics.combo_status}
                                />
                            </Suspense>
                        </div>
                    )}

                    {/* Live feedback */}
                    <div className="flex-1 min-h-[100px]">
                        <Suspense fallback={null}>
                            <LiveFeedback
                                messages={[
                                    { type: 'positive', message: 'Great eye contact!', icon: 'eye' },
                                    { type: 'warning', message: 'Speak a bit slower', icon: 'trending-up' }
                                ]}
                            />
                        </Suspense>
                    </div>

                    {/* Live feedback pills - Dynamic/Backend */}
                    {metrics && metrics.feedback_messages && (
                        <div className="flex-shrink-0">
                            <Suspense fallback={null}>
                                <LiveFeedback
                                    messages={metrics.feedback_messages.map(msg => ({
                                        type: msg.type as 'positive' | 'warning' | 'error',
                                        message: msg.message,
                                        icon: msg.type === 'positive' ? 'smile' :
                                            msg.type === 'warning' ? 'alert-triangle' :
                                                'camera-off'
                                    }))}
                                />
                            </Suspense>
                        </div>
                    )}
                </div>
            </div>

            {/* Achievement popup */}
            <Suspense fallback={null}>
                <AchievementPopup
                    achievements={newAchievements}
                    onDismiss={() => setNewAchievements([])}
                />
            </Suspense>

            {/* Performance Monitor */}
            <Suspense fallback={null}>
                <PerformanceMonitor
                    wsLatency={0}
                    messageQueue={0}
                    show={isRecording}
                />
            </Suspense>

            {/* Tutorial Modal */}
            <TutorialModal
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                mode="practice"
            />

            {/* Quick Help */}
            <QuickHelp
                title="Practice Mode Tips"
                tips={[
                    "Maintain eye contact with the camera",
                    "Speak clearly at 120-160 words per minute",
                    "Avoid filler words (um, uh, like)",
                    "Build combos for higher multipliers",
                    "Watch the performance meters for real-time feedback",
                    "Export your transcript after each session"
                ]}
            />
        </div>
    );
}
