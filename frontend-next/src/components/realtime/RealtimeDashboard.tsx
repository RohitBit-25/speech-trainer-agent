"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import {
  EmotionAnalysis,
  VoiceQualityMetrics,
  PerformanceScore,
  RealtimeFeedback,
} from '@/lib/types';
import { RealtimeEmotionDisplay } from './RealtimeEmotionDisplay';
import { RealtimeVoiceDisplay } from './RealtimeVoiceDisplay';
import { RealtimeScoreDisplay } from './RealtimeScoreDisplay';
import { RealtimeFeedbackDisplay } from './RealtimeFeedbackDisplay';

export interface RealtimeDashboardProps {
  emotion: EmotionAnalysis | null;
  voice: VoiceQualityMetrics | null;
  score: PerformanceScore | null;
  feedback: RealtimeFeedback | null;
  isLoading?: boolean;
  goodFramesPercentage?: number;
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function RealtimeDashboard({
  emotion,
  voice,
  score,
  feedback,
  isLoading = false,
  goodFramesPercentage = 0,
  onClose,
  isMinimized = false,
  onToggleMinimize,
}: RealtimeDashboardProps) {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  if (isMinimized) {
    return (
      <motion.div
        className="fixed bottom-4 right-4 bg-zinc-900/80 border border-zinc-700 rounded-lg p-3 backdrop-blur-sm cursor-pointer"
        onClick={onToggleMinimize}
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-white">AI Coach Active</span>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        key="dashboard"
        className="fixed right-4 top-4 bottom-4 w-96 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-sm"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <h2 className="font-bold text-white">AI Coach Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            {onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-zinc-400" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Emotion Panel */}
          <motion.div
            className="cursor-pointer"
            onClick={() =>
              setExpandedPanel(expandedPanel === 'emotion' ? null : 'emotion')
            }
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase">
                Face & Engagement
              </h3>
              <Maximize2 className="w-3 h-3 text-zinc-500" />
            </div>
            <RealtimeEmotionDisplay
              emotion={emotion}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Voice Panel */}
          <motion.div
            className="cursor-pointer"
            onClick={() =>
              setExpandedPanel(expandedPanel === 'voice' ? null : 'voice')
            }
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase">
                Voice Quality
              </h3>
              <Maximize2 className="w-3 h-3 text-zinc-500" />
            </div>
            <RealtimeVoiceDisplay voice={voice} isLoading={isLoading} />
          </motion.div>

          {/* Score Panel */}
          <motion.div
            className="cursor-pointer"
            onClick={() =>
              setExpandedPanel(expandedPanel === 'score' ? null : 'score')
            }
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase">
                Performance Score
              </h3>
              <Maximize2 className="w-3 h-3 text-zinc-500" />
            </div>
            <RealtimeScoreDisplay
              score={score}
              isLoading={isLoading}
              goodFramesPercentage={goodFramesPercentage}
            />
          </motion.div>

          {/* Feedback Panel */}
          <motion.div
            className="cursor-pointer"
            onClick={() =>
              setExpandedPanel(expandedPanel === 'feedback' ? null : 'feedback')
            }
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase">
                Live Coaching
              </h3>
              <Maximize2 className="w-3 h-3 text-zinc-500" />
            </div>
            <RealtimeFeedbackDisplay
              feedback={feedback}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Status Indicator */}
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
            <div className="text-xs text-zinc-400">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Real-time monitoring active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Panel Overlay */}
        <AnimatePresence>
          {expandedPanel && (
            <motion.div
              className="absolute inset-0 bg-zinc-950/95 rounded-2xl p-4 z-50 overflow-y-auto flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Close expanded panel button */}
              <button
                onClick={() => setExpandedPanel(null)}
                className="self-end p-1 hover:bg-white/10 rounded-lg transition-colors mb-4"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>

              {/* Expanded content */}
              {expandedPanel === 'emotion' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white">Face & Engagement Analysis</h3>
                  <RealtimeEmotionDisplay emotion={emotion} isLoading={isLoading} />
                </div>
              )}

              {expandedPanel === 'voice' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white">Voice Quality Analysis</h3>
                  <RealtimeVoiceDisplay voice={voice} isLoading={isLoading} />
                </div>
              )}

              {expandedPanel === 'score' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white">Performance Breakdown</h3>
                  <RealtimeScoreDisplay
                    score={score}
                    isLoading={isLoading}
                    goodFramesPercentage={goodFramesPercentage}
                  />
                </div>
              )}

              {expandedPanel === 'feedback' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white">Detailed Coaching Feedback</h3>
                  <RealtimeFeedbackDisplay
                    feedback={feedback}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
