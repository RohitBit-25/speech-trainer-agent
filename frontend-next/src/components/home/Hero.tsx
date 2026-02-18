"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, Terminal } from "lucide-react";

export function Hero() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 flex flex-col items-center justify-center text-center space-y-8 relative z-10">

            {/* Floating Pixel Elements */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 md:left-20 text-4xl hidden md:block"
            >
                👾
            </motion.div>
            <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 right-10 md:right-20 text-4xl hidden md:block"
            >
                💾
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 max-w-3xl"
            >
                <div className="inline-block px-4 py-1.5 mb-4 border-2 border-primary bg-primary/10 text-primary font-pixel text-xs tracking-wider rounded-none uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                    Pass Level 1: Public Speaking
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-pixel tracking-tighter text-white drop-shadow-[4px_4px_0px_rgba(34,197,94,0.5)]">
                    LEVEL UP YOUR<br />
                    <span className="text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">SPEECH SKILLS</span>
                </h1>

                <div className="flex items-center justify-center gap-3 mt-2">
                    <img src="/vaanix-logo.png" alt="VaaniX" className="h-10 w-10 rounded-lg border-2 border-orange-500/50" />
                    <span className="font-pixel text-2xl text-white">Vaani</span><span className="font-pixel text-2xl text-orange-400">X</span>
                    <span className="font-mono text-xs text-orange-500/70 self-end mb-1">v2.0</span>
                </div>

                <p className="mx-auto max-w-[700px] text-zinc-300 md:text-xl font-mono leading-relaxed bg-black/50 p-4 border border-dashed border-zinc-700">
                    Your personal <span className="text-secondary font-bold">AI Companion</span> for mastering communication.
                    Upload a video, get instant XP, and unlock confidence.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <div className="flex items-center gap-2 px-6 py-2 bg-zinc-800 border-2 border-zinc-600 font-pixel text-xs text-zinc-400">
                    <Terminal className="w-4 h-4" />
                    <span>READY_PLAYER_ONE...</span>
                </div>
            </motion.div>
        </section>
    );
}
