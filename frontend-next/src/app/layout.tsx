import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
    title: "AI Speech Trainer",
    description: "Your personal coach for public speaking",
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
                jetbrainsMono.variable
            )}>
                {/* Global Grid Background */}
                <div className="fixed inset-0 z-[-1] bg-[linear_gradient(to_right,#80808012_1px,transparent_1px),linear_gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* CRT Scanline Overlay */}
                <div className="fixed inset-0 z-50 pointer-events-none bg-[linear_gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear_gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>

                <Navbar />
                <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1 pt-14">{children}</div>
                </div>
                <Toaster />
            </body>
        </html>
    );
}
