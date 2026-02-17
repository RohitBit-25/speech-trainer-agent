"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { setAuthData } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Login failed");
            }

            const data = await response.json();

            // Store user info (no token handling needed, backend sets cookie)
            setAuthData(data.user);

            toast.success("Access Granted", { description: `Welcome back, ${data.user.name}.` });

            // Small delay to show toast
            setTimeout(() => {
                router.push("/studio");
            }, 500);
        } catch (error: any) {
            toast.error("Authentication Failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="bg-zinc-900 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                    <CardHeader className="border-b-4 border-zinc-700 bg-zinc-950">
                        <div className="flex items-center gap-2 mb-2">
                            <LogIn className="h-5 w-5 text-primary" />
                            <CardTitle className="font-pixel text-lg text-white">SYSTEM_ACCESS</CardTitle>
                        </div>
                        <CardDescription className="font-mono text-xs text-zinc-400">
                            Enter credentials to access the training platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-mono text-xs text-zinc-400 uppercase">
                                    Secure_Channel
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-zinc-950 border-2 border-zinc-700 focus:border-primary font-mono text-white"
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-mono text-xs text-zinc-400 uppercase">
                                    Access_Code
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-zinc-950 border-2 border-zinc-700 focus:border-primary font-mono text-white"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full font-pixel text-xs bg-primary text-black hover:bg-primary/90 h-12 border-2 border-primary shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        AUTHENTICATING...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        INITIATE_LOGIN
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="text-center pt-4 border-t-2 border-zinc-800">
                            <p className="text-xs font-mono text-zinc-500">
                                NEW_RECRUIT?{" "}
                                <Link href="/signup" className="text-primary hover:underline">
                                    CREATE_ACCOUNT
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
