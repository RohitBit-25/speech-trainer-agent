"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TooltipProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
}

export function HelpTooltip({ content, position = 'top', children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="cursor-help"
            >
                {children}
            </div>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`absolute ${positionClasses[position]} z-50 w-64`}
                    >
                        <div className="bg-zinc-900 border-2 border-primary p-3 shadow-lg">
                            <p className="text-xs text-zinc-300 leading-relaxed">{content}</p>
                            <div className={`absolute w-2 h-2 bg-primary transform rotate-45 ${position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
                                    position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                        position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' :
                                            'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
                                }`} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface QuickHelpProps {
    tips: string[];
    title?: string;
}

export function QuickHelp({ tips, title = "Quick Tips" }: QuickHelpProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                size="sm"
                className="fixed bottom-4 left-4 z-40 border-2 border-primary bg-zinc-900 hover:bg-zinc-800"
            >
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="font-pixel text-xs">HELP</span>
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border-4 border-primary max-w-md w-full"
                        >
                            <div className="border-b-4 border-zinc-800 p-4 flex items-center justify-between bg-zinc-950">
                                <h3 className="font-pixel text-primary">{title}</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-zinc-500 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                                {tips.map((tip, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-2 bg-zinc-800/50 p-3 border-l-2 border-primary"
                                    >
                                        <span className="text-primary font-bold text-sm">{index + 1}.</span>
                                        <span className="text-sm text-zinc-300">{tip}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
