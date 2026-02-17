"use client";

import { Leaderboard } from "@/components/game/Leaderboard";

export default function LeaderboardPage() {
    return (
        <div className="w-full h-full px-4 md:px-6 py-6 md:py-8">
            <div className="w-full space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="font-pixel text-4xl text-white">LEADERBOARD</h1>
                    <p className="text-sm font-mono text-zinc-400">
                        Compete with the best speakers worldwide
                    </p>
                </div>

                {/* Leaderboard Component */}
                <Leaderboard />
            </div>
        </div>
    );
}
