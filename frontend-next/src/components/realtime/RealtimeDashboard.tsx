"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Activity, MessageSquare } from 'lucide-react';
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
}: RealtimeDashboardProps) {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Emotion Panel */}
      <div className="bg-black border-4 border-zinc-800 p-4 shadow-[4px_4px_0px_#000] relative group transition-colors hover:border-zinc-700">
        <div className="flex items-center justify-between mb-3 border-b-2 border-zinc-800 pb-2">
          <h3 className="text-[10px] font-pixel text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Face & Engagement
          </h3>
          <button onClick={() => setExpandedPanel('emotion')} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3 h-3 text-zinc-500 hover:text-primary" />
          </button>
        </div>
        <RealtimeEmotionDisplay emotion={emotion} isLoading={isLoading} />
      </div>

      {/* Voice Panel */}
      <div className="bg-black border-4 border-zinc-800 p-4 shadow-[4px_4px_0px_#000] relative group transition-colors hover:border-zinc-700">
        <div className="flex items-center justify-between mb-3 border-b-2 border-zinc-800 pb-2">
          <h3 className="text-[10px] font-pixel text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Voice Quality
          </h3>
          <button onClick={() => setExpandedPanel('voice')} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3 h-3 text-zinc-500 hover:text-primary" />
          </button>
        </div>
        <RealtimeVoiceDisplay voice={voice} isLoading={isLoading} />
      </div>

      {/* Expanded Modal for Detailed View */}
      <AnimatePresence>
        {expandedPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-black border-4 border-zinc-700 shadow-[16px_16px_0px_#000] w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b-4 border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <h2 className="font-pixel text-sm text-white uppercase tracking-wider">
                    {expandedPanel === 'emotion' && 'Facial Diagnostics'}
                    {expandedPanel === 'voice' && 'Audio Telemetry'}
                  </h2>
                </div>
                <button
                  onClick={() => setExpandedPanel(null)}
                  className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {expandedPanel === 'emotion' && (
                  <RealtimeEmotionDisplay emotion={emotion} isLoading={isLoading} />
                )}
                {expandedPanel === 'voice' && (
                  <RealtimeVoiceDisplay voice={voice} isLoading={isLoading} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
