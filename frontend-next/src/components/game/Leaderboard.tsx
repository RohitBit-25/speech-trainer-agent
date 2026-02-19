"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeaderboardEntry {
    user_id: string;
    username: string;
    score: number;
    rank: number;
    difficulty: string;
    timestamp: string;
    rank_change?: number; // positive = moved up, negative = moved down
}

interface UserRank {
    rank: number;
    score: number;
    percentile: number;
}

interface LeaderboardProps {
    defaultCategory?: "daily" | "weekly" | "all_time";
    defaultDifficulty?: string;
}

// ─── Rank Change Indicator ─────────────────────────────────────────────────────
function RankChange({ change }: { change?: number }) {
    if (change === undefined || change === 0) {
        return <Minus className="h-3 w-3 text-zinc-600" />;
    }
    if (change > 0) {
        return (
            <div className="flex items-center gap-0.5 text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[10px] font-mono">{change}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-0.5 text-red-400">
            <TrendingDown className="h-3 w-3" />
            <span className="text-[10px] font-mono">{Math.abs(change)}</span>
        </div>
    );
}

// ─── Top 3 Podium ──────────────────────────────────────────────────────────────
function Podium({ entries }: { entries: LeaderboardEntry[] }) {
    if (entries.length < 3) return null;
    const [second, first, third] = [entries[1], entries[0], entries[2]];

    const podiumConfig = [
        { entry: second, height: "h-20", rank: 2, color: "from-gray-400 to-gray-600", textColor: "text-gray-300", delay: 0.2, medal: "🥈" },
        { entry: first, height: "h-28", rank: 1, color: "from-yellow-400 to-orange-500", textColor: "text-yellow-300", delay: 0, medal: "🥇" },
        { entry: third, height: "h-14", rank: 3, color: "from-amber-600 to-orange-800", textColor: "text-amber-400", delay: 0.3, medal: "🥉" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            {/* Crown above #1 */}
            <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-10"
            >
                <Crown className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
            </motion.div>

            <div className="flex items-end justify-center gap-3 pt-8">
                {podiumConfig.map(({ entry, height, rank, color, textColor, delay, medal }) => (
                    <motion.div
                        key={rank}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
                        className="flex flex-col items-center gap-2 flex-1"
                    >
                        {/* Avatar + name above podium */}
                        <div className="flex flex-col items-center gap-1.5">
                            <Avatar className={rank === 1 ? "w-14 h-14" : "w-10 h-10"}>
                                <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.username}`} />
                                <AvatarFallback className="bg-zinc-800 text-zinc-400">{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <div className="font-pixel text-white text-[10px] leading-tight truncate max-w-[80px]">{entry.username}</div>
                                <div className={`font-pixel text-xs ${textColor}`}>{entry.score.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Podium block */}
                        <div className={`w-full ${height} bg-gradient-to-t ${color} rounded-t-xl flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/5" />
                            <div className="text-2xl">{medal}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── Sticky User Rank Card ─────────────────────────────────────────────────────
function StickyUserRank({ userRank }: { userRank: UserRank | null }) {
    if (!userRank) return null;
    const xpToNext = Math.max(0, 500 - (userRank.score % 500));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 z-20 pt-2"
        >
            <div className="bg-gradient-to-r from-primary/20 via-zinc-900 to-primary/10 border-2 border-primary/50 rounded-2xl p-4 backdrop-blur-md shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-pixel text-primary">#{userRank.rank}</div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-pixel text-xs text-white">YOUR RANK</span>
                            <span className="text-[10px] font-mono text-zinc-400">Top {userRank.percentile}%</span>
                        </div>
                        {/* XP to next rank */}
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((500 - xpToNext) / 500) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                        <div className="text-[10px] font-mono text-zinc-600 mt-1">{xpToNext} pts to Rank #{userRank.rank - 1}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-pixel text-xl text-primary">{userRank.score?.toFixed(0)}</div>
                        <div className="text-[10px] font-mono text-zinc-500">score</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Leaderboard Component ────────────────────────────────────────────────
export function Leaderboard({ defaultCategory = "all_time", defaultDifficulty = "all" }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(defaultCategory);
    const [difficulty, setDifficulty] = useState(defaultDifficulty);
    const [userRank, setUserRank] = useState<UserRank | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setCurrentUserId(JSON.parse(userStr).id);
        }
    }, []);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL(`/api/game/leaderboard/${category}`, window.location.origin);
            url.searchParams.set('difficulty', difficulty);
            url.searchParams.set('limit', '100');

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error("API error");
            const data = await response.json();
            const fetched = data.leaderboard || [];
            setEntries(fetched);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    }, [category, difficulty]);

    const fetchUserRank = useCallback(async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const userId = JSON.parse(userStr).id;

            const url = new URL(`/api/game/leaderboard/user/${userId}/rank`, window.location.origin);
            url.searchParams.set('category', category);
            url.searchParams.set('difficulty', difficulty);

            const response = await fetch(url.toString());
            const data = await response.json();
            if (data.ranked) setUserRank(data);
        } catch (error) {
            console.error('Error fetching user rank:', error);
            // No rank yet
        }
    }, [category, difficulty]);

    useEffect(() => {
        fetchLeaderboard();
        fetchUserRank();
    }, [fetchLeaderboard, fetchUserRank]);

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case "beginner": return "bg-green-500 text-black";
            case "intermediate": return "bg-yellow-500 text-black";
            case "expert": return "bg-red-500 text-white";
            default: return "bg-zinc-600 text-white";
        }
    };

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-zinc-900/60 border border-zinc-800 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <Tabs value={category} onValueChange={(v: string) => setCategory(v as "daily" | "weekly" | "all_time")} className="flex-1">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 h-auto">
                        {[
                            { value: "daily", label: "DAILY" },
                            { value: "weekly", label: "WEEKLY" },
                            { value: "all_time", label: "ALL TIME" },
                        ].map(t => (
                            <TabsTrigger key={t.value} value={t.value} className="font-pixel text-[10px] rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-primary py-2">
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Tabs value={difficulty} onValueChange={setDifficulty} className="flex-1">
                    <TabsList className="grid w-full grid-cols-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 h-auto">
                        {["all", "beginner", "intermediate", "expert"].map(d => (
                            <TabsTrigger key={d} value={d} className="font-pixel text-[9px] rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-primary py-2">
                                {d === "intermediate" ? "INTER" : d.toUpperCase()}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Top 3 Podium */}
            {entries.length >= 3 && (
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                    <Podium entries={top3} />
                </div>
            )}

            {/* Rest of leaderboard */}
            {entries.length > 0 ? (
                <div className="space-y-2">
                    <div className="text-[10px] font-pixel text-zinc-600 uppercase tracking-widest px-1 mb-3">
                        {entries.length > 3 ? `Ranks #4 – #${entries.length}` : "Rankings"}
                    </div>
                    <AnimatePresence>
                        {(entries.length > 3 ? rest : entries).map((entry, index) => {
                            const isCurrentUser = entry.user_id === currentUserId;
                            const displayRank = entries.length > 3 ? index + 4 : entry.rank;

                            return (
                                <motion.div
                                    key={`${entry.user_id}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    <div className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${isCurrentUser
                                        ? 'border-primary/50 bg-primary/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]'
                                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                                        }`}>

                                        {/* Rank number */}
                                        <div className="w-8 text-center flex-shrink-0">
                                            <span className="text-zinc-500 font-pixel text-xs">#{displayRank}</span>
                                        </div>

                                        {/* Rank change */}
                                        <div className="w-8 flex justify-center flex-shrink-0">
                                            <RankChange change={entry.rank_change} />
                                        </div>

                                        {/* Avatar */}
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.username}`} />
                                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>

                                        {/* Username + date */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-pixel text-sm truncate ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                                    {entry.username}
                                                </span>
                                                {isCurrentUser && (
                                                    <Badge className="bg-primary/20 text-primary border border-primary/30 font-pixel text-[8px] px-1.5 py-0">YOU</Badge>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-600">
                                                {new Date(entry.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Difficulty */}
                                        <Badge className={`${getDifficultyColor(entry.difficulty)} font-pixel text-[9px] px-1.5 hidden sm:flex`}>
                                            {entry.difficulty === "intermediate" ? "INTER" : entry.difficulty.toUpperCase()}
                                        </Badge>

                                        {/* Score */}
                                        <div className="text-right flex-shrink-0 min-w-[70px]">
                                            <div className={`font-pixel text-lg ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                                {entry.score.toFixed(0)}
                                            </div>
                                            <div className="text-[10px] font-mono text-zinc-600">pts</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-16 space-y-3">
                    <TrendingUp className="h-12 w-12 text-zinc-700 mx-auto" />
                    <div className="font-pixel text-zinc-500">NO_ENTRIES_YET</div>
                    <div className="text-sm font-mono text-zinc-600">Be the first to set a score!</div>
                </div>
            )}

            {/* Sticky user rank */}
            <StickyUserRank userRank={userRank} />
        </div>
    );
}
