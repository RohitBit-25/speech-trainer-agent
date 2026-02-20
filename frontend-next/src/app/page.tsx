"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Mic, BarChart3, Trophy, ArrowRight, Zap, Target, Brain, Terminal, Server, ShieldCheck, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b-4 border-zinc-800 bg-black min-h-screen flex items-center pt-24 pb-16">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>

                <div className="container mx-auto px-4 relative z-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-400 shadow-[4px_4px_0px_#000]">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                SYS.STATUS: ONLINE // INITIALIZING
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tight break-words">
                                <span className="block font-pixel text-4xl md:text-5xl mb-4">Command Your</span>
                                <span className="text-primary [text-shadow:4px_4px_0px_#000]">VOCAL</span>
                                <br />
                                <span className="text-zinc-500 [text-shadow:4px_4px_0px_#000]">PRESENCE</span>
                            </h1>

                            <p className="text-lg md:text-xl text-zinc-400 font-mono max-w-xl leading-relaxed">
                                Upload visual data streams. Initialize <span className="text-primary font-bold">AI diagnostics</span>.
                                Extract real-time metrics on pitch, pace, and facial sentiment. Gain XP. Rank up.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <Button className="w-full sm:w-auto font-pixel text-sm bg-primary text-black hover:bg-primary/90 h-auto py-4 px-8 border-4 border-black shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-normal">
                                        <Zap className="mr-2 h-4 w-4 shrink-0" />
                                        INITIATE_TRAINING
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="outline" className="w-full sm:w-auto font-pixel text-sm h-auto py-4 px-8 border-4 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all whitespace-normal">
                                        <Terminal className="mr-2 h-4 w-4 shrink-0" />
                                        AGENT_LOGIN
                                    </Button>
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
                            <div className="absolute -inset-1 bg-primary/20 blur-2xl rounded-full opacity-50"></div>
                            <div className="relative bg-zinc-950 border-4 border-zinc-700 shadow-[16px_16px_0px_rgba(0,0,0,1)] p-1 flex flex-col h-auto min-h-[500px]">
                                {/* Terminal Header */}
                                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b-4 border-zinc-700">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="font-pixel text-[10px] text-zinc-500 break-words max-w-[50%] text-right">DIAGNOSTICS_TERMINAL</span>
                                </div>
                                {/* Terminal Body */}
                                <div className="p-6 font-mono text-sm flex-1 overflow-hidden relative">
                                    <div className="text-zinc-500 mb-2 break-all">root@speech-trainer:~$ ./analyze_speech.sh --target user_01</div>
                                    <div className="text-primary mb-4">[OK] Neural link established.</div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 text-zinc-400">
                                                <span>Analyzing Vocal Clarity...</span>
                                                <span className="text-green-500">94%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-800 border-b border-zinc-700"><div className="h-full bg-green-500 w-[94%]"></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 text-zinc-400">
                                                <span>Detecting Filler Words...</span>
                                                <span className="text-yellow-500">WARNING: 3 count</span>
                                            </div>
                                            <div className="h-2 bg-zinc-800 border-b border-zinc-700"><div className="h-full bg-yellow-500 w-[60%]"></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1 text-zinc-400">
                                                <span>Facial Sentiment Index...</span>
                                                <span className="text-primary">OPTIMAL</span>
                                            </div>
                                            <div className="h-2 bg-zinc-800 border-b border-zinc-700"><div className="h-full bg-primary w-[88%]"></div></div>
                                        </div>
                                    </div>

                                    <div className="mt-8 text-xs text-zinc-500">
                                        <span className="animate-pulse">_</span> Awaiting visual input...
                                    </div>

                                    {/* Decorator Grid inside terminal */}
                                    <div className="absolute right-4 bottom-4 grid grid-cols-4 gap-1 opacity-20">
                                        {[...Array(16)].map((_, i) => (
                                            <div key={i} className={`w-1 h-1 ${i % 3 === 0 ? 'bg-primary' : 'bg-zinc-500'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Core Systems / Features */}
            <section className="py-24 border-b-4 border-zinc-800 bg-zinc-950 relative">
                <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-16">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-pixel mb-4 flex items-center gap-3 break-words">
                                <Server className="w-8 h-8 text-primary shrink-0" />
                                CORE_SYSTEMS
                            </h2>
                            <p className="text-zinc-400 font-mono text-lg leading-relaxed">
                                Hardwired algorithms specifically designed to deconstruct and elevate your delivery.
                            </p>
                        </div>
                        <div className="font-mono text-xs text-primary border border-primary px-4 py-2 bg-primary/10 w-fit shrink-0">
                            UPTIME: 99.9%
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                id: "mod-1",
                                icon: <Mic className="w-6 h-6" />,
                                title: "AUDIO_PROCESSOR",
                                desc: "Extract precise telemetry on your vocal cords. Pitch variability, wpm pacing, and volume control plotted in high-def.",
                                stat: "16-BIT / 48kHz"
                            },
                            {
                                id: "mod-2",
                                icon: <Brain className="w-6 h-6" />,
                                title: "VISION_ENGINE",
                                desc: "Maps 468 facial landmarks frame-by-frame. Calculates eye contact duration, micro-expressions, and body language.",
                                stat: "60 FPS SCAN"
                            },
                            {
                                id: "mod-3",
                                icon: <BarChart3 className="w-6 h-6" />,
                                title: "LOGIC_PARSER",
                                desc: "Transcribes and evaluates content structure. Highlights filler words and structural weaknesses instantly.",
                                stat: "LLM BACKED"
                            }
                        ].map((mod, i) => (
                            <motion.div
                                key={mod.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="group relative bg-black border-4 border-zinc-800 hover:border-zinc-500 p-6 flex flex-col overflow-hidden transition-colors"
                            >
                                {/* Background glow on hover */}
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="bg-zinc-900 border-2 border-zinc-700 p-3 text-zinc-300 group-hover:text-primary group-hover:border-primary transition-colors shadow-[4px_4px_0px_#000]">
                                        {mod.icon}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-1 border border-zinc-800">
                                        {mod.stat}
                                    </div>
                                </div>

                                <h3 className="font-pixel text-lg text-white mb-3 relative z-10">{mod.title}</h3>
                                <p className="text-zinc-500 font-mono text-sm leading-relaxed flex-1 relative z-10">{mod.desc}</p>

                                <div className="mt-6 pt-4 border-t-2 border-zinc-800 border-dashed flex justify-between items-center relative z-10">
                                    <span className="font-pixel text-[10px] text-zinc-600">STATUS: ON_STANDBY</span>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full group-hover:bg-primary transition-colors"></div>
                                        <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Protocol */}
            <section className="py-24 border-b-4 border-zinc-800 bg-black">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 text-primary font-mono text-xs mb-4">
                            <ShieldCheck className="w-4 h-4" /> SECURE_CONNECTION
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white font-pixel break-words">EXECUTION_FLOW</h2>
                    </div>

                    <div className="relative border-l-4 border-zinc-800 ml-4 md:ml-12 pb-4">
                        {[
                            { step: "01", title: "RAW_DATA_INGESTION", desc: "Upload your video artifact (.mp4, .mkv, .webm). Max encrypted footprint: 100MB." },
                            { step: "02", title: "DEEP_EXTRACTION", desc: "Our multi-agent neural network dissects the file. Audio is ripped. Frames are analyzed." },
                            { step: "03", title: "DEBRIEFING", desc: "Receive your dossier. Interactive charts, precise timestamps, and AI-driven coaching suggestions." }
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
                                <div className="absolute -left-[14px] top-0 w-6 h-6 bg-black border-4 border-primary rounded-full z-10 flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                </div>
                                {/* Connector line from marker */}
                                <div className="absolute left-[8px] top-3 w-4 md:w-8 border-t-2 border-zinc-800 border-dashed -z-10"></div>

                                <div className="bg-zinc-950 border-2 border-zinc-800 p-6 md:flex gap-6 items-start hover:border-zinc-700 transition-colors shadow-[8px_8px_0px_#000]">
                                    <div className="font-pixel text-4xl text-zinc-800 md:w-20 hidden sm:block select-none pointer-events-none">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-pixel text-primary mb-2 text-lg break-words">{item.title}</h3>
                                        <p className="font-mono text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gamification */}
            <section className="py-24 border-b-4 border-zinc-800 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-pixel mb-6 leading-tight break-words">
                                EARN XP.<br />
                                DOMINATE.
                            </h2>
                            <p className="text-zinc-400 font-mono text-lg mb-8 leading-relaxed">
                                Self-improvement isn't just about data; it's about the <span className="text-white">grind</span>.
                                Prove your skills, unlock tiers, and cement your status on the global leaderboard.
                            </p>

                            <ul className="space-y-4 font-mono text-sm text-zinc-300">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary"></div>
                                    Performance-based XP multipliers
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-yellow-400"></div>
                                    Unlock exclusive system badges
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500"></div>
                                    Climb ranked leaderboards
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="bg-zinc-900 border-4 border-zinc-700 p-8 shadow-[12px_12px_0px_#000] relative"
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
            <section className="py-24 bg-black border-b-4 border-zinc-800 relative z-0">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="bg-zinc-950 border-4 border-primary p-8 md:p-16 relative shadow-[16px_16px_0px_rgba(0,0,0,1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white font-pixel uppercase break-all">
                            SYSTEM_AWAITING_INPUT
                        </h2>
                        <p className="text-zinc-400 font-mono mb-10 text-lg">
                            Communication is leverage. Optimize your output to bypass obstacles. Begin the program now.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/signup">
                                <Button className="w-full sm:w-auto font-pixel text-sm bg-primary text-black hover:bg-white border-2 border-primary hover:border-white h-auto py-4 px-8 shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all whitespace-normal">
                                    [ EXECUTE_CREATE_USER ]
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-black text-center">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="font-pixel text-[10px] text-zinc-600">
                            SPEECH_TRAINER_OS v2.4 // 2026_ESTABLISHED
                        </div>
                        <div className="flex gap-4 font-mono text-xs text-zinc-600 uppercase">
                            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                            <span>|</span>
                            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
