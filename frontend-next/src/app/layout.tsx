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
                "min-h-screen bg-background font-sans antialiased",
                inter.variable,
                jetbrainsMono.variable
            )}>
                <Navbar />
                <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1 pt-14">{children}</div>
                </div>
                <Toaster />
            </body>
        </html>
    );
}
