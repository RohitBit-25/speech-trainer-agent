import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const pressStart2P = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });
const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-retro" });

export const metadata: Metadata = {
    title: "Speech Trainer OS - AI-Powered Speech Analysis",
    description: "Level up your speech skills with AI-powered analysis. Get instant feedback on voice, facial expressions, and content. Earn XP, unlock achievements, and master communication.",
    keywords: ["speech training", "AI speech analysis", "public speaking", "communication skills", "voice analysis", "presentation skills"],
    authors: [{ name: "Speech Trainer Team" }],
    openGraph: {
        title: "Speech Trainer OS - AI-Powered Speech Analysis",
        description: "Your personal AI companion for mastering communication. Upload a video, get instant XP, and unlock confidence.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Speech Trainer OS",
        description: "AI-powered speech analysis and training platform",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased relative overflow-x-hidden selection:bg-primary selection:text-primary-foreground",
                inter.variable,
                jetbrainsMono.variable,
                pressStart2P.variable,
                vt323.variable
            )}>
                {/* Indian-Style Pattern Background */}
                <div className="fixed inset-0 z-[-2] bg-[#F5F5F0] dark:bg-[#1a1a1a]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,153,51,0.1),transparent_70%)]"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FF9933]/20 to-transparent"></div>
                </div>

                {/* Desktop OS Container */}
                <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
                    <div className="w-full max-w-7xl min-h-[85vh] bg-card border-4 border-primary shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden flex flex-col relative">

                        {/* OS Window Title Bar */}
                        <div className="h-10 bg-primary flex items-center justify-between px-4 select-none">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full border border-black"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full border border-black"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                            </div>
                            <div className="font-pixel text-xs text-primary-foreground tracking-widest">SPEECH_TRAINER_OS_v1.0</div>
                            <div className="flex gap-1">
                                <div className="w-4 h-1 bg-primary-foreground/50"></div>
                                <div className="w-4 h-1 bg-primary-foreground/50"></div>
                                <div className="w-4 h-1 bg-primary-foreground/50"></div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col relative bg-zinc-900/90 backdrop-blur-md">
                            <Navbar />  {/* Navbar inside the window now */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>

                <Toaster />
            </body>
        </html>
    );
}
