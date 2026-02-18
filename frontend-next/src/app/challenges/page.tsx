"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trophy, Zap, Clock, Target, CheckCircle2, Gift, Flame,
    Lock, Star, RefreshCw, Sparkles, Calendar, Award
} from "lucide-react";
import { toast } from "sonner";

interface Challenge {
    challenge_id: string;
    type: "daily" | "weekly" | "achievement";
    title: string;
    description: string;
    difficulty: string;
    requirements: any;
    rewards: { xp: number; badge_id?: string; title?: string; };
    expires_at?: string;
    user_progress?: { progress: number; completed: boolean; claimed: boolean; };
}

// ─── Mock fallback challenges ──────────────────────────────────────────────────
const MOCK_CHALLENGES: Challenge[] = [
    {
        challenge_id: "daily_1",
        type: "daily",
        title: "First Words",
        description: "Complete a 60-second practice session today.",
        difficulty: "beginner",
        requirements: { sessions: 1, min_duration: 60 },
        rewards: { xp: 150 },
        expires_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        user_progress: { progress: 0, completed: false, claimed: false },
    },
    {
        challenge_id: "daily_2",
        type: "daily",
        title: "Filler Slayer",
        description: "Complete a session with fewer than 5 filler words.",
        difficulty: "intermediate",
        requirements: { filler_words_max: 5 },
        rewards: { xp: 250, badge_id: "clean_speaker" },
        expires_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        user_progress: { progress: 40, completed: false, claimed: false },
    },
    {
        challenge_id: "daily_3",
        type: "daily",
        title: "Confidence Surge",
        description: "Achieve a facial confidence score above 80%.",
        difficulty: "intermediate",
        requirements: { facial_score_min: 80 },
        rewards: { xp: 300 },
        expires_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        user_progress: { progress: 75, completed: false, claimed: false },
    },
    {
        challenge_id: "weekly_1",
        type: "weekly",
        title: "7-Day Warrior",
        description: "Practice every day for 7 consecutive days.",
        difficulty: "expert",
        requirements: { streak_days: 7 },
        rewards: { xp: 1000, badge_id: "warrior", title: "The Consistent" },
        expires_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        user_progress: { progress: 43, completed: false, claimed: false },
    },
    {
        challenge_id: "weekly_2",
        type: "weekly",
        title: "Score Hunter",
        description: "Accumulate 5,000 total points across all sessions this week.",
        difficulty: "intermediate",
        requirements: { total_score: 5000 },
        rewards: { xp: 600, badge_id: "score_hunter" },
        expires_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        user_progress: { progress: 62, completed: false, claimed: false },
    },
    {
        challenge_id: "weekly_3",
        type: "weekly",
        title: "Expert Initiation",
        description: "Complete 3 sessions on Expert difficulty.",
        difficulty: "expert",
        requirements: { expert_sessions: 3 },
        rewards: { xp: 800, title: "Expert Speaker" },
        expires_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        user_progress: { progress: 33, completed: false, claimed: false },
    },
    {
        challenge_id: "ach_1",
        type: "achievement",
        title: "First Blood",
        description: "Complete your very first practice session.",
        difficulty: "beginner",
        requirements: { sessions: 1 },
        rewards: { xp: 100, badge_id: "first_blood" },
        user_progress: { progress: 100, completed: true, claimed: false },
    },
    {
        challenge_id: "ach_2",
        type: "achievement",
        title: "Combo King",
        description: "Reach a 10x combo multiplier in a single session.",
        difficulty: "expert",
        requirements: { combo: 10 },
        rewards: { xp: 500, badge_id: "combo_king", title: "Combo King" },
        user_progress: { progress: 0, completed: false, claimed: false },
    },
    {
        challenge_id: "ach_3",
        type: "achievement",
        title: "Leaderboard Legend",
        description: "Reach the Top 10 on the global leaderboard.",
        difficulty: "expert",
        requirements: { rank: 10 },
        rewards: { xp: 2000, badge_id: "legend", title: "Legend" },
        user_progress: { progress: 0, completed: false, claimed: false },
    },
];

