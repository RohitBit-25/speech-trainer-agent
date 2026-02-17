"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Achievement {
    id: string;
    name: string;
    description: string;
    xp: number;
}

interface AchievementPopupProps {
    achievements: Achievement[];
    onDismiss?: () => void;
}

export function AchievementPopup({ achievements, onDismiss }: AchievementPopupProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievements.length > 0) {
            setVisible(true);

            // Auto-dismiss after 5 seconds
            const timeout = setTimeout(() => {
                setVisible(false);
                onDismiss?.();
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [achievements, onDismiss]);

    const handleClose = () => {
        setVisible(false);
        onDismiss?.();
    };

    return (
        <AnimatePresence>
            {visible && achievements.length > 0 && (
                <motion.div
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 180, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                >
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,0.8)] min-w-[400px]">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-black hover:opacity-70 transition-opacity"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Trophy icon */}
                        <motion.div
                            animate={{
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                            className="flex justify-center mb-4"
                        >
                            <Trophy className="h-16 w-16 text-black" />
                        </motion.div>

                        {/* Achievement title */}
                        <h2 className="text-3xl font-pixel font-bold text-center text-black mb-2">
                            ACHIEVEMENT UNLOCKED!
                        </h2>

                        {/* Achievement details */}
                        <div className="space-y-4 mt-6">
                            {achievements.map((achievement) => (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="bg-black/20 border-2 border-black p-4"
                                >
                                    <h3 className="text-xl font-pixel font-bold text-black mb-1">
                                        {achievement.name}
                                    </h3>
                                    <p className="text-sm font-mono text-black/80 mb-2">
                                        {achievement.description}
                                    </p>
                                    <div className="inline-block bg-black text-primary px-3 py-1 font-pixel text-sm border-2 border-black">
                                        +{achievement.xp} XP
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Confetti particles */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981'][i % 4],
                                    top: '50%',
                                    left: '50%'
                                }}
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    x: (Math.random() - 0.5) * 300,
                                    y: (Math.random() - 0.5) * 300
                                }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.05
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
