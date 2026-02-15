"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, UserPlus, Sparkles } from "lucide-react";
import Link from "next/link";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password strength
        if (formData.password.length < 6) {
            toast.error("Weak Password", { description: "Password must be at least 6 characters" });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Password Mismatch", { description: "Passwords do not match" });
            return;
        }

        if (!acceptedTerms) {
            toast.error("Terms Required", { description: "Please accept the mission terms" });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Signup failed");
            }

            const data = await response.json();

            // Store token and user data
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast.success("Account Created", { description: "Welcome to the mission, agent." });
            router.push("/studio");
        } catch (error: any) {
            toast.error("Registration Failed", { description: error.message });
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
                            <UserPlus className="h-5 w-5 text-primary" />
                            <CardTitle className="font-pixel text-lg text-white">NEW_RECRUIT</CardTitle>
                        </div>
                        <CardDescription className="font-mono text-xs text-zinc-400">
                            Initialize your agent profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-mono text-xs text-zinc-400 uppercase">
                                    Agent_Codename
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-zinc-950 border-2 border-zinc-700 focus:border-primary font-mono text-white"
                                    disabled={isLoading}
                                    autoComplete="name"
                                />
                            </div>

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
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-zinc-950 border-2 border-zinc-700 focus:border-primary font-mono text-white"
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                                <PasswordStrength password={formData.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="font-mono text-xs text-zinc-400 uppercase">
                                    Verify_Code
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="bg-zinc-950 border-2 border-zinc-700 focus:border-primary font-mono text-white"
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    disabled={isLoading}
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-xs font-mono text-zinc-400 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I accept the mission terms and conditions
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full font-pixel text-xs bg-primary text-black hover:bg-primary/90 h-12 border-2 border-primary shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        CREATING_PROFILE...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        JOIN_MISSION
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="text-center pt-4 border-t-2 border-zinc-800">
                            <p className="text-xs font-mono text-zinc-500">
                                ALREADY_ENLISTED?{" "}
                                <Link href="/login" className="text-primary hover:underline">
                                    ACCESS_SYSTEM
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
