"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialStep {
    title: string;
    description: string;
    image?: string;
    tips?: string[];
}

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'practice' | 'studio' | 'general';
}

const TUTORIAL_CONTENT = {
    practice: {
        title: "Real-time Practice Mode Tutorial",
        steps: [
            {
                title: "Welcome to Practice Mode! 🎮",
                description: "Practice Mode gives you instant AI feedback as you speak. Let's learn how to use it effectively.",
                tips: [
                    "Perfect for daily practice sessions",
                    "Get real-time feedback on your performance",
                    "Build combos and unlock achievements"
                ]
            },
            {
                title: "Step 1: Camera & Microphone Setup",
                description: "Click 'START PRACTICE' and allow camera and microphone access when prompted. Position your camera at eye level with good lighting.",
                tips: [
                    "Ensure your face is clearly visible",
                    "Use a neutral background",
                    "Test your microphone volume"
                ]
            },
            {
                title: "Step 2: Choose Your Settings",
                description: "Select your practice mode and difficulty level before starting.",
                tips: [
                    "Practice Mode: Free practice, no time limits",
                    "Challenge Mode: Goal-oriented practice",
                    "Timed Mode: Practice with time constraints",
                    "Start with Beginner difficulty"
                ]
            },
            {
                title: "Step 3: Understanding the Interface",
                description: "The interface shows real-time metrics as you speak.",
                tips: [
                    "Performance Meters: Facial, Voice, Engagement (0-100)",
                    "Combo Counter: Tracks consecutive good performance",
                    "Live Transcript: Your speech converted to text",
                    "Feedback Pills: Instant tips and warnings"
                ]
            },
            {
                title: "Step 4: Building Combos",
                description: "Maintain good performance to build combos and earn multipliers!",
                tips: [
                    "1-10x combo: Good Start (1x multiplier)",
                    "11-30x combo: On Fire 🔥 (1.5x multiplier)",
                    "31-60x combo: Unstoppable ⚡ (2x multiplier)",
                    "61+x combo: Legendary 👑 (3x multiplier)"
                ]
            },
            {
                title: "Step 5: Filler Words",
                description: "Watch for red highlights in the transcript - these are filler words to avoid.",
                tips: [
                    "Common fillers: um, uh, like, you know",
                    "Pause instead of using fillers",
                    "Practice reduces filler word usage over time"
                ]
            },
            {
                title: "Step 6: Achievements",
                description: "Unlock achievements by hitting performance milestones!",
                tips: [
                    "🏆 First Combo (10x) - 100 XP",
                    "🔥 Combo Master (30x) - 300 XP",
                    "👑 Legendary Combo (60x) - 500 XP",
                    "⏱️ Perfect Minute (60s avg > 80) - 250 XP",
                    "🎯 Filler-Free (60s no fillers) - 200 XP"
                ]
            },
            {
                title: "Step 7: Export Your Transcript",
                description: "After practice, export your transcript to review later.",
                tips: [
                    "Click 'EXPORT' in the transcript section",
                    "Download as .txt file",
                    "Review filler words and improve"
                ]
            },
            {
                title: "Pro Tips! 💡",
                description: "Best practices for effective practice sessions.",
                tips: [
                    "Practice 5-10 minutes daily",
                    "Focus on one skill at a time",
                    "Watch the Performance Monitor for FPS/latency",
                    "Maintain eye contact with the camera",
                    "Speak at a natural pace (120-160 WPM)",
                    "Use hand gestures naturally"
                ]
            }
        ]
    },
    studio: {
        title: "Video Analysis Tutorial",
        steps: [
            {
                title: "Welcome to Studio! 🎬",
                description: "Upload your speech videos for comprehensive AI analysis. Let's get started!",
                tips: [
                    "Get detailed feedback on your speeches",
                    "Earn 500 XP per analysis",
                    "Track improvement over time"
                ]
            },
            {
                title: "Step 1: Record Your Video",
                description: "Before uploading, make sure your video meets these requirements:",
                tips: [
                    "Format: MP4, MOV, MKV, or WebM",
                    "Max size: 50MB",
                    "Resolution: 720p or 1080p recommended",
                    "Duration: 2-5 minutes works best",
                    "Clear audio is essential"
                ]
            },
            {
                title: "Step 2: Upload Your Video",
                description: "Drag & drop your video or click to browse.",
                tips: [
                    "Ensure good lighting in your video",
                    "Face should be clearly visible",
                    "Minimize background noise",
                    "Landscape orientation preferred"
                ]
            },
            {
                title: "Step 3: Analysis Process",
                description: "Watch real-time progress as AI agents analyze your speech.",
                tips: [
                    "🎬 Video Processing",
                    "😊 Facial Expression Analysis",
                    "🎵 Voice Analysis",
                    "📝 Content Analysis",
                    "💬 Feedback Generation",
                    "Takes 1-3 minutes typically"
                ]
            },
            {
                title: "Step 4: Understanding Your Score",
                description: "Your speech is scored on 5 criteria (1-5 each, total 5-25):",
                tips: [
                    "Content & Organization",
                    "Delivery & Vocal Quality",
                    "Body Language & Eye Contact",
                    "Audience Engagement",
                    "Language & Clarity"
                ]
            },
            {
                title: "Step 5: Score Interpretation",
                description: "What your total score means:",
                tips: [
                    "5-9: Needs significant improvement",
                    "10-14: Developing skills",
                    "15-18: Competent speaker",
                    "19-22: Proficient speaker",
                    "23-25: Outstanding speaker"
                ]
            },
            {
                title: "Step 6: Review Detailed Analysis",
                description: "Explore comprehensive feedback on all aspects of your speech.",
                tips: [
                    "Facial Analysis: Emotions, engagement, eye contact",
                    "Voice Analysis: Pace, pitch, volume, fillers",
                    "Content Analysis: Structure, persuasion, clarity",
                    "Full transcript with timestamps"
                ]
            },
            {
                title: "Step 7: Track Your Progress",
                description: "View your analysis history and compare performances.",
                tips: [
                    "Go to 'Logs 📊' to see all analyses",
                    "Click any analysis to review details",
                    "Compare multiple analyses side-by-side",
                    "Track improvement over time"
                ]
            }
        ]
    },
    general: {
        title: "Getting Started Guide",
        steps: [
            {
                title: "Welcome to VaaniX! 🎤",
                description: "Your AI-powered platform for mastering public speaking. Let's explore the features!",
                tips: [
                    "Two modes: Real-time Practice & Video Analysis",
                    "Gamified learning with XP and achievements",
                    "Track your progress over time"
                ]
            },
            {
                title: "Navigation Overview",
                description: "Here's what each section does:",
                tips: [
                    "🎬 Studio: Upload videos for analysis",
                    "🎮 Practice: Real-time practice mode",
                    "📊 Logs: View your analysis history",
                    "🔍 Analysis: Detailed results page"
                ]
            },
            {
                title: "XP & Leveling System",
                description: "Earn XP and progress through 7 speaker tiers!",
                tips: [
                    "Video Analysis: 500 XP",
                    "Achievements: 100-500 XP",
                    "7 Tiers: Novice → Legendary Orator",
                    "Check your level badge in the navbar"
                ]
            },
            {
                title: "Achievements System",
                description: "Unlock badges by hitting milestones in Practice Mode.",
                tips: [
                    "🏆 First Combo (10x) - 100 XP",
                    "🔥 Combo Master (30x) - 300 XP",
                    "👑 Legendary Combo (60x) - 500 XP",
                    "⏱️ Perfect Minute - 250 XP",
                    "🎯 Filler-Free - 200 XP",
                    "👁️ Eye Contact Pro - 300 XP"
                ]
            },
            {
                title: "Best Practices",
                description: "Tips for getting the most out of VaaniX:",
                tips: [
                    "Practice daily for 5-10 minutes",
                    "Upload 1-2 videos per week",
                    "Review your transcript after each session",
                    "Focus on reducing filler words",
                    "Track your progress in Logs",
                    "Compare performances to see improvement"
                ]
            },
            {
                title: "Browser Compatibility",
                description: "For the best experience, use:",
                tips: [
                    "✅ Chrome 90+ (Recommended)",
                    "✅ Edge 90+ (Recommended)",
                    "⚠️ Safari 14+ (Limited speech recognition)",
                    "⚠️ Firefox 88+ (Limited WebRTC)"
                ]
            }
        ]
    }
};

