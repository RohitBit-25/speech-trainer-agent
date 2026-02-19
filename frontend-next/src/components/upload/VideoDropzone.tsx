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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full font-mono"
        >
            <div
                {...getRootProps()}
                className={cn(
                    "relative group h-[320px] transition-all duration-300 ease-out",
                    "bg-zinc-950/50 border border-zinc-800",
                    "hover:border-primary/50 hover:bg-zinc-900/80",
                    isDragActive && "border-primary bg-primary/10",
                    file && "border-zinc-700 bg-zinc-900"
                )}
            >
                <input {...getInputProps()} />

                {/* Technical Corner Markers */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50 group-hover:border-primary transition-colors"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50 group-hover:border-primary transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50 group-hover:border-primary transition-colors"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50 group-hover:border-primary transition-colors"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center space-y-4"
                            >
                                <div className="w-16 h-16 border border-dashed border-zinc-700 rounded-full flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all text-zinc-600">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm tracking-widest uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                        {isDragActive ? "DROP_FILE_HERE" : "INITIATE_UPLOAD_SEQUENCE"}
                                    </p>
                                    <p className="text-[10px] text-zinc-700">
                                        SUPPORTED_FORMATS: [.MP4] [.MOV] [.WEBM]
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="file"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/90 p-8"
                            >
                                {!isUploading ? (
                                    <>
                                        <div className="flex items-center gap-4 mb-8 text-zinc-300">
                                            <FileVideo className="w-8 h-8 text-primary" />
                                            <div className="text-left">
                                                <div className="text-sm font-bold truncate max-w-[200px]">{file.name}</div>
                                                <div className="text-[10px] text-zinc-500 uppercase">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB • READY
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={removeFile}
                                                className="border-zinc-700 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50"
                                            >
                                                ABORT
                                            </Button>
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                                                className="bg-primary text-black hover:bg-primary/90 font-bold tracking-wider"
                                            >
                                                EXECUTE_ANALYSIS <Sparkles className="w-3 h-3 ml-2" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4 text-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                                        <div className="text-xs tracking-widest text-primary animate-pulse">
                                            ESTABLISHING_NEURAL_LINK...
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
