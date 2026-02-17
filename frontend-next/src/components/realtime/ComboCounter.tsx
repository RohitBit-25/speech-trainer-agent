"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Target } from 'lucide-react';

interface ComboCounterProps {
    combo: number;
    multiplier: number;
    status: string;
}

export function ComboCounter({ combo, multiplier, status }: ComboCounterProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'LEGENDARY':
                return { color: '#a855f7', text: 'LEGENDARY!', icon: Trophy };
            case 'UNSTOPPABLE':
                return { color: '#f59e0b', text: 'UNSTOPPABLE!', icon: Zap };
            case 'ON_FIRE':
                return { color: '#ef4444', text: 'ON FIRE!', icon: Target };
            case 'GOOD_START':
                return { color: '#10b981', text: 'GOOD START!', icon: Zap };
            case 'COMBO_BROKEN':
                return { color: '#6b7280', text: 'COMBO BROKEN', icon: null };
            default:
                return { color: '#6b7280', text: 'START', icon: null };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <motion.div
            className="relative"
            animate={combo > 0 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            <div
                className="border-4 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]"
                style={{ borderColor: config.color }}
            >
                {/* Combo count */}
                <div className="text-center mb-2">
                    <motion.div
                        key={combo}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-pixel font-bold"
                        style={{ color: config.color }}
                    >
                        {combo}x
                    </motion.div>
                    <div className="text-xs font-pixel text-zinc-400 uppercase mt-1">COMBO</div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 mt-3">
                    {Icon && <Icon className="h-4 w-4" style={{ color: config.color }} />}
                    <span
                        className="text-sm font-pixel uppercase"
                        style={{ color: config.color }}
                    >
                        {config.text}
                    </span>
                </div>

                {/* Multiplier */}
                {multiplier > 1 && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="mt-3 text-center"
                    >
                        <div className="inline-block bg-primary text-black px-3 py-1 font-pixel text-sm border-2 border-black">
                            {multiplier}x MULTIPLIER
                        </div>
                    </motion.div>
                )}

                {/* Particle effects for high combos */}
                <AnimatePresence>
                    {combo >= 30 && (
                        <>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: config.color,
                                        top: '50%',
                                        left: '50%'
                                    }}
                                    initial={{ scale: 0, x: 0, y: 0 }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        x: Math.cos((i * Math.PI) / 3) * 60,
                                        y: Math.sin((i * Math.PI) / 3) * 60
                                    }}
                                    exit={{ scale: 0 }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        repeatDelay: 0.5
                                    }}
                                />
                            ))}
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
