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
    Lock, Star, RefreshCw, Sparkles, Calendar, Award, ArrowRight,
    Eye, Mic, Brain, User, Filter, ChevronDown, Timer, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getActiveSessionChallenges, claimChallengeReward } from "@/lib/api";
import type { Challenge, SkillCategory, ChallengeType } from "@/lib/types";

// ─── Skill Category Helpers ────────────────────────────────────────────────────

const SKILL_CATEGORIES: Record<SkillCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    body_language: {
        label: "Body Language",
        icon: Eye,
        color: "text-blue-400",
        bg: "bg-blue-500/10 border-blue-500/30"
    },
    voice_control: {
        label: "Voice Control",
        icon: Mic,
        color: "text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/30"
    },
    content_clarity: {
        label: "Content Clarity",
        icon: Brain,
        color: "text-green-400",
        bg: "bg-green-500/10 border-green-500/30"
    },
    presence: {
        label: "Presence",
        icon: User,
        color: "text-pink-400",
        bg: "bg-pink-500/10 border-pink-500/30"
    },
    general: {
        label: "General",
        icon: Target,
        color: "text-zinc-400",
        bg: "bg-zinc-500/10 border-zinc-500/30"
    }
};

function SkillCategoryBadge({ category, showLabel = false }: { category: SkillCategory; showLabel?: boolean }) {
    const config = SKILL_CATEGORIES[category] || SKILL_CATEGORIES.general;
    const Icon = config.icon;
    
    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg border",
            config.bg
        )}>
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            {showLabel && (
                <span className={cn("text-[10px] font-medium uppercase tracking-wider", config.color)}>
                    {config.label}
                </span>
            )}
        </div>
    );
}

