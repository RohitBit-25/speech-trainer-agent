"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
    password: string;
}

interface Requirement {
    label: string;
    test: (password: string) => boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const requirements: Requirement[] = [
        { label: "At least 6 characters", test: (p) => p.length >= 6 },
        { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
        { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
        { label: "Contains number", test: (p) => /[0-9]/.test(p) },
    ];

    const metRequirements = requirements.filter((req) => req.test(password));
    const strength = (metRequirements.length / requirements.length) * 100;

    const getStrengthColor = () => {
        if (strength === 0) return "bg-zinc-700";
        if (strength <= 25) return "bg-red-500";
        if (strength <= 50) return "bg-orange-500";
        if (strength <= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthLabel = () => {
        if (strength === 0) return "";
        if (strength <= 25) return "WEAK";
        if (strength <= 50) return "FAIR";
        if (strength <= 75) return "GOOD";
        return "STRONG";
    };

    if (!password) return null;

    return (
        <div className="space-y-2">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-zinc-500">PASSWORD_STRENGTH</span>
                    <span className={`text-xs font-pixel ${strength >= 75 ? "text-green-500" : strength >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                        {getStrengthLabel()}
                    </span>
                </div>
                <div className="h-2 bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${strength}%` }}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-1">
                {requirements.map((req, index) => {
                    const isMet = req.test(password);
                    return (
                        <div
                            key={index}
                            className={`flex items-center gap-2 text-xs font-mono transition-colors ${isMet ? "text-green-500" : "text-zinc-600"
                                }`}
                        >
                            {isMet ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                <X className="h-3 w-3" />
                            )}
                            {req.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
