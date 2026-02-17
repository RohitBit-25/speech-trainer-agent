"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap, Target, Trophy, Clock, AlertTriangle } from "lucide-react";

interface DifficultyConfig {
    level: string;
    target_scores: {
        facial: number;
        voice: number;
        content: number;
        overall: number;
    };
    time_limit: number | null;
    filler_word_tolerance: number;
    pace_range: [number, number];
    multiplier_base: number;
    xp_multiplier: number;
    unlock_level: number;
    description: string;
    color: string;
}

interface DifficultyConfigs {
    beginner: DifficultyConfig;
    intermediate: DifficultyConfig;
    expert: DifficultyConfig;
}


interface DifficultySelector {
    onSelect: (difficulty: string) => void;
    currentLevel?: number;
    selectedDifficulty?: string;
    variant?: 'default' | 'compact';
}

export function DifficultySelector({ onSelect, currentLevel = 1, selectedDifficulty = "intermediate", variant = "default" }: DifficultySelector) {
    const [configs, setConfigs] = useState<DifficultyConfigs | null>(null);
    const [selected, setSelected] = useState(selectedDifficulty);

    useEffect(() => {
        // Fetch difficulty configs from backend
        fetch("http://localhost:8000/game/difficulty-configs")
            .then(res => res.json())
            .then(data => setConfigs(data.configs))
            .catch(err => console.error("Failed to load difficulty configs:", err));
    }, []);

    if (!configs) {
        return <div className="text-center text-zinc-400">Loading...</div>;
    }

    const difficulties: Array<keyof DifficultyConfigs> = ["beginner", "intermediate", "expert"];

    const handleSelect = (difficulty: string) => {
        const config = configs[difficulty as keyof DifficultyConfigs];
        if (currentLevel >= config.unlock_level) {
            setSelected(difficulty);
            onSelect(difficulty);
        }
    };

    if (variant === "compact") {
        const selectedConfig = configs[selected as keyof DifficultyConfigs];
        return (
            <div className="space-y-3">
                {/* Horizontal Tabs */}
                <div className="grid grid-cols-3 gap-2">
                    {difficulties.map((difficulty) => {
                        const config = configs[difficulty];
                        const isLocked = currentLevel < config.unlock_level;
                        const isSelected = selected === difficulty;

                        return (
                            <button
                                key={difficulty}
                                onClick={() => !isLocked && handleSelect(difficulty)}
                                disabled={isLocked}
                                className={`
                                    relative py-2 px-1 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-1
                                    ${isLocked ? 'opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800' : ''}
                                    ${isSelected
                                        ? 'bg-zinc-800 border-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]'
                                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <span
                                    className={`font-pixel text-[9px] uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-zinc-500'}`}
                                >
                                    {difficulty}
                                </span>
                                {isLocked && <Lock className="absolute top-1 right-1 h-2 w-2 text-zinc-600" />}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Detail View */}
                <motion.div
                    key={selected}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card className="bg-zinc-900/50 border-2 border-zinc-800 relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 w-1 h-full"
                            style={{ backgroundColor: selectedConfig.color }}
                        />
                        <CardContent className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-mono text-zinc-400 leading-tight w-3/4">
                                    {selectedConfig.description}
                                </p>
                                <Badge variant="outline" className="text-[9px] font-pixel border-zinc-700">
                                    {selectedConfig.xp_multiplier}x XP
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                    <Target className="h-3 w-3 text-primary/70" />
                                    <span className="text-[10px] font-mono">{selectedConfig.target_scores.overall}+ Score</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                    <Clock className="h-3 w-3 text-blue-400/70" />
                                    <span className="text-[10px] font-mono">
                                        {selectedConfig.time_limit ? `${selectedConfig.time_limit / 60}m Limit` : "No Limit"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                    <AlertTriangle className="h-3 w-3 text-yellow-500/70" />
                                    <span className="text-[10px] font-mono">Max {selectedConfig.filler_word_tolerance} Fillers</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                    <Trophy className="h-3 w-3 text-purple-400/70" />
                                    <span className="text-[10px] font-mono">{selectedConfig.pace_range[0]}-{selectedConfig.pace_range[1]} WPM</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Default Full Card Layout
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="font-pixel text-2xl text-white mb-2">SELECT_DIFFICULTY</h2>
                <p className="text-sm text-zinc-400 font-mono">Choose your challenge level</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {difficulties.map((difficulty, index) => {
                    const config = configs[difficulty];
                    const isLocked = currentLevel < config.unlock_level;
                    const isSelected = selected === difficulty;

                    return (
                        <motion.div
                            key={difficulty}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className={`relative cursor-pointer transition-all ${isLocked
                                    ? "opacity-50 cursor-not-allowed"
                                    : isSelected
                                        ? "border-4 shadow-[0_0_20px_rgba(255,153,51,0.5)]"
                                        : "border-2 hover:border-primary/50"
                                    } bg-zinc-900`}
                                style={{
                                    borderColor: isSelected ? config.color : undefined
                                }}
                                onClick={() => !isLocked && handleSelect(difficulty)}
                            >
                                {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 rounded-lg">
                                        <div className="text-center">
                                            <Lock className="h-12 w-12 text-zinc-500 mx-auto mb-2" />
                                            <p className="text-xs font-mono text-zinc-400">
                                                Unlock at Level {config.unlock_level}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <CardHeader className="border-b-2 border-zinc-700">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-pixel text-lg uppercase" style={{ color: config.color }}>
                                            {difficulty}
                                        </CardTitle>
                                        {isSelected && (
                                            <Badge className="bg-primary text-black font-pixel text-xs">
                                                SELECTED
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-xs font-mono text-zinc-400 mt-2">
                                        {config.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-4 space-y-3">
                                    {/* XP Multiplier */}
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4" style={{ color: config.color }} />
                                        <span className="text-xs font-mono text-zinc-300">
                                            {config.xp_multiplier}x XP Multiplier
                                        </span>
                                    </div>

                                    {/* Target Scores */}
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4" style={{ color: config.color }} />
                                        <span className="text-xs font-mono text-zinc-300">
                                            {config.target_scores.overall}+ Target Score
                                        </span>
                                    </div>

                                    {/* Time Limit */}
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" style={{ color: config.color }} />
                                        <span className="text-xs font-mono text-zinc-300">
                                            {config.time_limit ? `${config.time_limit / 60} min limit` : "No time limit"}
                                        </span>
                                    </div>

                                    {/* Filler Words */}
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" style={{ color: config.color }} />
                                        <span className="text-xs font-mono text-zinc-300">
                                            Max {config.filler_word_tolerance} filler words
                                        </span>
                                    </div>

                                    {/* Pace Range */}
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4" style={{ color: config.color }} />
                                        <span className="text-xs font-mono text-zinc-300">
                                            {config.pace_range[0]}-{config.pace_range[1]} WPM
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {selected && (
                <div className="text-center">
                    <Button
                        onClick={() => onSelect(selected)}
                        className="font-pixel text-sm bg-primary text-black hover:bg-primary/90"
                    >
                        START_SESSION
                    </Button>
                </div>
            )}
        </div>
    );
}
