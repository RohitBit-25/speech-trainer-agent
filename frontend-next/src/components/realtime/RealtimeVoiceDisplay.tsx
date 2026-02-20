"use client";

import { motion } from 'framer-motion';
import { Volume2, Mic, Radio, Zap } from 'lucide-react';
import { VoiceQualityMetrics } from '@/lib/types';

interface RealtimeVoiceDisplayProps {
  voice: VoiceQualityMetrics | null;
  isLoading?: boolean;
}

export function RealtimeVoiceDisplay({ voice, isLoading = false }: RealtimeVoiceDisplayProps) {
  if (!voice) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="text-center py-4">
          <div className="text-sm text-zinc-400">Analyzing voice...</div>
        </div>
      </div>
    );
  }

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'optimal':
        return 'text-green-400';
      case 'too_fast':
        return 'text-orange-400';
      case 'too_slow':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPitchQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'expressive':
        return 'bg-green-500/30 text-green-300';
      case 'adequate':
        return 'bg-yellow-500/30 text-yellow-300';
      case 'monotone':
        return 'bg-red-500/30 text-red-300';
      default:
        return 'bg-gray-500/30 text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm space-y-4">
      {/* Overall Voice Score */}
      <div className={`bg-gradient-to-br ${getScoreColor(voice.overall_voice_score || 0)} rounded-lg p-3`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold">Voice Score</span>
          <span className="text-white font-mono text-lg">
            {(voice.overall_voice_score || 0).toFixed(0)}/100
          </span>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/40"
            initial={{ width: 0 }}
            animate={{ width: `${voice.overall_voice_score || 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Speech Rate */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-zinc-400">Speech Rate</span>
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            {(voice.speech_rate_wpm || 0).toFixed(0)} WPM
          </div>
          <div className={`text-xs font-semibold ${getQualityColor(voice.speech_rate_quality || 'normal')}`}>
            {(voice.speech_rate_quality || 'normal').replace('_', ' ').toUpperCase()}
          </div>
        </div>

        {/* Clarity Score */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">Clarity</span>
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            {(voice.clarity_score || 0).toFixed(0)}%
          </div>
          <motion.div
            className="h-1.5 bg-white/10 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${voice.clarity_score || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>

        {/* Pitch Quality */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">Pitch</span>
          </div>
          <div className="text-sm font-semibold text-white mb-1">
            {(voice.pitch_hz || 0).toFixed(0)} Hz
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${getPitchQualityColor(voice.pitch_quality || 'adequate')}`}>
            {(voice.pitch_quality || 'adequate').toUpperCase()}
          </span>
        </div>

        {/* Volume Consistency */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-400">Volume</span>
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            {(voice.volume_consistency || 0).toFixed(0)}%
          </div>
          <motion.div
            className="h-1.5 bg-white/10 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${voice.volume_consistency || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Filler Words & Pitch Variation */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
          <div className="text-xs text-zinc-400 mb-1">Filler Words</div>
          <div className="text-sm font-semibold text-orange-400">
            {(voice.filler_word_density || 0).toFixed(1)}%
          </div>
          {voice.filler_words && voice.filler_words.length > 0 && (
            <div className="text-xs text-zinc-500 mt-1">
              {voice.filler_words.join(', ')}
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
          <div className="text-xs text-zinc-400 mb-1">Pitch Variation</div>
          <div className="text-sm font-semibold text-blue-400">
            {(voice.pitch_variation_semitones || 0).toFixed(1)} ST
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {voice.recommendations && voice.recommendations.length > 0 && (
        <motion.div
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-xs font-semibold text-blue-300 mb-2">💡 TIPS</h4>
          <ul className="space-y-1">
            {voice.recommendations.slice(0, 3).map((rec, idx) => (
              <li key={idx} className="text-xs text-blue-200">
                • {rec}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