export function TutorialModal({ isOpen, onClose, mode }: TutorialModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const content = TUTORIAL_CONTENT[mode];
    const totalSteps = content.steps.length;
    const step = content.steps[currentStep];

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900 border-4 border-primary max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="border-b-4 border-zinc-800 p-6 bg-zinc-950">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-primary" />
                                <h2 className="font-pixel text-xl text-primary">{content.title}</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
                                <span>Step {currentStep + 1} of {totalSteps}</span>
                                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 border-2 border-zinc-700">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="font-pixel text-2xl text-white mb-4">{step.title}</h3>
                            <p className="text-zinc-300 mb-6 leading-relaxed">{step.description}</p>

                            {step.tips && step.tips.length > 0 && (
                                <div className="space-y-3">
                                    {step.tips.map((tip, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 bg-zinc-800/50 p-3 border-l-4 border-primary"
                                        >
                                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-zinc-300">{tip}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <div className="border-t-4 border-zinc-800 p-6 bg-zinc-950">
                        <div className="flex items-center justify-between">
                            <Button
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                variant="outline"
                                className="font-pixel text-xs border-2"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                PREVIOUS
                            </Button>

                            <div className="flex gap-2">
                                {Array.from({ length: totalSteps }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentStep(index)}
                                        className={`h-2 w-2 transition-all ${index === currentStep
                                            ? 'bg-primary w-8'
                                            : index < currentStep
                                                ? 'bg-primary/50'
                                                : 'bg-zinc-700'
                                            }`}
                                    />
                                ))}
                            </div>

                            {currentStep < totalSteps - 1 ? (
                                <Button
                                    onClick={handleNext}
                                    className="font-pixel text-xs bg-primary text-black"
                                >
                                    NEXT
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleClose}
                                    className="font-pixel text-xs bg-green-500 text-black hover:bg-green-600"
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    FINISH
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
