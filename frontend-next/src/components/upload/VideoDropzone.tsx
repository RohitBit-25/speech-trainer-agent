"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileVideo, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoDropzoneProps {
    onUpload: (file: File) => void;
    isUploading?: boolean;
}

export function VideoDropzone({ onUpload, isUploading = false }: VideoDropzoneProps) {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/mp4': ['.mp4'],
            'video/quicktime': ['.mov'],
            'video/webm': ['.webm']
        },
        maxFiles: 1,
        disabled: isUploading
    });

    const handleUploadClick = () => {
        if (file) {
            onUpload(file);
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full max-w-3xl mx-auto mt-8"
        >
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 ease-in-out cursor-pointer group overflow-hidden bg-card/30 backdrop-blur-sm",
                    isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50",
                    file ? "border-primary/50" : ""
                )}
            >
                <input {...getInputProps()} />

                {/* Scanning effect overlay */}
                {isUploading && (
                    <div className="absolute inset-0 pointer-events-none z-0">
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                        <div className="h-1 w-full bg-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan-line" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="drop-prompt"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="p-4 rounded-full bg-muted group-hover:bg-background transition-colors mb-4">
                                    <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold">
                                    {isDragActive ? "Drop video here" : "Upload your recording"}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                                    Drag and drop your video file here, or click to browse.
                                    <br />
                                    <span className="text-xs opacity-70">Supports MP4, MOV, WEBM (Max 500MB)</span>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="file-preview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center w-full"
                            >
                                <div className="relative p-6 rounded-xl bg-card border shadow-sm w-full max-w-md flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <FileVideo className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    {!isUploading && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={removeFile}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-8 flex gap-4">
                                    {!isUploading ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            >
                                                Change Video
                                            </Button>
                                            <Button
                                                className="min-w-[150px]"
                                                onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                                            >
                                                Analyze Video
                                                <Sparkles className="ml-2 h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 text-primary font-medium">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing Video...
                                            </div>
                                            <p className="text-xs text-muted-foreground">This may take a few moments</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
