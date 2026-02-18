"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { Menu, X, LogOut, User, Zap } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getUser, logout } from "@/lib/auth";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    // Sync user state from localStorage — fast, synchronous, no network needed
    const syncUser = useCallback(() => {
        const userData = getUser();
        setUser(userData);
    }, []);

    useEffect(() => {
        // Mark as mounted to avoid SSR hydration mismatch
        setMounted(true);

        // Read user immediately from localStorage (synchronous, instant)
        syncUser();

        // Listen for auth changes dispatched by login/logout/signup
        window.addEventListener("auth-change", syncUser);
        return () => {
            window.removeEventListener("auth-change", syncUser);
        };
    }, [syncUser]);

    // Also re-sync whenever the pathname changes (e.g. after redirect to /studio)
    useEffect(() => {
        if (mounted) {
            syncUser();
        }
    }, [pathname, mounted, syncUser]);

    const handleLogout = async () => {
        await logout();
        toast.success("Logged Out", { description: "Mission terminated successfully." });
        // logout() already redirects to /
    };

    const navLinks = user
        ? [
            { href: "/studio", label: "Studio", icon: "🎬" },
            { href: "/practice", label: "Practice", icon: "🎮" },
            { href: "/challenges", label: "Challenges", icon: "🏆" },
            { href: "/leaderboard", label: "Leaderboard", icon: "👑" },
            { href: "/history", label: "Logs", icon: "📊" },
            { href: "/settings", label: "Settings", icon: "⚙️" },
        ]
        : [];

    // Don't render auth-dependent UI until mounted (prevents SSR flicker)
    if (!mounted) {
        return (
            <nav className="sticky top-0 z-50 bg-zinc-950 border-b-4 border-primary shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary flex items-center justify-center font-pixel text-black text-xs">
                                ST
                            </div>
                            <div className="hidden sm:block">
                                <span className="font-pixel text-sm text-white">SpeechTrainer</span>
                                <span className="font-mono text-xs text-primary ml-2">v2.0</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 bg-zinc-950 border-b-4 border-primary shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={user ? "/studio" : "/"} className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary flex items-center justify-center font-pixel text-black text-xs">
                            ST
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-pixel text-sm text-white">SpeechTrainer</span>
                            <span className="font-mono text-xs text-primary ml-2">v2.0</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation — only shown when logged in */}
                    {user && (
                        <div className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`font-mono text-sm transition-colors ${pathname === link.href || pathname.startsWith(link.href + "/")
                                            ? "text-primary"
                                            : "text-zinc-400 hover:text-white"
                                        }`}
                                >
                                    <span className="mr-1">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden md:block">
                                    <LevelBadge />
                                </div>

                                {/* User Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="border-2 border-zinc-700 hover:border-primary transition-colors"
                                        >
                                            <User className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-2 border-zinc-700">
                                        <DropdownMenuLabel className="font-mono text-xs text-zinc-400">
                                            {user.name}
                                        </DropdownMenuLabel>
                                        <DropdownMenuLabel className="font-mono text-xs text-zinc-500 -mt-2">
                                            {user.email}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="font-mono text-xs cursor-pointer text-red-400 hover:text-red-300"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="hidden md:flex gap-2">
                                <Link href="/login">
                                    <Button variant="outline" className="font-pixel text-xs border-2">
                                        LOGIN
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="font-pixel text-xs bg-primary text-black hover:bg-primary/90">
                                        SIGN UP
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="md:hidden border-2 border-zinc-700"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t-2 border-zinc-800 py-4 space-y-2">
                        {user && (
                            <div className="mb-4 px-4">
                                <LevelBadge />
                            </div>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 font-mono text-sm transition-colors ${pathname === link.href
                                        ? "text-primary bg-zinc-900"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                    }`}
                            >
                                <span className="mr-2">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                        {!user && (
                            <div className="flex flex-col gap-2 px-4 pt-4 border-t-2 border-zinc-800">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full font-pixel text-xs border-2">
                                        LOGIN
                                    </Button>
                                </Link>
                                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full font-pixel text-xs bg-primary text-black">
                                        SIGN UP
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {user && (
                            <div className="px-4 pt-4 border-t-2 border-zinc-800">
                                <Button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    variant="outline"
                                    className="w-full font-mono text-xs border-2 text-red-400 hover:text-red-300"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
