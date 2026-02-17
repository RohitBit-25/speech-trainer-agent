"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Smile, Volume, TrendingUp, AlertTriangle, Zap, ZapOff, CameraOff } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedbackMessage {
    type: 'positive' | 'warning' | 'error';
    message: string;
    icon: string;
}

interface LiveFeedbackProps {
    messages: FeedbackMessage[];
}

export function LiveFeedback({ messages }: LiveFeedbackProps) {
    const [visibleMessages, setVisibleMessages] = useState<(FeedbackMessage & { id: number })[]>([]);

    useEffect(() => {
        // Add new messages with unique IDs
        const newMessages = messages.map((msg, idx) => ({
            ...msg,
            id: Date.now() + idx
        }));

        setVisibleMessages(prev => {
            const combined = [...prev, ...newMessages];
            // Keep only last 3 messages
            return combined.slice(-3);
        });

        // Auto-dismiss after 3 seconds
        const timeout = setTimeout(() => {
            setVisibleMessages(prev => prev.slice(messages.length));
        }, 3000);

        return () => clearTimeout(timeout);
    }, [messages]);

    const getIcon = (iconName: string) => {
        const icons: Record<string, any> = {
            'eye': Eye,
            'eye-off': EyeOff,
            'smile': Smile,
            'volume': Volume,
            'trending-up': TrendingUp,
            'alert-triangle': AlertTriangle,
            'zap': Zap,
            'zap-off': ZapOff,
            'camera-off': CameraOff
        };
        return icons[iconName] || AlertTriangle;
    };

    const getStyles = (type: string) => {
        switch (type) {
            case 'positive':
                return {
                    bg: 'bg-green-500/20',
                    border: 'border-green-500',
                    text: 'text-green-400'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500/20',
                    border: 'border-yellow-500',
                    text: 'text-yellow-400'
                };
            case 'error':
                return {
                    bg: 'bg-red-500/20',
                    border: 'border-red-500',
                    text: 'text-red-400'
                };
            default:
                return {
                    bg: 'bg-zinc-800',
                    border: 'border-zinc-700',
                    text: 'text-zinc-400'
                };
        }
    };

    const handleDismiss = (id: number) => {
        setVisibleMessages(prev => prev.filter(msg => msg.id !== id));
    };

    return (
        <div className="fixed right-6 top-24 z-50 flex flex-col gap-2 w-80">
            <AnimatePresence>
                {visibleMessages.map((msg) => {
                    const styles = getStyles(msg.type);
                    const Icon = getIcon(msg.icon);

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`${styles.bg} border-2 ${styles.border} p-4 shadow-lg backdrop-blur-sm`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`h-5 w-5 ${styles.text} flex-shrink-0 mt-0.5`} />
                                <p className={`flex-1 text-sm font-mono ${styles.text}`}>
                                    {msg.message}
                                </p>
                                <button
                                    onClick={() => handleDismiss(msg.id)}
                                    className={`${styles.text} hover:opacity-70 transition-opacity`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
