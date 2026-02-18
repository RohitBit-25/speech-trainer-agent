"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, Clock, Target, CheckCircle2, Gift } from "lucide-react";
import { toast } from "sonner";

interface Challenge {
    challenge_id: string;
    type: "daily" | "weekly" | "achievement";
    title: string;
    description: string;
    difficulty: string;
    requirements: any;
    rewards: {
        xp: number;
        badge_id?: string;
        title?: string;
    };
    expires_at?: string;
    user_progress?: {
        progress: number;
        completed: boolean;
        claimed: boolean;
    };
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("daily");

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            // TODO: Get actual user_id from auth
            const userId = localStorage.getItem("user_id") || "";
            const response = await fetch(`/api/game/challenges/active?user_id=${userId}`);
            const data = await response.json();
            setChallenges(data.challenges || []);
        } catch (error) {
            console.error("Failed to fetch challenges:", error);
            toast.error("Failed to load challenges");
        } finally {
            setLoading(false);
        }
    };

    const claimReward = async (challengeId: string) => {
        try {
            const userId = localStorage.getItem("user_id") || "";
            const response = await fetch(`/api/game/challenges/${challengeId}/claim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(`Claimed ${data.rewards.xp} XP!`, {
                    icon: <Zap className="h-4 w-4 text-yellow-500" />
                });
                fetchChallenges(); // Refresh
            }
        } catch (error) {
            console.error("Failed to claim reward:", error);
            toast.error("Failed to claim reward");
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner": return "#10B981";
            case "intermediate": return "#F59E0B";
            case "expert": return "#EF4444";
            default: return "#6B7280";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "daily": return <Clock className="h-5 w-5" />;
            case "weekly": return <Target className="h-5 w-5" />;
            case "achievement": return <Trophy className="h-5 w-5" />;
            default: return <Target className="h-5 w-5" />;
        }
    };

    const filterChallenges = (type: string) => {
        return challenges.filter(c => c.type === type);
    };

    const renderChallengeCard = (challenge: Challenge) => {
        const progress = challenge.user_progress?.progress || 0;
        const completed = challenge.user_progress?.completed || false;
        const claimed = challenge.user_progress?.claimed || false;

        return (
            <motion.div
                key={challenge.challenge_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <Card className="bg-zinc-900 border-2 border-zinc-700 hover:border-primary/50 transition-all">
                    <CardHeader className="border-b-2 border-zinc-700">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded border-2"
                                    style={{
                                        borderColor: getDifficultyColor(challenge.difficulty),
                                        color: getDifficultyColor(challenge.difficulty)
                                    }}
                                >
                                    {getTypeIcon(challenge.type)}
                                </div>
                                <div>
                                    <CardTitle className="font-pixel text-lg text-white">
                                        {challenge.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs font-mono text-zinc-400 mt-1">
                                        {challenge.description}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge
                                className="font-pixel text-xs"
                                style={{
                                    backgroundColor: getDifficultyColor(challenge.difficulty),
                                    color: "black"
                                }}
                            >
                                {challenge.difficulty}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-zinc-400">Progress</span>
                                <span className="text-primary">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm font-mono text-zinc-300">
                                        {challenge.rewards.xp} XP
                                    </span>
                                </div>
                                {challenge.rewards.badge_id && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-mono text-zinc-300">
                                            Badge
                                        </span>
                                    </div>
                                )}
                                {challenge.rewards.title && (
                                    <div className="flex items-center gap-2">
                                        <Gift className="h-4 w-4 text-pink-500" />
                                        <span className="text-sm font-mono text-zinc-300">
                                            {challenge.rewards.title}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            {completed && !claimed && (
                                <Button
                                    onClick={() => claimReward(challenge.challenge_id)}
                                    className="font-pixel text-xs bg-primary text-black hover:bg-primary/90"
                                >
                                    CLAIM
                                </Button>
                            )}
                            {completed && claimed && (
                                <Badge className="bg-green-500 text-black font-pixel text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    CLAIMED
                                </Badge>
                            )}
                        </div>

                        {/* Expiry (for daily/weekly) */}
                        {challenge.expires_at && (
                            <div className="text-xs font-mono text-zinc-500">
                                Expires: {new Date(challenge.expires_at).toLocaleDateString()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="font-pixel text-xl text-primary mb-2">LOADING...</div>
                    <div className="text-sm font-mono text-zinc-400">Fetching challenges</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full px-4 md:px-6 py-6 md:py-8">
            <div className="w-full space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="font-pixel text-4xl text-white">CHALLENGES</h1>
                    <p className="text-sm font-mono text-zinc-400">
                        Complete challenges to earn XP, badges, and titles
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-zinc-900 border-2 border-zinc-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-pixel text-primary mb-1">
                                {challenges.filter(c => c.user_progress?.completed).length}
                            </div>
                            <div className="text-xs font-mono text-zinc-400">Completed</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-2 border-zinc-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-pixel text-yellow-500 mb-1">
                                {challenges.filter(c => c.user_progress?.completed && !c.user_progress?.claimed).length}
                            </div>
                            <div className="text-xs font-mono text-zinc-400">Ready to Claim</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-2 border-zinc-700">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-pixel text-green-500 mb-1">
                                {challenges.filter(c => c.type === "achievement").length}
                            </div>
                            <div className="text-xs font-mono text-zinc-400">Achievements</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Challenges Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border-2 border-zinc-700">
                        <TabsTrigger value="daily" className="font-pixel text-xs">
                            DAILY
                        </TabsTrigger>
                        <TabsTrigger value="weekly" className="font-pixel text-xs">
                            WEEKLY
                        </TabsTrigger>
                        <TabsTrigger value="achievement" className="font-pixel text-xs">
                            ACHIEVEMENTS
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily" className="space-y-4 mt-6">
                        {filterChallenges("daily").length > 0 ? (
                            filterChallenges("daily").map(renderChallengeCard)
                        ) : (
                            <div className="text-center text-zinc-400 font-mono text-sm py-12">
                                No daily challenges available
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="weekly" className="space-y-4 mt-6">
                        {filterChallenges("weekly").length > 0 ? (
                            filterChallenges("weekly").map(renderChallengeCard)
                        ) : (
                            <div className="text-center text-zinc-400 font-mono text-sm py-12">
                                No weekly challenges available
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="achievement" className="space-y-4 mt-6">
                        {filterChallenges("achievement").length > 0 ? (
                            filterChallenges("achievement").map(renderChallengeCard)
                        ) : (
                            <div className="text-center text-zinc-400 font-mono text-sm py-12">
                                No achievements available
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
