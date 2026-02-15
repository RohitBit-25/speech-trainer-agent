"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileVideo, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { audioController } from "@/lib/audio";

interface VideoDropzoneProps {
    onUpload: (file: File) => void;
    isUploading?: boolean;
}

export function VideoDropzone({ onUpload, isUploading = false }: VideoDropzoneProps) {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            audioController.playSuccess();
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
            audioController.playClick();
            onUpload(file);
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        audioController.playError();
        setFile(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full max-w-3xl mx-auto mt-8"
        >
            <div className="bg-zinc-900 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] p-2">
                {/* Scanner Header */}
                <div className="flex justify-between items-center bg-zinc-800 px-4 py-2 border-b-4 border-zinc-700 mb-2">
                    <span className="font-pixel text-xs text-zinc-400">DATA_INPUT_TERMINAL</span>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-sm animate-pulse"></div>
                    </div>
                </div>

                <div
                    {...getRootProps()}
                    className={cn(
                        "relative border-4 border-dashed min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer group overflow-hidden bg-black/40",
                        isDragActive ? "border-primary bg-primary/10" : "border-zinc-600 hover:border-primary hover:bg-zinc-800/50",
                        file ? "border-primary bg-zinc-900" : ""
                    )}
                >
                    <input {...getInputProps()} />

                    {/* Scanning effect overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                            <div className="h-2 w-full bg-primary/50 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-scan-line" />
                        </div>
                    )}

                    <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 p-8 w-full">
                        <AnimatePresence mode="wait">
                            {!file ? (
                                <motion.div
                                    key="drop-prompt"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="p-6 mb-4 border-2 border-dashed border-zinc-500 group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                                        <Upload className="h-12 w-12 text-zinc-500 group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-pixel text-white mb-2">
                                        {isDragActive ? "INSERT DISK..." : "UPLOAD_SOURCE_FILE"}
                                    </h3>
                                    <p className="font-mono text-zinc-400 text-sm max-w-sm">
                                        Drag & drop video data module [.MP4, .MOV]
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
                                    <div className="relative p-6 bg-zinc-800 border-2 border-zinc-600 w-full max-w-md flex items-center gap-4 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                                        <div className="h-16 w-16 bg-black border border-zinc-600 flex items-center justify-center shrink-0">
                                            <FileVideo className="h-8 w-8 text-primary animate-pulse" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left font-mono">
                                            <p className="text-sm font-bold text-white truncate text-ellipsis">{file.name}</p>
                                            <p className="text-xs text-primary">
                                                SIZE: {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                            <p className="text-[10px] text-zinc-500 mt-1">STATUS: READY_TO_SCAN</p>
                                        </div>
                                        {!isUploading && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-transparent"
                                                onClick={removeFile}
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mt-8 flex gap-4">
                                        {!isUploading && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="font-pixel text-xs border-2 hover:bg-zinc-800 h-12"
                                                    onClick={(e) => { e.stopPropagation(); removeFile(e); }}
                                                    onMouseEnter={() => audioController.playHover()}
                                                >
                                                    EJECT
                                                </Button>
                                                <Button
                                                    className="min-w-[180px] font-pixel text-xs border-2 border-primary bg-primary text-black hover:bg-primary/90 h-12 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                                                    onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                                                    onMouseEnter={() => audioController.playHover()}
                                                >
                                                    <span className="mr-2">INITIALIZE_SCAN</span>
                                                    <Sparkles className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {isUploading && (
                                        <div className="w-full max-w-2xl mt-4">
                                            <div className="flex items-center gap-2 text-primary font-pixel text-xs animate-pulse justify-center mb-4">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                ESTABLISHING_UPLINK...
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