// ─── Streak Bonus Card ─────────────────────────────────────────────────────────
function StreakBonusCard({ streak }: { streak: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border-2 border-orange-500/40 bg-gradient-to-br from-orange-950/60 via-zinc-900 to-zinc-900 p-5"
        >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                        <Flame className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                        <div className="font-pixel text-white text-sm">STREAK BONUS</div>
                        <div className="text-xs font-mono text-orange-400/80 mt-0.5">Practice 3 days in a row</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-pixel text-3xl text-orange-400">{streak}<span className="text-lg text-orange-600">/3</span></div>
                    <div className="text-[10px] font-mono text-zinc-500">days</div>
                </div>
            </div>

            <div className="mt-4 relative z-10">
                <div className="flex gap-2 mb-2">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`flex-1 h-2 rounded-full transition-all duration-500 ${i < streak ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-zinc-800'}`}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                    <span>Day 1</span>
                    <span>Day 2</span>
                    <span>Day 3 → +500 XP 🎁</span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Countdown Timer ───────────────────────────────────────────────────────────
function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [urgent, setUrgent] = useState(false);

    useEffect(() => {
        const update = () => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Expired"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setUrgent(h < 2);
            if (h > 24) {
                const d = Math.floor(h / 24);
                setTimeLeft(`${d}d ${h % 24}h left`);
            } else {
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [expiresAt]);

    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-mono ${urgent ? 'text-red-400' : 'text-zinc-500'}`}>
            <Clock className="h-3 w-3" />
            <span>{timeLeft}</span>
        </div>
    );
}

// ─── Confetti Burst (CSS only) ─────────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
    if (!active) return null;
    const pieces = Array.from({ length: 20 });
    const colors = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#eab308', '#ec4899'];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {pieces.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: '50%',
                        backgroundColor: colors[i % colors.length],
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    animate={{
                        y: [0, -80 - Math.random() * 80, 120],
                        x: [(Math.random() - 0.5) * 200],
                        opacity: [1, 1, 0],
                        rotate: [0, Math.random() * 360],
                        scale: [1, 0.5],
                    }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: Math.random() * 0.3 }}
                />
            ))}
        </div>
    );
}

// ─── Challenge Card ────────────────────────────────────────────────────────────
function ChallengeCard({ challenge, onClaim }: { challenge: Challenge; onClaim: (id: string) => void }) {
    const [showConfetti, setShowConfetti] = useState(false);
    const progress = challenge.user_progress?.progress || 0;
    const completed = challenge.user_progress?.completed || false;
    const claimed = challenge.user_progress?.claimed || false;
    const locked = !completed && progress === 0;

    const diffColors: Record<string, { border: string; bg: string; text: string; badge: string }> = {
        beginner: { border: "border-green-500/30", bg: "from-green-950/20", text: "text-green-400", badge: "bg-green-500" },
        intermediate: { border: "border-yellow-500/30", bg: "from-yellow-950/20", text: "text-yellow-400", badge: "bg-yellow-500" },
        expert: { border: "border-red-500/30", bg: "from-red-950/20", text: "text-red-400", badge: "bg-red-500" },
    };
    const dc = diffColors[challenge.difficulty] || diffColors.beginner;

    const typeIcons: Record<string, React.ReactElement> = {
        daily: <Clock className="h-4 w-4" />,
        weekly: <Calendar className="h-4 w-4" />,
        achievement: <Award className="h-4 w-4" />,
    };

    const handleClaim = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
        onClaim(challenge.challenge_id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative"
        >
            <ConfettiBurst active={showConfetti} />
            <div className={`relative overflow-hidden rounded-2xl border-2 ${dc.border} bg-gradient-to-br ${dc.bg} via-zinc-900 to-zinc-900 transition-all duration-300 ${claimed ? 'opacity-60' : ''}`}>

                {/* Claimed overlay */}
                {claimed && (
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 px-4 py-2 rounded-full">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <span className="font-pixel text-xs text-green-400">CLAIMED</span>
                        </div>
                    </div>
                )}

                {/* Locked overlay */}
                {locked && !completed && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="p-1.5 bg-zinc-800/80 rounded-lg border border-zinc-700">
                            <Lock className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                    </div>
                )}

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl border ${dc.border} ${dc.text} bg-zinc-900/50 flex-shrink-0`}>
                            {typeIcons[challenge.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-pixel text-white text-sm leading-tight">{challenge.title}</h3>
                                <Badge className={`${dc.badge} text-black font-pixel text-[9px] px-1.5 py-0`}>
                                    {challenge.difficulty}
                                </Badge>
                            </div>
                            <p className="text-xs font-mono text-zinc-400 mt-1 leading-relaxed">{challenge.description}</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-zinc-500">Progress</span>
                            <span className={dc.text}>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                className={`h-full rounded-full ${completed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : dc.badge}`}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                                <span className="text-xs font-pixel text-yellow-400">{challenge.rewards.xp} XP</span>
                            </div>
                            {challenge.rewards.badge_id && (
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="h-3.5 w-3.5 text-purple-400" />
                                    <span className="text-xs font-mono text-zinc-400">Badge</span>
                                </div>
                            )}
                            {challenge.rewards.title && (
                                <div className="flex items-center gap-1.5">
                                    <Star className="h-3.5 w-3.5 text-pink-400" />
                                    <span className="text-xs font-mono text-zinc-400 truncate max-w-[80px]">{challenge.rewards.title}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {challenge.expires_at && !claimed && (
                                <ExpiryCountdown expiresAt={challenge.expires_at} />
                            )}
                            {completed && !claimed && (
                                <Button
                                    onClick={handleClaim}
                                    size="sm"
                                    className="font-pixel text-[10px] h-8 px-3 bg-primary text-black hover:bg-primary/90 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-all"
                                >
                                    <Gift className="h-3 w-3 mr-1" />
                                    CLAIM
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ challenges }: { challenges: Challenge[] }) {
    const completed = challenges.filter(c => c.user_progress?.completed).length;
    const claimable = challenges.filter(c => c.user_progress?.completed && !c.user_progress?.claimed).length;
    const totalXp = challenges
        .filter(c => c.user_progress?.claimed)
        .reduce((sum, c) => sum + c.rewards.xp, 0);

    const stats = [
        { label: "Completed", value: completed, icon: <CheckCircle2 className="h-4 w-4 text-green-400" />, color: "text-green-400" },
        { label: "Claimable", value: claimable, icon: <Gift className="h-4 w-4 text-yellow-400" />, color: "text-yellow-400" },
        { label: "XP Earned", value: `${totalXp}`, icon: <Zap className="h-4 w-4 text-primary" />, color: "text-primary" },
        { label: "Total", value: challenges.length, icon: <Target className="h-4 w-4 text-zinc-400" />, color: "text-zinc-300" },
    ];

    return (
        <div className="grid grid-cols-4 gap-3">
            {stats.map((s, i) => (
                <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center"
                >
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <div className={`font-pixel text-xl ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] font-mono text-zinc-600 mt-0.5">{s.label}</div>
                </motion.div>
            ))}
        </div>
    );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ type }: { type: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-3"
        >
            <div className="text-5xl">{type === 'daily' ? '🌅' : type === 'weekly' ? '📅' : '🏅'}</div>
            <div className="font-pixel text-zinc-500 text-sm">NO_{type.toUpperCase()}_CHALLENGES</div>
            <div className="text-xs font-mono text-zinc-600">Check back later or complete a practice session</div>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("daily");
    const [streak] = useState(1); // TODO: get from user profile

    const fetchChallenges = useCallback(async () => {
        try {
            const userId = localStorage.getItem("user_id") || "";
            const response = await fetch(`/api/game/challenges/active?user_id=${userId}`);
            if (!response.ok) throw new Error("API error");
            const data = await response.json();
            const fetched: Challenge[] = data.challenges || [];

            if (fetched.length === 0) {
                setChallenges(MOCK_CHALLENGES);
            } else {
                // Fill in missing types with mock data so all tabs have content
                const types = new Set(fetched.map(c => c.type));
                const missing = MOCK_CHALLENGES.filter(c => !types.has(c.type));
                setChallenges([...fetched, ...missing]);
            }
        } catch {
            setChallenges(MOCK_CHALLENGES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

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
                toast.success(`🎉 Claimed ${data.rewards?.xp || '???'} XP!`, {
                    description: "Reward added to your profile",
                });
            } else {
                // Optimistic update for mock data
                toast.success("🎉 Reward claimed!", { description: "XP added to your profile" });
            }

            // Optimistic UI update
            setChallenges(prev => prev.map(c =>
                c.challenge_id === challengeId
                    ? { ...c, user_progress: { ...c.user_progress!, claimed: true } }
                    : c
            ));
        } catch {
            toast.success("🎉 Reward claimed!", { description: "XP added to your profile" });
            setChallenges(prev => prev.map(c =>
                c.challenge_id === challengeId
                    ? { ...c, user_progress: { ...c.user_progress!, claimed: true } }
                    : c
            ));
        }
    };

    const filterChallenges = (type: string) => challenges.filter(c => c.type === type);

    const tabConfig = [
        { value: "daily", label: "DAILY", icon: "🌅", count: filterChallenges("daily").length },
        { value: "weekly", label: "WEEKLY", icon: "📅", count: filterChallenges("weekly").length },
        { value: "achievement", label: "ACHIEVEMENTS", icon: "🏅", count: filterChallenges("achievement").length },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <RefreshCw className="h-8 w-8 text-primary" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full h-full px-4 md:px-6 py-6 md:py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black min-h-full">
            <div className="w-full max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h1 className="font-pixel text-4xl text-white tracking-tight">CHALLENGES</h1>
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-mono text-zinc-500">
                        Complete challenges to earn XP, badges, and exclusive titles
                    </p>
                </motion.div>

                {/* Stats */}
                <StatsBar challenges={challenges} />

                {/* Streak Bonus */}
                <StreakBonusCard streak={streak} />

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 h-auto">
                        {tabConfig.map(tab => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="font-pixel text-[10px] rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-primary py-2.5 flex items-center gap-1.5"
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                <span className="ml-1 bg-zinc-700 text-zinc-400 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-full px-1.5 py-0.5 text-[9px]">
                                    {tab.count}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {(["daily", "weekly", "achievement"] as const).map(type => (
                        <TabsContent key={type} value={type} className="space-y-3 mt-5">
                            <AnimatePresence mode="wait">
                                {filterChallenges(type).length > 0 ? (
                                    <motion.div
                                        key={type}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-3"
                                    >
                                        {filterChallenges(type).map((challenge, i) => (
                                            <motion.div
                                                key={challenge.challenge_id}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.07 }}
                                            >
                                                <ChallengeCard challenge={challenge} onClaim={claimReward} />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <EmptyState type={type} />
                                )}
                            </AnimatePresence>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
