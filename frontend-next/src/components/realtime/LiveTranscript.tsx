import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    serverTranscript?: string;
}

export function LiveTranscript({
    transcript,
    interimTranscript,
    segments,
    isListening,
    serverTranscript
}: LiveTranscriptProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Virtual scrolling for performance with 1000+ segments
    const virtualizer = useVirtualizer({
        count: segments.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80, // Estimated height of each segment
        overscan: 5, // Render 5 extra items above/below viewport
    });

    // Auto-scroll to bottom when new content arrives (if enabled)
    useEffect(() => {
        if (autoScroll && parentRef.current) {
            parentRef.current.scrollTop = parentRef.current.scrollHeight;
        }
    }, [segments.length, interimTranscript, autoScroll]);

    // Detect manual scroll to disable auto-scroll
    const handleScroll = () => {
        if (!parentRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

        setAutoScroll(isAtBottom);
    };

    // Export transcript as text file
    const handleExport = () => {
        const fullText = segments.map(s =>
            `[${new Date(s.timestamp).toLocaleTimeString()}] ${s.text}`
        ).join('\n');

        const blob = new Blob([fullText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="border-2 border-zinc-800 bg-zinc-950 h-80 flex flex-col">
            {/* Header */}
            <div className="border-b-2 border-zinc-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : 'text-zinc-600'}`} />
                    <span className="font-pixel text-xs text-zinc-400">LIVE TRANSCRIPT</span>
                </div>

                <div className="flex items-center gap-3">
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

                    {segments.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExport}
                            className="h-6 px-2 font-mono text-xs"
                        >
                            <Download className="h-3 w-3 mr-1" />
                            EXPORT
                        </Button>
                    )}
                </div>
            </div>

            {/* Transcript content with virtual scrolling */}
            <div
                ref={parentRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950"
            >
                {segments.length === 0 && !interimTranscript && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-zinc-600 font-mono text-sm text-center">
                            {isListening ? 'Start speaking...' : 'Transcript will appear here'}
                        </p>
                    </div>
                )}

                {/* Virtual list for performance */}
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                        const segment = segments[virtualItem.index];

                        return (
                            <motion.div
                                key={virtualItem.index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`,
                                }}
                                className={`p-3 ${segment.hasFillerWord
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
                        );
                    })}
                </div>

                {/* Interim (not finalized) transcript */}
                {interimTranscript && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        className="p-3 bg-zinc-900/30 border-l-2 border-primary sticky bottom-0"
                    >
                        <p className="font-mono text-sm text-zinc-500 italic">
                            {interimTranscript}
                        </p>
                    </motion.div>
                )}

                {/* Server-side Verified Transcript (More Accurate) */}
                {serverTranscript && (
                    <div className="p-3 bg-emerald-900/10 border-t border-emerald-500/20 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-pixel text-emerald-500 uppercase">Verified Transcript</span>
                        </div>
                        <p className="font-mono text-xs text-emerald-400/80">
                            {serverTranscript.slice(-300)} {/* Show last 300 chars */}
                        </p>
                    </div>
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
                <span className="font-mono text-xs text-zinc-600">
                    Segments: {segments.length}
                </span>
            </div>

            {/* Auto-scroll indicator */}
            {!autoScroll && segments.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                        if (parentRef.current) {
                            parentRef.current.scrollTop = parentRef.current.scrollHeight;
                            setAutoScroll(true);
                        }
                    }}
                    className="absolute bottom-16 right-4 bg-primary text-black px-3 py-1 font-pixel text-xs border-2 border-black shadow-lg hover:scale-105 transition-transform"
                >
                    ↓ NEW MESSAGES
                </motion.button>
            )}
        </div>
    );
}
