"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-2xl"
            >
                <div className="mb-8">
                    <div className="inline-block bg-zinc-900 border-4 border-zinc-700 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                        <h1 className="text-8xl font-pixel text-primary mb-4">404</h1>
                        <div className="h-2 w-full bg-zinc-800 border-2 border-zinc-700 mb-4">
                            <div className="h-full w-0 bg-primary animate-pulse"></div>
                        </div>
                        <p className="font-pixel text-lg text-white">SIGNAL_LOST</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-white font-pixel">
                    PAGE_NOT_FOUND
                </h2>
                <p className="text-zinc-400 font-mono mb-8">
                    The requested resource could not be located in the system database.
                    <br />
                    Error Code: 0x404_SIGNAL_LOST
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="font-pixel text-xs bg-primary text-black hover:bg-primary/90 h-12 px-6 border-2 border-primary shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all">
                            <Home className="mr-2 h-4 w-4" />
                            RETURN_HOME
                        </Button>
                    </Link>
                    <Link href="/studio">
                        <Button variant="outline" className="font-pixel text-xs h-12 px-6 border-2 border-zinc-700 hover:bg-zinc-800">
                            <Search className="mr-2 h-4 w-4" />
                            GO_TO_STUDIO
                        </Button>
                    </Link>
                </div>

                {/* Scanlines effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] opacity-10"></div>
            </motion.div>
        </div>
    );
}
