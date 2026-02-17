"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff, Play, Square, Settings } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useRealtimeAnalysis } from '@/hooks/useRealtimeAnalysis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { PerformanceMeters } from '@/components/realtime/PerformanceMeters';
import { ComboCounter } from '@/components/realtime/ComboCounter';
import { LiveFeedback } from '@/components/realtime/LiveFeedback';
import { AchievementPopup } from '@/components/realtime/AchievementPopup';
import { LiveTranscript } from '@/components/realtime/LiveTranscript';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PracticePage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mode, setMode] = useState<'practice' | 'challenge' | 'timed'>('practice');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [newAchievements, setNewAchievements] = useState<any[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const frameIntervalRef = useRef<NodeJS.Timeout>();

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

    // Handle new achievements
    useEffect(() => {
        if (metrics?.new_achievements && metrics.new_achievements.length > 0) {
            setNewAchievements(metrics.new_achievements);
        }
    }, [metrics?.new_achievements]);

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

        // Disconnect WebSocket
        disconnect();

        // Stop camera/mic
        stopStream();

        // End session on backend
        if (sessionId) {
            try {
                await fetch(`${API_URL}/realtime/end-session/${sessionId}`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Failed to end session:', error);
            }
        }

        setSessionId(null);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <h1 className="text-4xl font-pixel font-bold text-primary mb-2">
                    LIVE PRACTICE MODE
                </h1>
                <p className="text-zinc-400 font-mono">
                    Real-time feedback • Combo system • Achievements
                </p>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Video preview */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video container */}
                    <div className="relative aspect-video bg-zinc-900 border-4 border-primary shadow-[8px_8px_0px_rgba(var(--primary-rgb),0.5)]">
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

                    {/* Controls */}
                    <div className="flex items-center justify-between gap-4">
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
                                    className="font-pixel"
                                    size="lg"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    START PRACTICE
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStopSession}
                                    variant="destructive"
                                    className="font-pixel"
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
                        <div className="border-2 border-zinc-800 p-6 space-y-4">
                            <h3 className="text-lg font-pixel text-primary mb-4">SESSION SETTINGS</h3>

                            {/* Mode selection */}
                            <div>
                                <label className="block text-sm font-pixel text-zinc-400 mb-2">MODE</label>
                                <div className="flex gap-2">
                                    {(['practice', 'challenge', 'timed'] as const).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMode(m)}
                                            className={`px-4 py-2 font-pixel text-sm border-2 transition-colors ${mode === m
                                                ? 'bg-primary text-black border-primary'
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
                                <label className="block text-sm font-pixel text-zinc-400 mb-2">DIFFICULTY</label>
                                <div className="flex gap-2">
                                    {(['beginner', 'intermediate', 'expert'] as const).map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`px-4 py-2 font-pixel text-sm border-2 transition-colors ${difficulty === d
                                                ? 'bg-primary text-black border-primary'
                                                : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                                }`}
                                        >
                                            {d.toUpperCase()}
                                        </button>
                                    ))}
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
                </div>

                {/* Right column - Stats */}
                <div className="space-y-6">
                    {/* Performance meters */}
                    {metrics && (
                        <div className="border-2 border-zinc-800 p-6">
                            <h3 className="text-lg font-pixel text-primary mb-4">PERFORMANCE</h3>
                            <PerformanceMeters
                                facialScore={metrics.facial_score}
                                voiceScore={metrics.voice_score}
                                engagementScore={(metrics.facial_score + metrics.voice_score) / 2}
                            />
                        </div>
                    )}

                    {/* Combo counter */}
                    {metrics && (
                        <div>
                            <ComboCounter
                                combo={metrics.combo}
                                multiplier={metrics.multiplier}
                                status={metrics.combo_status}
                            />
                        </div>
                    )}

                    {/* Score display */}
                    {metrics && (
                        <div className="border-2 border-primary p-6 bg-primary/10">
                            <div className="text-center">
                                <div className="text-sm font-pixel text-zinc-400 mb-1">TOTAL SCORE</div>
                                <div className="text-5xl font-pixel font-bold text-primary">
                                    {metrics.total_score.toLocaleString()}
                                </div>
                                <div className="text-xs font-pixel text-zinc-500 mt-2">
                                    AVG: {metrics.average_score.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Live feedback pills */}
            {metrics && (
                <LiveFeedback messages={metrics.feedback_messages} />
            )}

            {/* Achievement popup */}
            <AchievementPopup
                achievements={newAchievements}
                onDismiss={() => setNewAchievements([])}
            />
        </div>
    );
}