function CategoryFilter({ 
    selected, 
    onSelect 
}: { 
    selected: SkillCategory | "all"; 
    onSelect: (cat: SkillCategory | "all") => void;
}) {
    const categories: (SkillCategory | "all")[] = ["all", "body_language", "voice_control", "content_clarity", "presence"];
    
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-medium uppercase tracking-wider transition-all",
                        selected === cat
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                    )}
                >
                    {cat === "all" ? (
                        <>
                            <Filter className="w-3 h-3" />
                            All
                        </>
                    ) : (
                        <>
                            {(() => {
                                const Icon = SKILL_CATEGORIES[cat].icon;
                                return <Icon className="w-3 h-3" />;
                            })()}
                            {SKILL_CATEGORIES[cat].label}
                        </>
                    )}
                </button>
            ))}
        </div>
    );
}

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
    const skillCategory = challenge.requirements?.skill_category || "general";

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

    // Estimate time for micro-challenges
    const getEstimatedTime = () => {
        if (challenge.requirements?.min_duration) {
            return Math.ceil(challenge.requirements.min_duration / 60);
        }
        if (challenge.type === "daily") return 2;
        if (challenge.type === "weekly") return 15;
        return 5;
    };
    const estimatedMinutes = getEstimatedTime();
    const isQuickWin = estimatedMinutes <= 5;

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
                    <div className="flex items-start gap-3 mb-3">
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

                    {/* Skill Category & Quick Win Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <SkillCategoryBadge category={skillCategory} showLabel />
                        {isQuickWin && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-pixel text-[9px]">
                                <Timer className="h-3 w-3 mr-1" />
                                {estimatedMinutes} MIN
                            </Badge>
                        )}
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
function EmptyState({ type, category }: { type: string; category?: string }) {
    const icons: Record<string, string> = {
        daily: '🌅',
        weekly: '📅',
        achievement: '🏅'
    };
    
    const messages: Record<string, string> = {
        daily: "Check back tomorrow for new daily challenges!",
        weekly: "New weekly challenges arrive every Monday!",
        achievement: "Complete practice sessions to unlock achievements!"
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 space-y-3"
        >
            <div className="text-5xl">{icons[type] || '🎯'}</div>
            <div className="font-pixel text-zinc-500 text-sm">
                NO_{type.toUpperCase()}_CHALLENGES{category && category !== 'all' ? '_IN_CATEGORY' : ''}
            </div>
            <div className="text-xs font-mono text-zinc-600 max-w-xs mx-auto">
                {category && category !== 'all' 
                    ? `No ${type} challenges for this skill category. Try another filter!`
                    : messages[type] || "Check back later or complete a practice session"
                }
            </div>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("daily");
    const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");
    const [streak] = useState(1); // TODO: get from user profile

    const fetchChallenges = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const userStr = localStorage.getItem("user");
            const userId = userStr ? JSON.parse(userStr).id : null;
            
            if (!userId) {
                setError("Please log in to view challenges");
                setChallenges([]);
                return;
            }

            const data = await getActiveSessionChallenges(userId);
            
            // Transform backend response to Challenge type
            const transformed: Challenge[] = data.challenges.map(c => ({
                challenge_id: c.challenge_id,
                type: c.type,
                title: c.title,
                description: c.description,
                difficulty: c.difficulty,
                requirements: c.requirements,
                rewards: c.rewards,
                expires_at: undefined, // Backend doesn't return this for active session endpoint
                skill_category: c.skill_category,
                user_progress: {
                    progress: c.progress,
                    completed: c.completed,
                    claimed: c.claimed,
                    current_value: c.current_value,
                    target_value: c.target_value
                }
            }));
            
            setChallenges(transformed);
        } catch (err) {
            console.error('Error fetching challenges:', err);
            setError(err instanceof Error ? err.message : 'Failed to load challenges');
            setChallenges([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

    const claimReward = async (challengeId: string) => {
        try {
            const userStr = localStorage.getItem("user");
            const userId = userStr ? JSON.parse(userStr).id : null;
            
            if (!userId) {
                toast.error("Please log in to claim rewards");
                return;
            }

            const data = await claimChallengeReward(challengeId, userId);

            toast.success(`🎉 Claimed ${data.rewards?.xp || 0} XP!`, {
                description: data.rewards?.badge_id ? "Badge unlocked!" : "Reward added to your profile",
            });

            // Optimistic UI update
            setChallenges(prev => prev.map(c =>
                c.challenge_id === challengeId
                    ? { ...c, user_progress: { ...c.user_progress!, claimed: true } }
                    : c
            ));
            
            // Refresh to get updated state
            setTimeout(() => fetchChallenges(), 500);
        } catch (err) {
            toast.error("Failed to claim reward", {
                description: err instanceof Error ? err.message : "Please try again"
            });
        }
    };

    const filterChallenges = (type: string) => {
        let filtered = challenges.filter(c => c.type === type);
        if (selectedCategory !== "all") {
            filtered = filtered.filter(c => 
                (c.requirements?.skill_category || "general") === selectedCategory
            );
        }
        return filtered;
    };

    const tabConfig = [
        { value: "daily", label: "DAILY", icon: "🌅", count: filterChallenges("daily").length },
        { value: "weekly", label: "WEEKLY", icon: "📅", count: filterChallenges("weekly").length },
        { value: "achievement", label: "ACHIEVEMENTS", icon: "🏅", count: filterChallenges("achievement").length },
    ];

    // Get unique skill categories from current challenges
    const availableCategories = Array.from(new Set(
        challenges.map(c => c.requirements?.skill_category || "general")
    )) as SkillCategory[];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col items-center gap-4"
                >
                    <RefreshCw className="h-8 w-8 text-primary" />
                    <span className="text-sm font-mono text-zinc-500">Loading challenges...</span>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 max-w-md"
                >
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="font-pixel text-xl text-white">Oops!</h2>
                    <p className="text-sm font-mono text-zinc-400">{error}</p>
                    <Button
                        onClick={fetchChallenges}
                        variant="outline"
                        className="border-zinc-700 hover:border-primary"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
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

                {/* Category Filter */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600">
                        <Filter className="w-3 h-3" />
                        <span>Filter by Skill</span>
                    </div>
                    <CategoryFilter 
                        selected={selectedCategory} 
                        onSelect={setSelectedCategory} 
                    />
                </div>

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
                                    <EmptyState type={type} category={selectedCategory} />
                                )}
                            </AnimatePresence>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
