"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, TrendingUp, Flame, Star } from "lucide-react";

interface MultiplierDisplayProps {
    multiplier: number;
    breakdown?: {
        base?: number;
        combo?: number;
        streak?: number;
        perfect?: number;
    };
    showBreakdown?: boolean;
}

export function MultiplierDisplay({ multiplier, breakdown, showBreakdown = false }: MultiplierDisplayProps) {
    const getMultiplierColor = (mult: number) => {
        if (mult >= 4) return "text-purple-500";
        if (mult >= 3) return "text-pink-500";
        if (mult >= 2) return "text-orange-500";
        return "text-primary";
    };

    const getMultiplierGlow = (mult: number) => {
        if (mult >= 4) return "shadow-[0_0_30px_rgba(168,85,247,0.6)]";
        if (mult >= 3) return "shadow-[0_0_25px_rgba(236,72,153,0.5)]";
        if (mult >= 2) return "shadow-[0_0_20px_rgba(251,146,60,0.4)]";
        return "shadow-[0_0_15px_rgba(255,153,51,0.3)]";
    };

    return (
        <div className="relative">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
            >
                <Card className={`bg-zinc-900 border-2 border-primary ${getMultiplierGlow(multiplier)}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 2
                                    }}
                                >
                                    <Zap className={`h-6 w-6 ${getMultiplierColor(multiplier)}`} />
                                </motion.div>
                                <div>
                                    <div className="text-xs font-mono text-zinc-400">MULTIPLIER</div>
                                    <motion.div
                                        key={multiplier}
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`text-3xl font-pixel ${getMultiplierColor(multiplier)}`}
                                    >
                                        {multiplier.toFixed(1)}x
                                    </motion.div>
                                </div>
                            </div>

                            {/* Visual Indicator */}
                            <div className="flex flex-col gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`h-1 w-8 rounded ${i < Math.floor(multiplier)
                                            ? "bg-primary"
                                            : "bg-zinc-700"
                                            }`}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Breakdown */}
                        <AnimatePresence>
                            {showBreakdown && breakdown && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-4 pt-4 border-t-2 border-zinc-700 space-y-2"
                                >
                                    {breakdown.base && (
                                        <div className="flex items-center justify-between text-xs font-mono">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Star className="h-3 w-3" />
                                                <span>Base (Difficulty)</span>
                                            </div>
                                            <span className="text-primary">+{breakdown.base?.toFixed(1) ?? "1.0"}x</span>
                                        </div>
                                    )}
                                    {breakdown.combo && breakdown.combo > 0 && (
                                        <div className="flex items-center justify-between text-xs font-mono">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Flame className="h-3 w-3" />
                                                <span>Combo Bonus</span>
                                            </div>
                                            <span className="text-orange-500">+{breakdown.combo?.toFixed(1) ?? "0.0"}x</span>
                                        </div>
                                    )}
                                    {breakdown.streak && breakdown.streak > 0 && (
                                        <div className="flex items-center justify-between text-xs font-mono">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>Streak Bonus</span>
                                            </div>
                                            <span className="text-green-500">+{breakdown.streak?.toFixed(1) ?? "0.0"}x</span>
                                        </div>
                                    )}
                                    {breakdown.perfect && breakdown.perfect > 0 && (
                                        <div className="flex items-center justify-between text-xs font-mono">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Star className="h-3 w-3" />
                                                <span>Perfect Bonus</span>
                                            </div>
                                            <span className="text-purple-500">+{breakdown.perfect?.toFixed(1) ?? "0.0"}x</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Floating particles effect for high multipliers */}
            {multiplier >= 3 && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-primary rounded-full"
                            initial={{
                                x: "50%",
                                y: "50%",
                                opacity: 1
                            }}
                            animate={{
                                x: `${50 + (Math.random() - 0.5) * 100}%`,
                                y: `${50 + (Math.random() - 0.5) * 100}%`,
                                opacity: 0
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
