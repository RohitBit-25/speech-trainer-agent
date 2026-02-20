"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { Transcript } from "@/components/analysis/Transcript";
import { Smile, Mic2, FileText, ArrowRight, Download, Trophy, TrendingUp, AlertTriangle, Lightbulb, Star } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generatePDF } from "@/lib/pdf";
import { motion } from "framer-motion";

function ScoreBadge({ score }: { score: number }) {
    const pct = Math.min(100, Math.max(0, score));
    const color =
        pct >= 80 ? "text-green-400 border-green-500/50 bg-green-500/10" :
            pct >= 60 ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10" :
                "text-red-400 border-red-500/50 bg-red-500/10";
    return (
        <span className={`inline-block px-3 py-1 rounded border font-pixel text-lg ${color}`}>
            {pct.toFixed(0)}/100
        </span>
    );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-2 py-2 border-b border-zinc-800 last:border-0">
            <span className="font-mono text-xs text-zinc-500 shrink-0">{label}</span>
            <span className="font-mono text-xs text-zinc-200 text-right">{value ?? "N/A"}</span>
        </div>
    );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-zinc-900/70 border ${color} rounded-xl p-5 space-y-3`}
        >
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4`} />
                <h3 className="font-pixel text-xs tracking-widest">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

export default function AnalysisPage() {
    const router = useRouter();
    const result = useAppStore((state) => state.result);
    const videoFile = useAppStore((state) => state.videoFile);
    const updateTranscription = useAppStore((state) => state.updateTranscription);

    useEffect(() => {
        if (!result) {
            router.push("/studio");
        }
    }, [result, router]);

    if (!result) return null;

    const { facial, voice, content, feedback, strengths, weaknesses, suggestions } = result;
    const totalScore = feedback?.total_score ?? 0;

    return (
        <div className="container py-8 space-y-8 max-w-screen-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-zinc-700 pb-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-pixel text-white mb-2 flex items-center gap-3">
                        <span className="text-primary">MISSION_REPORT</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-sm border border-primary/50">FINALIZED</span>
                    </h1>
                    <p className="font-mono text-zinc-400 text-sm">
                        Total Score: <span className="text-white font-bold">{totalScore.toFixed(1)}/100</span>
                        {" — "}{feedback?.interpretation || "See details below."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => generatePDF('mission-report')}
                        className="font-pixel text-xs bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-500 hover:border-blue-500 text-white h-12"
                    >
                        EXPORT_REPORT <Download className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => router.push("/feedback")}
                        className="font-pixel text-xs bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-500 hover:border-primary text-white h-12"
                    >
                        FULL_DIAGNOSTICS <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div id="mission-report" className="space-y-8 p-4 bg-background">
                {/* Video + Transcript */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    <div className="lg:col-span-2 h-full">
                        <VideoPlayer src={videoFile ? URL.createObjectURL(videoFile) : undefined} />
                    </div>
                    <div className="lg:col-span-1 h-full">
                        <Transcript
                            text={voice?.transcription || "No transcription available."}
                            onSave={updateTranscription}
                        />
                    </div>
                </div>

                {/* Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Facial */}
                    <Section title="FACIAL_RECOGNITION" icon={Smile} color="border-blue-500/40">
                        <p className="text-zinc-300 font-mono text-sm">{facial?.summary || "Facial analysis unavailable."}</p>
                        {facial?.emotions && Object.keys(facial.emotions).length > 0 && (
                            <div className="mt-2 space-y-1">
                                <p className="text-zinc-500 font-mono text-xs uppercase mb-1">Emotion breakdown</p>
                                {Object.entries(facial.emotions)
                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                    .slice(0, 5)
                                    .map(([emo, count]) => (
                                        <DataRow key={emo} label={emo} value={`${count}`} />
                                    ))}
                            </div>
                        )}
                        <DataRow label="Eye contact" value={facial?.eye_contact != null ? `${typeof facial.eye_contact === 'number' ? (facial.eye_contact * 100).toFixed(0) + '%' : facial.eye_contact}` : "N/A"} />
                    </Section>

                    {/* Voice */}
                    <Section title="AUDIO_WAVEFORM" icon={Mic2} color="border-purple-500/40">
                        <DataRow label="Pitch variation" value={voice?.pitch != null ? `${voice.pitch.toFixed ? voice.pitch.toFixed(2) : voice.pitch}` : "N/A"} />
                        <DataRow label="Speech rate (wpm)" value={voice?.pace != null ? `${voice.pace.toFixed ? voice.pace.toFixed(0) : voice.pace}` : "N/A"} />
                        <DataRow label="Volume consistency" value={voice?.volume != null ? `${voice.volume}` : "N/A"} />
                        {voice?.summary && <p className="text-zinc-400 font-mono text-xs mt-2">{voice.summary}</p>}
                    </Section>

                    {/* Content */}
                    <Section title="CONTENT_SYNTAX" icon={FileText} color="border-green-500/40">
                        <DataRow label="Structure" value={content?.structure ?? "N/A"} />
                        <DataRow label="Clarity index" value={content?.clarity != null ? `${content.clarity}/10` : "N/A"} />
                        <DataRow label="Persuasion score" value={content?.persuasion != null ? `${content.persuasion}/10` : "N/A"} />
                    </Section>
                </div>

                {/* Score + feedback summary */}
                {feedback && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="PERFORMANCE_SCORE" icon={Trophy} color="border-yellow-500/40">
                            <div className="flex items-center gap-4 mb-3">
                                <ScoreBadge score={totalScore} />
                                <span className="font-mono text-zinc-400 text-sm">{feedback.feedback_summary}</span>
                            </div>
                            {feedback.scores && Object.entries(feedback.scores).map(([key, val]) => (
                                <DataRow key={key} label={key.replace(/_/g, ' ')} value={`${val}`} />
                            ))}
                        </Section>

                        {/* Strengths / Weaknesses / Suggestions */}
                        <div className="space-y-4">
                            {strengths && strengths.length > 0 && (
                                <Section title="STRENGTHS" icon={Star} color="border-emerald-500/40">
                                    <ul className="space-y-1">
                                        {strengths.map((s, i) => <li key={i} className="font-mono text-xs text-emerald-300">• {s}</li>)}
                                    </ul>
                                </Section>
                            )}

                            {weaknesses && weaknesses.length > 0 && (
                                <Section title="WEAKNESSES" icon={AlertTriangle} color="border-red-500/40">
                                    <ul className="space-y-1">
                                        {weaknesses.map((w, i) => <li key={i} className="font-mono text-xs text-red-300">• {w}</li>)}
                                    </ul>
                                </Section>
                            )}

                            {suggestions && suggestions.length > 0 && (
                                <Section title="SUGGESTIONS" icon={Lightbulb} color="border-amber-500/40">
                                    <ul className="space-y-1">
                                        {suggestions.map((s, i) => <li key={i} className="font-mono text-xs text-amber-300">• {s}</li>)}
                                    </ul>
                                </Section>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
