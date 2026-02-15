"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

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
                    <div className="inline-block bg-zinc-900 border-4 border-red-700 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
                        <p className="font-pixel text-lg text-white">SYSTEM_ERROR</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-white font-pixel">
                    CRITICAL_FAILURE
                </h2>
                <p className="text-zinc-400 font-mono mb-2">
                    An unexpected error occurred in the system.
                </p>
                <p className="text-xs text-zinc-600 font-mono mb-8">
                    {error.message || "Unknown error"}
                </p>

                <Button
                    onClick={reset}
                    className="font-pixel text-xs bg-primary text-black hover:bg-primary/90 h-12 px-6 border-2 border-primary shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    RETRY_OPERATION
                </Button>

                {/* Scanlines effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] opacity-10"></div>
            </motion.div>
        </div>
    );
}
