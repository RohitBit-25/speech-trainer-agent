"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Hero() {
    return (
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
            <div className="flex max-w-[980px] flex-col items-start gap-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI-Powered Speech Analysis
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]"
                >
                    Master Public Speaking <br className="hidden sm:inline" />
                    with <span className="text-primary">Artificial Intelligence</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="max-w-[750px] text-lg text-muted-foreground sm:text-xl font-mono"
                >
                    Upload your video and get instant, detailed feedback on your delivery, content, and facial expressions.
                </motion.p>
            </div>
        </section>
    );
}
