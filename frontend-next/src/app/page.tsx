"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { VideoDropzone } from "@/components/upload/VideoDropzone";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { uploadVideo } from "@/lib/api";

export default function Home() {
    const [isUploading, setIsUploading] = useState(false); // Local loading state for UI
    const setAnalyzing = useAppStore((state) => state.setAnalyzing);
    const setResult = useAppStore((state) => state.setResult);
    const setVideoFile = useAppStore((state) => state.setVideoFile);
    const router = useRouter();

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setAnalyzing(true);
        setVideoFile(file);

        try {
            toast.info("Starting analysis...", { description: "This may take a moment." });
            const result = await uploadVideo(file);
            setResult(result);
            toast.success("Analysis complete!");
            router.push("/analysis");
        } catch (error) {
            toast.error("Analysis failed", { description: "Please try again." });
            console.error(error);
        } finally {
            setIsUploading(false);
            setAnalyzing(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-6 md:p-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <Hero />

            <div className="w-full max-w-4xl z-10">
                <VideoDropzone onUpload={handleUpload} isUploading={isUploading} />
            </div>

            {/* Features Grid could go here */}

        </main>
    );
}
