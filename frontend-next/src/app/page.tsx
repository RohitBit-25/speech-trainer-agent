"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Mic, BarChart3, Trophy, ArrowRight, Zap, Target, Brain } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b-4 border-zinc-800">
                {/* Background */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="container mx-auto px-4 py-20 md:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border-2 border-primary/50">
                            <span className="font-pixel text-xs text-primary uppercase tracking-wider">
                                AI-Powered Speech Analysis
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                            LEVEL UP YOUR
                            <br />
                            <span className="text-primary">SPEECH SKILLS</span>
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-400 mb-8 font-mono max-w-2xl mx-auto">
                            Your personal AI companion for mastering communication. Upload a video, get instant XP, and unlock confidence.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup">
                                <Button className="font-pixel text-sm bg-primary text-black hover:bg-primary/90 h-14 px-8 border-4 border-primary shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    START_MISSION
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" className="font-pixel text-sm h-14 px-8 border-4 border-zinc-700 hover:bg-zinc-800">
                                    <ArrowRight className="mr-2 h-5 w-5" />
                                    AGENT_LOGIN
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 border-b-4 border-zinc-800">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-pixel">
                            CORE_FEATURES
                        </h2>
                        <p className="text-zinc-400 font-mono">Advanced AI analysis for complete speech mastery</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                id: "voice-analysis",
                                icon: <Mic className="h-8 w-8" />,
                                title: "VOICE_ANALYSIS",
                                description: "AI-powered analysis of pitch, tone, pace, and clarity. Get real-time feedback on your vocal delivery."
                            },
                            {
                                id: "facial-tracking",
                                icon: <Brain className="h-8 w-8" />,
                                title: "FACIAL_TRACKING",
                                description: "Advanced emotion detection and engagement scoring. Master your non-verbal communication."
                            },
                            {
                                id: "content-scoring",
                                icon: <BarChart3 className="h-8 w-8" />,
                                title: "CONTENT_SCORING",
                                description: "Analyze structure, persuasion, and clarity. Eliminate filler words and improve your message."
                            }
                        ].map((feature) => (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: parseInt(feature.id.split('-')[0] === 'voice' ? '0' : feature.id.split('-')[0] === 'facial' ? '1' : '2') * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-zinc-900 border-4 border-zinc-700 p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.5)] transition-all"
                            >
                                <div className="h-12 w-12 bg-primary/20 border-2 border-primary flex items-center justify-center text-primary mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-pixel text-lg text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-zinc-400 font-mono">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 border-b-4 border-zinc-800 bg-zinc-950">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-pixel">
                            MISSION_PROTOCOL
                        </h2>
                        <p className="text-zinc-400 font-mono">Three simple steps to speech mastery</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                id: "step-01",
                                step: "01",
                                title: "UPLOAD_VIDEO",
                                description: "Record or upload your speech video. Our AI accepts any format."
                            },
                            {
                                id: "step-02",
                                step: "02",
                                title: "AI_ANALYSIS",
                                description: "Advanced multi-agent system analyzes voice, face, and content in real-time."
                            },
                            {
                                id: "step-03",
                                step: "03",
                                title: "LEVEL_UP",
                                description: "Get detailed feedback, earn XP, unlock achievements, and improve."
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="text-6xl font-pixel text-primary/20 mb-4">{step.step}</div>
                                <h3 className="font-pixel text-xl text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-zinc-400 font-mono">{step.description}</p>

                                {i < 2 && (
                                    <div className="hidden md:block absolute top-8 -right-4 text-primary">
                                        <ArrowRight className="h-6 w-6" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gamification Highlight */}
            <section className="py-20 border-b-4 border-zinc-800">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary px-4 py-2 mb-6">
                                <Trophy className="h-4 w-4 text-primary" />
                                <span className="font-pixel text-xs text-primary">GAMIFICATION_SYSTEM</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-pixel">
                                EARN_XP_&_LEVEL_UP
                            </h2>
                            <p className="text-zinc-400 font-mono mb-6">
                                Track your progress with our advanced gamification system. Earn XP for every analysis, unlock achievements, and climb the ranks from NOVICE_SPEAKER to LEGENDARY_ORATOR.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { id: "xp-gain", icon: <Zap />, text: "500 XP per analysis" },
                                    { id: "achievements", icon: <Trophy />, text: "Unlock achievements" },
                                    { id: "tiers", icon: <Target />, text: "7 progression tiers" }
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 text-zinc-300 font-mono text-sm">
                                        <div className="h-8 w-8 bg-primary/20 border-2 border-primary flex items-center justify-center text-primary">
                                            {item.icon}
                                        </div>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-zinc-900 border-4 border-zinc-700 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-pixel text-sm text-zinc-400">LEVEL</span>
                                    <span className="font-pixel text-2xl text-primary">15</span>
                                </div>
                                <div className="h-4 bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
                                    <div className="h-full w-[75%] bg-gradient-to-r from-primary to-yellow-400"></div>
                                </div>
                                <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                                    <span>11,250 XP</span>
                                    <span>15,000 XP</span>
                                </div>
                                <div className="pt-4 border-t-2 border-zinc-800">
                                    <p className="font-pixel text-sm text-white mb-2">MASTER_SPEAKER</p>
                                    <p className="text-xs font-mono text-zinc-400">Next: LEGENDARY_ORATOR at Level 20</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-zinc-950">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white font-pixel">
                            READY_TO_BEGIN?
                        </h2>
                        <p className="text-lg text-zinc-400 font-mono mb-8">
                            Join thousands of speakers improving their skills with AI-powered feedback.
                        </p>
                        <Link href="/signup">
                            <Button className="font-pixel text-sm bg-primary text-black hover:bg-primary/90 h-14 px-12 border-4 border-primary shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                                <Sparkles className="mr-2 h-5 w-5" />
                                CREATE_FREE_ACCOUNT
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-4 border-zinc-800 py-8 bg-black">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="font-pixel text-sm text-zinc-500">
                            © 2026 SPEECH_TRAINER_OS. All rights reserved.
                        </div>
                        <div className="flex gap-6 font-mono text-xs text-zinc-500">
                            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
