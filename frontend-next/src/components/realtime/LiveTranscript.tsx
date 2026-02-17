"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle } from 'lucide-react';

interface TranscriptSegment {
    text: string;
    timestamp: number;
    isFinal: boolean;
    hasFillerWord?: boolean;
}

interface LiveTranscriptProps {
    transcript: string;
    interimTranscript: string;
    segments: TranscriptSegment[];
    isListening: boolean;
}

export function LiveTranscript({
    transcript,
    interimTranscript,
    segments,
    isListening
}: LiveTranscriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new content arrives
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments, interimTranscript]);

    return (
        <div className="border-2 border-zinc-800 bg-zinc-950 h-64 flex flex-col">
            {/* Header */}
            <div className="border-b-2 border-zinc-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : 'text-zinc-600'}`} />
                    <span className="font-pixel text-xs text-zinc-400">LIVE TRANSCRIPT</span>
                </div>

                {isListening && (
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="font-mono text-xs text-red-500">LISTENING</span>
                    </motion.div>
                )}
            </div>

            {/* Transcript content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950"
            >
                {segments.length === 0 && !interimTranscript && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-zinc-600 font-mono text-sm text-center">
                            {isListening ? 'Start speaking...' : 'Transcript will appear here'}
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    {segments.map((segment, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-2 rounded ${segment.hasFillerWord
                                    ? 'bg-red-500/10 border-l-2 border-red-500'
                                    : 'bg-zinc-900/50'
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                {segment.hasFillerWord && (
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <p className={`font-mono text-sm ${segment.hasFillerWord ? 'text-red-400' : 'text-zinc-300'
                                    }`}>
                                    {segment.text}
                                </p>
                            </div>

                            <span className="text-xs font-mono text-zinc-600 mt-1 block">
                                {new Date(segment.timestamp).toLocaleTimeString()}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Interim (not finalized) transcript */}
                {interimTranscript && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        className="p-2 bg-zinc-900/30 border-l-2 border-primary"
                    >
                        <p className="font-mono text-sm text-zinc-500 italic">
                            {interimTranscript}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Stats footer */}
            <div className="border-t-2 border-zinc-800 p-2 flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-600">
                    Words: {transcript.split(' ').filter(w => w.length > 0).length}
                </span>
                <span className="font-mono text-xs text-zinc-600">
                    Fillers: {segments.filter(s => s.hasFillerWord).length}
                </span>
            </div>
        </div>
    );
}
