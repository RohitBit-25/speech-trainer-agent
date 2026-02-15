"use client";

import { useAppStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import { audioController } from "@/lib/audio";

export function AchievementPopup() {
    const achievements = useAppStore((state) => state.userProfile.achievements);
    const [queue, setQueue] = useState<string[]>([]);
    const [current, setCurrent] = useState<string | null>(null);

    // Monitor achievements for new unlocks
    useEffect(() => {
        // In a real app, we'd compare with previous state to detect NEW ones.
        // For this simple version, we'll assuming the last one added within 5 seconds is new
        // or just rely on the store trigger. 
        // Actually, let's just show the last one if it was recently added.
        // A better way is to have an "unseen" flag in the store, but let's keep it simple:
        // We will subscribe to store changes. The action in store could trigger a separate ephemeral state.

        // Alternative: Just checking length changes or specific timestamps.
        const lastAchievement = achievements[achievements.length - 1];
        if (lastAchievement && lastAchievement.unlockedAt) {
            const timeDiff = new Date().getTime() - new Date(lastAchievement.unlockedAt).getTime();
            if (timeDiff < 1000) { // Just unlocked
                setQueue(prev => [...prev, lastAchievement.id]);
                audioController.playSuccess(); // Play sound
            }
        }
    }, [achievements.length]);

    useEffect(() => {
        if (!current && queue.length > 0) {
            setCurrent(queue[0]);
            setQueue(prev => prev.slice(1));

            // Auto dismiss
            setTimeout(() => {
                setCurrent(null);
            }, 4000);
        }
    }, [queue, current]);

    if (!current) return null;

    const achievement = achievements.find(a => a.id === current);
    if (!achievement) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="fixed bottom-8 right-8 z-50 pointer-events-none"
            >
                <div className="bg-zinc-900 border-4 border-yellow-500 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] p-4 w-80 relative overflow-hidden">
                    {/* Scanlines */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] opacity-20"></div>

                    <div className="relative z-20 flex gap-4 items-center">
                        <div className="h-12 w-12 bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-2xl animate-bounce">
                            {achievement.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-pixel text-yellow-500 text-xs mb-1 uppercase tracking-widest">Achievement Unlocked!</h4>
                            <h3 className="font-bold text-white text-sm font-mono">{achievement.title}</h3>
                            <p className="text-xs text-zinc-400 font-mono mt-1">{achievement.description}</p>
                        </div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer skew-x-12"></div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
