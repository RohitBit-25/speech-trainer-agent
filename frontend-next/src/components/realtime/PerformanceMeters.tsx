"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetersProps {
    facialScore: number;
    voiceScore: number;
    engagementScore: number;
}

export function PerformanceMeters({ facialScore, voiceScore, engagementScore }: PerformanceMetersProps) {
    return (
        <div className="flex gap-6">
            <CircularMeter
                label="Facial"
                score={facialScore}
                icon="😊"
            />
            <CircularMeter
                label="Voice"
                score={voiceScore}
                icon="🎵"
            />
            <CircularMeter
                label="Engagement"
                score={engagementScore}
                icon="⚡"
            />
        </div>
    );
}

interface CircularMeterProps {
    label: string;
    score: number;
    icon: string;
}

function CircularMeter({ label, score, icon }: CircularMeterProps) {
    // Safety check: Convert NaN to 0, and clamp between 0-100
    const safeScore = (isNaN(score) || score === undefined || score === null) ? 0 : Math.min(Math.max(score, 0), 100);

    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (safeScore / 100) * circumference;

    // Color based on safeScore
    const getColor = (val: number) => {
        if (val >= 70) return '#10b981'; // green
        if (val >= 40) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    const color = getColor(safeScore);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-zinc-800"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="48"
                        cy="48"
                        r="45"
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl">{icon}</span>
                    <motion.span
                        key={safeScore}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-lg font-bold font-pixel"
                        style={{ color }}
                    >
                        {Math.round(safeScore)}
                    </motion.span>
                </div>
            </div>

            <span className="text-xs font-pixel text-zinc-400 uppercase">{label}</span>
        </div>
    );
}
