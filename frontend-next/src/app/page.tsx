"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/home/Hero";
import { VideoDropzone } from "@/components/upload/VideoDropzone";
import { useToast } from "@/components/ui/use-toast"; // Check if this exists, actually default shadcn doesn't have toast unless added
import { Toaster } from "@/components/ui/toaster"; // Need to add toast component

export default function Home() {
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleUpload = async (file: File) => {
        setIsUploading(true);

        // Simulate upload delay for now
        setTimeout(() => {
            setIsUploading(false);
            // Store file/result in session/context (TODO)
            router.push("/analysis");
        }, 2000);

        // TODO: Implement actual backend call
        // const formData = new FormData();
        // formData.append("video", file);
        // await fetch("http://localhost:8000/analyze", ...)
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
