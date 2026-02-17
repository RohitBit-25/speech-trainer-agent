"use client";

import { useEffect, useState } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface PerformanceStats {
    fps: number;
    latency: number;
    cls: number;
    fcp: number;
    lcp: number;
    ttfb: number;
}

interface PerformanceMonitorProps {
    wsLatency?: number;
    messageQueue?: number;
    show?: boolean;
}

export function PerformanceMonitor({
    wsLatency = 0,
    messageQueue = 0,
    show = true
}: PerformanceMonitorProps) {
    const [stats, setStats] = useState<PerformanceStats>({
        fps: 60,
        latency: 0,
        cls: 0,
        fcp: 0,
        lcp: 0,
        ttfb: 0
    });
    const [isExpanded, setIsExpanded] = useState(false);

    // Track FPS
    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationId: number;

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                setStats(prev => ({ ...prev, fps: frameCount }));
                frameCount = 0;
                lastTime = currentTime;
            }

            animationId = requestAnimationFrame(measureFPS);
        };

        animationId = requestAnimationFrame(measureFPS);

        return () => cancelAnimationFrame(animationId);
    }, []);

    // Track Web Vitals
    useEffect(() => {
        const handleMetric = (metric: Metric) => {
            setStats(prev => ({
                ...prev,
                [metric.name.toLowerCase()]: metric.value
            }));
        };

        onCLS(handleMetric);
        onFID(handleMetric);
        onFCP(handleMetric);
        onLCP(handleMetric);
        onTTFB(handleMetric);
    }, []);

    // Update latency from WebSocket
    useEffect(() => {
        setStats(prev => ({ ...prev, latency: wsLatency }));
    }, [wsLatency]);

    if (!show) return null;

    const getStatusColor = (value: number, thresholds: [number, number]) => {
        if (value <= thresholds[0]) return 'text-green-500';
        if (value <= thresholds[1]) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-50"
        >
            {/* Compact view */}
            {!isExpanded && (
                <motion.button
                    onClick={() => setIsExpanded(true)}
                    className="bg-zinc-900 border-2 border-zinc-700 p-3 flex items-center gap-2 hover:border-primary transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                    <Activity className="h-4 w-4 text-primary" />
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-green-500" />
                            <span className={`font-mono text-xs ${getStatusColor(stats.fps, [55, 45])}`}>
                                {stats.fps} FPS
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span className={`font-mono text-xs ${getStatusColor(stats.latency, [150, 300])}`}>
                                {stats.latency}ms
                            </span>
                        </div>
                    </div>
                </motion.button>
            )}

            {/* Expanded view */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-zinc-900 border-2 border-zinc-700 p-4 w-80"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                <span className="font-pixel text-xs text-primary">PERFORMANCE</span>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-zinc-500 hover:text-white text-xs font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Stats grid */}
                        <div className="space-y-3">
                            {/* FPS */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-green-500" />
                                    <span className="font-mono text-xs text-zinc-400">FPS</span>
                                </div>
                                <span className={`font-mono text-sm font-bold ${getStatusColor(stats.fps, [55, 45])}`}>
                                    {stats.fps}
                                </span>
                            </div>

                            {/* WebSocket Latency */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-blue-500" />
                                    <span className="font-mono text-xs text-zinc-400">WS Latency</span>
                                </div>
                                <span className={`font-mono text-sm font-bold ${getStatusColor(stats.latency, [150, 300])}`}>
                                    {stats.latency}ms
                                </span>
                            </div>

                            {/* Message Queue */}
                            {messageQueue > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3 text-yellow-500" />
                                        <span className="font-mono text-xs text-zinc-400">Queue</span>
                                    </div>
                                    <span className={`font-mono text-sm font-bold ${getStatusColor(messageQueue, [10, 50])}`}>
                                        {messageQueue}
                                    </span>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-zinc-800 my-2" />

                            {/* Web Vitals */}
                            <div className="space-y-2">
                                <span className="font-mono text-xs text-zinc-500">WEB VITALS</span>

                                {stats.lcp > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-zinc-400">LCP</span>
                                        <span className={`font-mono text-xs ${getStatusColor(stats.lcp, [2500, 4000])}`}>
                                            {(stats.lcp / 1000).toFixed(2)}s
                                        </span>
                                    </div>
                                )}

                                {stats.fcp > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-zinc-400">FCP</span>
                                        <span className={`font-mono text-xs ${getStatusColor(stats.fcp, [1800, 3000])}`}>
                                            {(stats.fcp / 1000).toFixed(2)}s
                                        </span>
                                    </div>
                                )}

                                {stats.cls > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-zinc-400">CLS</span>
                                        <span className={`font-mono text-xs ${getStatusColor(stats.cls * 1000, [100, 250])}`}>
                                            {stats.cls.toFixed(3)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance indicator */}
                        <div className="mt-4 pt-3 border-t border-zinc-800">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-zinc-500">STATUS</span>
                                {stats.fps >= 55 && stats.latency < 150 ? (
                                    <span className="font-mono text-xs text-green-500">● EXCELLENT</span>
                                ) : stats.fps >= 45 && stats.latency < 300 ? (
                                    <span className="font-mono text-xs text-yellow-500">● GOOD</span>
                                ) : (
                                    <span className="font-mono text-xs text-red-500">● POOR</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
