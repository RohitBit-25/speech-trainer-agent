"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mic2, Activity, Settings, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { AchievementPopup } from "@/components/gamification/AchievementPopup";

export function Navbar() {
    const pathname = usePathname();

    const routes = [
        {
            href: "/",
            label: "Studio",
            icon: Mic2,
            active: pathname === "/",
        },
        {
            href: "/analysis",
            label: "Analysis",
            icon: Activity,
            active: pathname === "/analysis",
        },
        {
            href: "/settings",
            label: "Settings",
            icon: Settings,
            active: pathname === "/settings",
        },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                            <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                            <Mic2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="hidden font-bold sm:inline-block">
                            SpeechTrainer <span className="text-primary font-mono text-xs">v2.0</span>
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "transition-colors hover:text-primary flex items-center gap-2 font-pixel text-xs tracking-wide",
                                    route.active ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other controls could go here */}
                    </div>
                    <nav className="flex items-center gap-4">
                        <LevelBadge />
                        <AchievementPopup />
                        <Link href="https://github.com/RohitBit-25/speech-trainer-agent" target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 px-0 hover:bg-primary/20 hover:text-primary transition-colors">
                                <Github className="h-4 w-4" />
                                <span className="sr-only">GitHub</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-zinc-900 border border-zinc-700 text-[10px] font-pixel text-primary uppercase shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-sm h-2 w-2 bg-green-500"></span>
                            </span>
                            SYSTEM_ONLINE
                        </div>
                    </nav>
                </div>
            </div>
        </nav>
    );
}
