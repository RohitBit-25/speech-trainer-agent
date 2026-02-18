"use client";

import { motion } from 'framer-motion';
import { Lightbulb, MessageCircle } from 'lucide-react';
import { RealtimeFeedback } from '@/lib/types';

interface RealtimeFeedbackDisplayProps {
  feedback: RealtimeFeedback | null;
  isLoading?: boolean;
  confidence?: number;
}

export function RealtimeFeedbackDisplay({
  feedback,
  isLoading = false,
  confidence = 0.8,
}: RealtimeFeedbackDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <div className="text-sm text-zinc-400">Generating AI feedback...</div>
        </div>
      </div>
    );
  }

  if (!feedback || !feedback.feedback) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-zinc-500" />
          <div className="text-sm text-zinc-400">Coaching feedback appears here...</div>
        </div>
      </div>
    );
  }

  // Split feedback into sentences for better readability
  const feedbackSentences = feedback.feedback
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0)
    .slice(0, 3); // Show first 3 sentences max

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">AI Coach Feedback</h3>
      </div>

      {/* Main Feedback */}
      <motion.div
        className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-2">
          {feedbackSentences.map((sentence, idx) => (
            <motion.p
              key={idx}
              className="text-sm text-blue-100 leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {sentence.trim()}
            </motion.p>
          ))}
        </div>

        {/* Timestamp */}
        {feedback.timestamp && (
          <div className="text-xs text-blue-300/60 pt-2 border-t border-blue-500/20">
            {new Date(feedback.timestamp).toLocaleTimeString()}
          </div>
        )}
      </motion.div>

      {/* Confidence Indicator */}
      <motion.div
        className="bg-white/5 rounded-lg p-3 border border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-zinc-400">AI Confidence</div>
          <span className="text-xs font-mono text-blue-300">
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        Real-time AI analysis
      </div>
    </div>
  );
}
