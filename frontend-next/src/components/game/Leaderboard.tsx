"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
    user_id: string;
    username: string;
    score: number;
    rank: number;
    difficulty: string;
    timestamp: string;
}

interface LeaderboardProps {
    defaultCategory?: "daily" | "weekly" | "all_time";
    defaultDifficulty?: string;
}

export function Leaderboard({ defaultCategory = "all_time", defaultDifficulty = "all" }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(defaultCategory);
    const [difficulty, setDifficulty] = useState(defaultDifficulty);
    const [userRank, setUserRank] = useState<any>(null);

    useEffect(() => {
        fetchLeaderboard();
        fetchUserRank();
    }, [category, difficulty]);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(
                `/api/game/leaderboard/${category}?difficulty=${difficulty}&limit=100`
            );
            const data = await response.json();
            setEntries(data.leaderboard || []);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
            toast.error("Failed to load leaderboard");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const userId = localStorage.getItem("user_id");
            if (!userId) return;

            const response = await fetch(
                `/api/game/leaderboard/user/${userId}/rank?category=${category}&difficulty=${difficulty}`
            );
            const data = await response.json();
            if (data.ranked) {
                setUserRank(data);
            }
        } catch (error) {
            console.error("Failed to fetch user rank:", error);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-gray-400" />;
            case 3: return <Award className="h-6 w-6 text-amber-700" />;
            default: return <span className="text-zinc-500 font-pixel text-sm">#{rank}</span>;
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case "beginner": return "bg-green-500";
            case "intermediate": return "bg-orange-500";
            case "expert": return "bg-red-500";
            default: return "bg-zinc-500";
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="font-pixel text-xl text-primary mb-2">LOADING...</div>
                <div className="text-sm font-mono text-zinc-400">Fetching leaderboard</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* User Rank Card */}
            {userRank && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl font-pixel text-primary">
                                        #{userRank.rank}
                                    </div>
                                    <div>
                                        <div className="font-pixel text-white">YOUR_RANK</div>
                                        <div className="text-xs font-mono text-zinc-400">
                                            Top {userRank.percentile}% of players
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-pixel text-primary">
                                        {userRank.score.toFixed(0)}
                                    </div>
                                    <div className="text-xs font-mono text-zinc-400">Score</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <Tabs value={category} onValueChange={(v: any) => setCategory(v)} className="flex-1">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border-2 border-zinc-700">
                        <TabsTrigger value="daily" className="font-pixel text-xs">
                            DAILY
                        </TabsTrigger>
                        <TabsTrigger value="weekly" className="font-pixel text-xs">
                            WEEKLY
                        </TabsTrigger>
                        <TabsTrigger value="all_time" className="font-pixel text-xs">
                            ALL TIME
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Tabs value={difficulty} onValueChange={setDifficulty} className="flex-1">
                    <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border-2 border-zinc-700">
                        <TabsTrigger value="all" className="font-pixel text-xs">
                            ALL
                        </TabsTrigger>
                        <TabsTrigger value="beginner" className="font-pixel text-xs">
                            BEGINNER
                        </TabsTrigger>
                        <TabsTrigger value="intermediate" className="font-pixel text-xs">
                            INTER
                        </TabsTrigger>
                        <TabsTrigger value="expert" className="font-pixel text-xs">
                            EXPERT
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-2">
                {entries.length > 0 ? (
                    entries.map((entry, index) => (
                        <motion.div
                            key={`${entry.user_id}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                        >
                            <Card
                                className={`bg-zinc-900 border-2 transition-all ${entry.rank <= 3
                                    ? "border-primary/50 shadow-[0_0_15px_rgba(255,153,51,0.3)]"
                                    : "border-zinc-700 hover:border-zinc-600"
                                    }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Rank */}
                                            <div className="w-12 flex justify-center">
                                                {getRankIcon(entry.rank)}
                                            </div>

                                            {/* Username */}
                                            <div className="flex-1">
                                                <div className="font-pixel text-white">
                                                    {entry.username}
                                                </div>
                                                <div className="text-xs font-mono text-zinc-500">
                                                    {new Date(entry.timestamp).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Difficulty Badge */}
                                            <Badge
                                                className={`${getDifficultyColor(entry.difficulty)} text-black font-pixel text-xs`}
                                            >
                                                {entry.difficulty}
                                            </Badge>

                                            {/* Score */}
                                            <div className="text-right min-w-[80px]">
                                                <div className="text-2xl font-pixel text-primary">
                                                    {entry.score.toFixed(0)}
                                                </div>
                                                <div className="text-xs font-mono text-zinc-500">
                                                    points
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <TrendingUp className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <div className="font-pixel text-zinc-400">NO_ENTRIES_YET</div>
                        <div className="text-sm font-mono text-zinc-500 mt-2">
                            Be the first to set a score!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
