"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Mic, BarChart3, Trophy, ArrowRight, Zap, Target, Brain, Terminal, Server, ShieldCheck, Activity, Waves, Radio, Eye } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b-4 border-primary/20 bg-black min-h-screen flex items-center pt-24 pb-16">
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {/* Primary grid with glow */}
                    <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:80px_80px]"></div>
                    {/* Secondary finer grid */}
                    <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    {/* Radial gradient overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.06),transparent_60%)]"></div>
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_80%,black_100%)]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >
                            <motion.div 
                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border-2 border-primary/30 text-xs font-mono text-zinc-400 shadow-[4px_4px_0px_#000] backdrop-blur-sm"
                                animate={{ 
                                    boxShadow: [
                                        "4px_4px_0px_#000",
                                        "6px_6px_0px_rgba(251,146,60,0.3)",
                                        "4px_4px_0px_#000"
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <motion.span 
                                    className="w-2.5 h-2.5 rounded-full bg-primary"
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <Waves className="h-3 w-3 text-primary" />
                                SYSTEM_ACTIVE // v2.4.9
                            </motion.div>

                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tight break-words leading-none">
                                    <span className="block font-pixel text-3xl md:text-4xl mb-3 text-zinc-500">Stop sounding like</span>
                                    <motion.span 
                                        className="text-primary block"
                                        animate={{ 
                                            textShadow: [
                                                "4px_4px_0px_#000,0_0_20px_rgba(251,146,60,0.3)",
                                                "4px_4px_0px_#000,0_0_40px_rgba(251,146,60,0.5)",
                                                "4px_4px_0px_#000,0_0_20px_rgba(251,146,60,0.3)"
                                            ]
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        "LIKE, UM..."
                                    </motion.span>
                                    <span className="text-white block mt-2">Start commanding</span>
                                    <span className="text-secondary block">the room.</span>
                                </h1>
                            </div>

                            <p className="text-lg md:text-xl text-zinc-400 font-mono max-w-xl leading-relaxed">
                                Your presentation doesn't need <span className="line-through text-zinc-600">magic</span> — it needs <span className="text-primary font-bold">data</span>. 
                                Record yourself. Get instant feedback on your <span className="text-secondary font-semibold">filler words</span>, <span className="text-secondary font-semibold">pacing</span>, and <span className="text-secondary font-semibold">body language</span>. 
                                Then watch your confidence score <span className="text-primary">skyrocket</span>.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <Button className="w-full sm:w-auto font-pixel text-sm bg-primary text-black hover:bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.8)] hover:shadow-[8px_8px_0px_rgba(251,146,60,0.5)] transition-all h-auto py-4 px-8 whitespace-normal group">
                                            <Zap className="mr-2 h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
                                            Start Free
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/login">
                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" className="w-full sm:w-auto font-pixel text-sm h-auto py-4 px-8 border-4 border-zinc-700 bg-zinc-900/80 text-white hover:bg-zinc-800 hover:text-white hover:border-primary/50 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(251,146,60,0.3)] transition-all whitespace-normal backdrop-blur-sm group">
                                            <Terminal className="mr-2 h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                                            I have an account
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Visual / Terminal Mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="absolute -inset-2 bg-primary/20 blur-3xl rounded-full opacity-50"></div>
                            <motion.div 
                                className="relative bg-zinc-950 border-4 border-primary/40 shadow-[16px_16px_0px_rgba(0,0,0,1)] p-1 flex flex-col h-auto min-h-[500px] hover:border-primary/60 transition-colors"
                                whileHover={{ y: -4, boxShadow: "20px_20px_0px_rgba(251,146,60,0.3)" }}
                            >
                                {/* Terminal Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b-4 border-primary/30">
                                    <div className="flex gap-2">
                                        <motion.div 
                                            className="w-3.5 h-3.5 rounded-full bg-red-500"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                        <motion.div 
                                            className="w-3.5 h-3.5 rounded-full bg-yellow-500"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                        <motion.div 
                                            className="w-3.5 h-3.5 rounded-full bg-green-500"
                                            whileHover={{ scale: 1.2 }}
                                        />
                                    </div>
                                    <span className="font-pixel text-[11px] text-primary break-words max-w-[50%] text-right">DIAGNOSTICS_TERMINAL</span>
                                </div>
                                {/* Terminal Body */}
                                <div className="p-6 font-mono text-sm flex-1 overflow-hidden relative bg-black/50">
                                    <div className="text-zinc-500 mb-2 break-all">$ vaanix analyze presentation.mp4</div>
                                    <motion.div 
                                        className="text-primary mb-4 font-bold"
                                        animate={{ opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ✓ Processing 2:43 of video
                                    </motion.div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-2 text-zinc-400">
                                                <span>Filler words detected...</span>
                                                <span className="text-yellow-500 font-bold">12 instances</span>
                                            </div>
                                            <div className="h-3 bg-zinc-900 border-2 border-zinc-800 relative overflow-hidden">
                                                <div className="h-full bg-yellow-500 w-[35%] shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-2 text-zinc-400">
                                                <span>Speech pace...</span>
                                                <span className="text-green-500 font-bold">142 wpm (optimal)</span>
                                            </div>
                                            <div className="h-3 bg-zinc-900 border-2 border-zinc-800"><div className="h-full bg-green-500 w-[85%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-2 text-zinc-400">
                                                <span>Eye contact maintained...</span>
                                                <span className="text-primary font-bold">78%</span>
                                            </div>
                                            <div className="h-3 bg-zinc-900 border-2 border-zinc-800"><div className="h-full bg-primary w-[78%] shadow-[0_0_10px_rgba(251,146,60,0.5)]"></div></div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-3 bg-primary/10 border-l-4 border-primary">
                                        <div className="text-[10px] text-primary mb-1">💡 QUICK TIP</div>
                                        <div className="text-xs text-zinc-300">Reduce "um" by 40% → +15 confidence points</div>
                                    </div>

                                    {/* Decorator Grid inside terminal */}
                                    <div className="absolute right-4 bottom-4 grid grid-cols-4 gap-1 opacity-20">
                                        {[...Array(16)].map((_, i) => (
                                            <motion.div 
                                                key={i} 
                                                className={`w-1.5 h-1.5 ${i % 3 === 0 ? 'bg-primary' : 'bg-zinc-500'}`}
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Core Systems / Features */}
            <section className="py-24 border-b-4 border-primary/20 bg-zinc-950 relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.05),transparent_60%)]"></div>
                
                <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-16">
                        <div className="max-w-2xl">
                            <motion.h2 
                                className="text-3xl md:text-5xl font-bold text-white font-pixel mb-4 flex items-center gap-3 break-words"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Server className="w-8 h-8 text-primary shrink-0" />
                                </motion.div>
                                What We Track
                            </motion.h2>
                            <p className="text-zinc-400 font-mono text-lg leading-relaxed">
                                Real metrics that actually matter. No fluff, no vague scores — just actionable data you can improve on.
                            </p>
                        </div>
                        <motion.div 
                            className="font-mono text-xs text-primary border-2 border-primary px-4 py-2 bg-primary/10 w-fit shrink-0 shadow-[4px_4px_0px_rgba(251,146,60,0.3)]"
                            animate={{ 
                                boxShadow: [
                                    "4px_4px_0px_rgba(251,146,60,0.3)",
                                    "6px_6px_0px_rgba(251,146,60,0.5)",
                                    "4px_4px_0px_rgba(251,146,60,0.3)"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            UPTIME: 99.9%
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                id: "mod-1",
                                icon: <Target className="w-6 h-6" />,
                                title: "Filler Word Detector",
                                desc: "Counts every 'um', 'like', 'you know'. Shows you exactly where they happen in your speech timeline. Because awareness is the first step to fixing it.",
                                stat: "REAL-TIME"
                            },
                            {
                                id: "mod-2",
                                icon: <Eye className="w-6 h-6" />,
                                title: "Eye Contact Analysis",
                                desc: "Tracks how often you look at the camera. In the real world, this means knowing if you're actually connecting with your audience or just talking at them.",
                                stat: "468 POINTS"
                            },
                            {
                                id: "mod-3",
                                icon: <Radio className="w-6 h-6" />,
                                title: "Speech Pace Monitor",
                                desc: "Measures words per minute. Too fast? They can't follow. Too slow? They'll zone out. We'll tell you exactly where you hit the sweet spot.",
                                stat: "WPM TRACKING"
                            }
                        ].map((mod, i) => (
                            <motion.div
                                key={mod.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{ y: -4, boxShadow: "12px_12px_0px_rgba(251,146,60,0.3)" }}
                                className="group relative bg-black border-4 border-zinc-800 hover:border-primary/50 p-6 flex flex-col overflow-hidden transition-all shadow-[8px_8px_0px_#000]"
                            >
                                {/* Background glow on hover */}
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <motion.div 
                                        className="bg-zinc-900 border-2 border-zinc-700 p-3 text-zinc-300 group-hover:text-primary group-hover:border-primary transition-colors shadow-[4px_4px_0px_#000]"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        {mod.icon}
                                    </motion.div>
                                    <div className="text-[11px] font-mono text-zinc-600 bg-zinc-900 px-3 py-1.5 border-2 border-zinc-800 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                        {mod.stat}
                                    </div>
                                </div>

                                <h3 className="font-pixel text-lg text-white mb-3 relative z-10 group-hover:text-primary transition-colors">{mod.title}</h3>
                                <p className="text-zinc-500 font-mono text-sm leading-relaxed flex-1 relative z-10">{mod.desc}</p>

                                <div className="mt-6 pt-4 border-t-2 border-zinc-800 border-dashed flex justify-between items-center relative z-10">
                                    <span className="font-pixel text-[11px] text-zinc-600 group-hover:text-primary transition-colors">STATUS: ON_STANDBY</span>
                                    <div className="flex gap-1.5">
                                        <motion.div 
                                            className="w-2 h-2 bg-zinc-700 rounded-full group-hover:bg-primary transition-colors"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <div className="w-2 h-2 bg-zinc-700 rounded-full group-hover:bg-primary/50 transition-colors"></div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Protocol */}
            <section className="py-24 border-b-4 border-primary/20 bg-black relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.05),transparent_60%)]"></div>
                
                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="text-center mb-16">
                        <motion.div 
                            className="inline-flex items-center gap-2 text-primary font-mono text-xs mb-4 px-4 py-2 border-2 border-primary/30 bg-primary/10 shadow-[4px_4px_0px_rgba(251,146,60,0.3)]"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <ShieldCheck className="w-4 h-4" /> SECURE_CONNECTION
                        </motion.div>
                        <motion.h2 
                            className="text-3xl md:text-5xl font-bold text-white font-pixel break-words"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            How It Works
                        </motion.h2>
                    </div>

                    <div className="relative border-l-4 border-primary/30 ml-4 md:ml-12 pb-4">
                        {[
                            { step: "01", title: "Record Yourself", desc: "Upload a video of your speech or presentation. We support .mp4, .webm, .mov — pretty much anything. Max 100MB." },
                            { step: "02", title: "Get Instant Analysis", desc: "Our AI breaks down your video second-by-second. Filler words, pacing, eye contact, body language — all scored and timestamped." },
                            { step: "03", title: "See What to Fix", desc: "Interactive dashboard shows you exactly where to improve. Click any metric to jump to that moment in your video. Practice, upload again, watch your scores climb." }
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="mb-12 relative pl-8 md:pl-12"
                            >
                                {/* Marker */}
                                <motion.div 
                                    className="absolute -left-[14px] top-0 w-6 h-6 bg-black border-4 border-primary rounded-full z-10 flex items-center justify-center shadow-[0_0_15px_rgba(251,146,60,0.6)]"
                                    whileHover={{ scale: 1.2 }}
                                >
                                    <motion.div 
                                        className="w-2 h-2 bg-primary rounded-full"
                                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </motion.div>
                                {/* Connector line from marker */}
                                <div className="absolute left-[8px] top-3 w-4 md:w-8 border-t-2 border-primary/30 border-dashed -z-10"></div>

                                <motion.div 
                                    className="bg-zinc-950 border-2 border-zinc-800 p-6 md:flex gap-6 items-start hover:border-primary/40 transition-colors shadow-[8px_8px_0px_#000]"
                                    whileHover={{ y: -2, boxShadow: "10px_10px_0px_rgba(251,146,60,0.2)" }}
                                >
                                    <div className="font-pixel text-4xl text-zinc-800 md:w-20 hidden sm:block select-none pointer-events-none">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-pixel text-primary mb-2 text-lg break-words">{item.title}</h3>
                                        <p className="font-mono text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gamification */}
            <section className="py-24 border-b-4 border-primary/20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.06),transparent_60%)]"></div>
                
                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-pixel mb-6 leading-tight break-words">
                                Track Your Progress.<br />
                                See Real Growth.
                            </h2>
                            <p className="text-zinc-400 font-mono text-lg mb-8 leading-relaxed">
                                Every session earns you XP. Watch your level climb. Compare your scores over time. 
                                See <span className="text-white">measurable improvement</span> — not motivational BS.
                            </p>

                            <ul className="space-y-4 font-mono text-sm text-zinc-300">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary"></div>
                                    Track improvement session-to-session
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-secondary"></div>
                                    Unlock achievements as you hit milestones
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-yellow-400"></div>
                                    Compare yourself against your past self
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -4 }}
                            className="bg-zinc-900 border-4 border-primary/40 p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_rgba(251,146,60,0.3)] transition-all relative"
                        >
                            {/* Tape accent */}
                            <div className="absolute -top-3 -right-3 w-16 h-6 bg-yellow-500/80 -rotate-12 sm:flex items-center justify-center font-mono text-[8px] text-black font-bold uppercase tracking-widest hidden shadow-sm z-10">
                                CLASSIFIED
                            </div>

                            <div className="flex justify-between items-start border-b-2 border-zinc-800 pb-6 mb-6">
                                <div>
                                    <div className="font-pixel text-xs text-zinc-500 mb-1">AGENT_PROFILE</div>
                                    <div className="font-pixel text-xl text-white">USER_9942</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-pixel text-xs text-zinc-500 mb-1">LVL</div>
                                    <div className="font-pixel text-3xl text-primary">15</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-mono text-zinc-400">
                                    <span>XP_PROGRESS</span>
                                    <span>11,250 / 15,000</span>
                                </div>
                                <div className="h-4 bg-black border-2 border-zinc-800 p-0.5">
                                    <div className="h-full bg-primary w-[75%] relative">
                                        {/* Stripe pattern in progress bar */}
                                        <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.2)_75%,rgba(0,0,0,0.2)_100%)] bg-[length:10px_10px]"></div>
                                    </div>
                                </div>
                                <div className="font-pixel text-[10px] text-center text-zinc-500">
                                    RANK: <span className="text-white">MASTER_SPEAKER</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mt-8">
                                <div className="aspect-square bg-black border-2 border-primary flex items-center justify-center relative shadow-[2px_2px_0px_#000]">
                                    <Trophy className="w-5 h-5 text-primary opacity-50" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black"></div>
                                </div>
                                <div className="aspect-square bg-black border-2 border-zinc-800 flex items-center justify-center opacity-40">
                                    <Target className="w-5 h-5 text-zinc-500" />
                                </div>
                                <div className="aspect-square bg-black border-2 border-zinc-800 flex items-center justify-center opacity-40">
                                    <Activity className="w-5 h-5 text-zinc-500" />
                                </div>
                                <div className="aspect-square bg-black border-2 border-zinc-800 flex items-center justify-center font-mono text-xs text-zinc-700">
                                    +5
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-black border-b-4 border-primary/20 relative z-0 overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.08),transparent_70%)]"></div>
                
                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <motion.div 
                        className="bg-zinc-950 border-4 border-primary p-8 md:p-16 relative shadow-[16px_16px_0px_rgba(0,0,0,1)] hover:shadow-[20px_20px_0px_rgba(251,146,60,0.4)] transition-all"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -4 }}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/30"></div>
                        <motion.h2 
                            className="text-3xl md:text-5xl font-bold mb-6 text-white font-pixel uppercase break-all"
                            animate={{ 
                                textShadow: [
                                    "0_0_10px_rgba(251,146,60,0.2)",
                                    "0_0_20px_rgba(251,146,60,0.4)",
                                    "0_0_10px_rgba(251,146,60,0.2)"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            Ready to Sound Confident?
                        </motion.h2>
                        <p className="text-zinc-400 font-mono mb-10 text-lg">
                            Upload a 2-minute video. Get your first analysis in 60 seconds. 
                            No credit card required. Just start improving your speaking.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/signup">
                                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                    <Button className="w-full sm:w-auto font-pixel text-sm bg-primary text-black hover:bg-white border-2 border-primary hover:border-white h-auto py-4 px-8 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_rgba(251,146,60,0.5)] transition-all whitespace-normal">
                                        Start Free →
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-black text-center border-t-2 border-primary/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-4xl mx-auto">
                        <div className="flex items-center gap-2">
                            <span className="font-pixel text-sm text-white">VAANI</span>
                            <span className="font-pixel text-sm text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse">X</span>
                            <span className="font-pixel text-[10px] text-zinc-600 ml-2">
                                SPEECH_TRAINER_OS v2.4 // 2026_ESTABLISHED
                            </span>
                        </div>
                        <div className="flex gap-6 font-mono text-xs text-zinc-600 uppercase">
                            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                            <span className="text-zinc-800">|</span>
                            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
