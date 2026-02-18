"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Mic, Camera, ScanFace, Activity, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedbackMessage {
    type: 'positive' | 'warning' | 'error' | 'ai_insight';
    message: string;
    icon: string;
    timestamp?: number;
}

interface AICoachProps {
    isConnected: boolean;
    isListening: boolean;
    messages: FeedbackMessage[];
    facialScore: number;
    voiceScore: number;
}

export function AICoach({ isConnected, isListening, messages, facialScore, voiceScore }: AICoachProps) {
    const [currentMessage, setCurrentMessage] = useState<FeedbackMessage | null>(null);
    const [agentState, setAgentState] = useState<'idle' | 'listening' | 'analyzing' | 'speaking'>('idle');

    // Manage message queue - show one at a time for impact
    useEffect(() => {
        if (messages.length > 0) {
            const latest = messages[messages.length - 1];
            // Only update if it's a new message
            if (!currentMessage || latest.message !== currentMessage.message) {
                setCurrentMessage(latest);
                setAgentState('speaking');

                // Clear message after delay
                const timer = setTimeout(() => {
                    setCurrentMessage(null);
                    setAgentState(isListening ? 'listening' : 'idle');
                }, 4000);
                return () => clearTimeout(timer);
            }
        } else {
            setAgentState(isListening ? 'listening' : 'idle');
        }
    }, [messages, isListening]);

    return (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm relative overflow-hidden min-h-[180px] flex flex-col">
            {/* Background pulsing effect */}
            {agentState === 'listening' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 bg-primary rounded-full blur-xl"
                    />
                </div>
            )}

            {/* Header / Status */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${agentState === 'speaking' ? 'bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]' :
                                agentState === 'listening' ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]' :
                                    'bg-zinc-700'
                            } transition-all duration-500`}>
                            {agentState === 'speaking' ? <Sparkles className="w-4 h-4 text-white" /> :
                                agentState === 'listening' ? <Mic className="w-4 h-4 text-black" /> :
                                    <Brain className="w-4 h-4 text-zinc-400" />}
                        </div>
                        {isConnected && (
                            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-pixel text-zinc-200">AI_COACH</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase">
                            {agentState === 'speaking' ? 'Providing Insight...' :
                                agentState === 'listening' ? 'Analyzing Performance...' :
                                    'System Standby'}
                        </p>
                    </div>
                </div>

                {/* Active Agents Indicators */}
                <div className="flex gap-1.5">
                    <StatusIcon icon={<ScanFace className="w-3 h-3" />} label="FACE" active={facialScore > 0} />
                    <StatusIcon icon={<Activity className="w-3 h-3" />} label="VOICE" active={voiceScore > 0} />
                </div>
            </div>

            {/* Main Stage - Message Bubble */}
            <div className="flex-1 flex items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                    {currentMessage ? (
                        <motion.div
                            key={currentMessage.message}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className={`p-3 rounded-xl border ${currentMessage.type === 'positive' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                                    currentMessage.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                                        currentMessage.type === 'ai_insight' ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300' :
                                            'bg-zinc-800 border-zinc-700 text-zinc-300'
                                } w-full text-center relative`}
                        >
                            {/* Speech arrow */}
                            <div className={`absolute -top-1.5 left-4 w-3 h-3 border-l border-t ${currentMessage.type === 'positive' ? 'bg-green-950/50 border-green-500/30' :
                                    currentMessage.type === 'warning' ? 'bg-yellow-950/50 border-yellow-500/30' :
                                        currentMessage.type === 'ai_insight' ? 'bg-fuchsia-950/50 border-fuchsia-500/30' :
                                            'bg-zinc-800 border-zinc-700'
                                } transform rotate-45`} />

                            <p className="text-sm font-medium leading-snug">
                                "{currentMessage.message}"
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-2 opacity-50"
                        >
                            <div className="flex justify-center gap-1">
                                <motion.div animate={{ height: [8, 16, 8] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1 bg-zinc-600 rounded-full" />
                                <motion.div animate={{ height: [8, 24, 8] }} transition={{ duration: 1, repeat: Infinity, delay: 0.1 }} className="w-1 bg-zinc-600 rounded-full" />
                                <motion.div animate={{ height: [8, 16, 8] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 bg-zinc-600 rounded-full" />
                            </div>
                            <p className="text-[10px] font-mono">Listening for speech patterns...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatusIcon({ icon, label, active }: { icon: any, label: string, active: boolean }) {
    return (
        <div className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md border ${active ? 'bg-zinc-800 border-zinc-700 opacity-100' : 'bg-transparent border-transparent opacity-30'
            } transition-all duration-300`}>
            {active ? (
                <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {icon}
                </motion.div>
            ) : icon}
            <span className="text-[8px] font-mono">{label}</span>
        </div>
    );
}
