"use client";

import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Trophy, Star, Zap } from "lucide-react";

export function LevelBadge() {
    const userProfile = useAppStore((state) => state.userProfile);

    // Calculate progress to next level
    // Level N starts at (N-1)*1000 XP
    // Level N+1 starts at N*1000 XP
    const currentLevelXP = (userProfile.level - 1) * 1000;
    const nextLevelXP = userProfile.level * 1000;
    const progress = ((userProfile.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return (
        <div className="flex items-center gap-3 bg-zinc-900 border-2 border-zinc-700 px-3 py-1 rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            <div className="relative">
                <div className="h-8 w-8 bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center font-pixel text-yellow-500 font-bold">
                    {userProfile.level}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-zinc-950 border border-zinc-700 rounded-full p-[2px]">
                    <Zap className="h-2 w-2 text-yellow-500 fill-yellow-500" />
                </div>
            </div>

            <div className="flex flex-col min-w-[100px]">
                <div className="flex justify-between items-center text-[10px] uppercase font-pixel tracking-wider text-zinc-400 mb-1">
                    <span>{userProfile.title}</span>
                    <span className="text-yellow-500">{userProfile.xp} XP</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 border border-zinc-700 overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                    />
                    {/* Pixel shine effect */}
                    <div className="absolute top-0 right-0 h-full w-[2px] bg-white/50 opacity-50"></div>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-1 border-l border-zinc-700 pl-3 ml-1">
                <Trophy className="h-3 w-3 text-zinc-500" />
                <span className="font-mono text-xs text-zinc-500">{userProfile.achievements.length}</span>
            </div>
        </div>
    );
}
