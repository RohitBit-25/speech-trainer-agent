"use client";

import { motion } from 'framer-motion';
import { TrendingUp, Target, Flame } from 'lucide-react';
import { PerformanceScore } from '@/lib/types';

interface RealtimeScoreDisplayProps {
  score: PerformanceScore | null;
  isLoading?: boolean;
  goodFramesPercentage?: number;
}

export function RealtimeScoreDisplay({
  score,
  isLoading = false,
  goodFramesPercentage = 0,
}: RealtimeScoreDisplayProps) {
  if (!score) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="text-center py-4">
          <div className="text-sm text-zinc-400">Calculating score...</div>
        </div>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
      case 'A-':
        return 'from-green-500 to-emerald-500';
      case 'B+':
      case 'B':
      case 'B-':
        return 'from-blue-500 to-cyan-500';
      case 'C+':
      case 'C':
      case 'C-':
        return 'from-yellow-500 to-amber-500';
      case 'D+':
      case 'D':
      case 'D-':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-red-500 to-red-600';
    }
  };

  const getGradeTextColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
      case 'A-':
        return 'text-green-300';
      case 'B+':
      case 'B':
      case 'B-':
        return 'text-blue-300';
      case 'C+':
      case 'C':
      case 'C-':
        return 'text-yellow-300';
      case 'D+':
      case 'D':
      case 'D-':
        return 'text-orange-300';
      default:
        return 'text-red-300';
    }
  };

  const componentScores = [
    { label: 'Voice', value: score.voice_score, icon: '🎤' },
    { label: 'Facial', value: score.facial_score, icon: '😊' },
    { label: 'Content', value: score.content_score, icon: '📝' },
    { label: 'Pacing', value: score.pacing_score, icon: '⏱️' },
  ];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm space-y-4">
      {/* Main Score & Grade */}
      <div className={`bg-gradient-to-br ${getGradeColor(score.grade)} rounded-xl p-6 flex items-center justify-between`}>
        <div className="flex-1">
          <div className="text-sm text-white/80 font-semibold mb-2">CURRENT SCORE</div>
          <motion.div
            className="text-5xl font-bold text-white font-mono"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {score.total_score?.toFixed(0) ?? "0"}
          </motion.div>
        </div>

        <div className="text-right">
          <motion.div
            className={`text-6xl font-black ${getGradeTextColor(score.grade)}`}
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {score.grade}
          </motion.div>
          <div className="text-xs text-white/60 mt-2">
            {score.is_good_frame ? (
              <span className="text-green-300 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3" /> Good frame!
              </span>
            ) : (
              <span>Keep improving</span>
            )}
          </div>
        </div>
      </div>

      {/* Component Scores Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Component Breakdown</span>
        </div>
        <div className="space-y-2">
          {componentScores.map((comp, idx) => (
            <motion.div
              key={comp.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">{comp.icon} {comp.label}</span>
                <span className="text-sm font-mono font-semibold text-white">
                  {comp.value?.toFixed(0) ?? "0"}/100
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${comp.value >= 80
                    ? 'bg-green-400'
                    : comp.value >= 60
                      ? 'bg-yellow-400'
                      : comp.value >= 40
                        ? 'bg-orange-400'
                        : 'bg-red-400'
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${comp.value}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Good Frames Percentage */}
      {goodFramesPercentage !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">Quality Frames</span>
            </div>
            <span className="text-sm font-mono font-semibold text-cyan-300">
              {goodFramesPercentage?.toFixed(0) ?? "0"}%
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${goodFramesPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Strengths */}
      {score.strengths && score.strengths.length > 0 && (
        <motion.div
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-xs font-semibold text-green-300 mb-2">✅ STRENGTHS</h4>
          <ul className="space-y-1">
            {score.strengths.map((strength, idx) => (
              <li key={idx} className="text-xs text-green-200">
                • {strength}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Areas for Improvement */}
      {score.areas_for_improvement && score.areas_for_improvement.length > 0 && (
        <motion.div
          className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-xs font-semibold text-amber-300 mb-2">🎯 FOCUS AREAS</h4>
          <ul className="space-y-1">
            {score.areas_for_improvement.map((area, idx) => (
              <li key={idx} className="text-xs text-amber-200">
                • {area}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Fallback to weaknesses if areas_for_improvement not available */}
      {(!score.areas_for_improvement || score.areas_for_improvement.length === 0) &&
        score.weaknesses &&
        score.weaknesses.length > 0 && (
          <motion.div
            className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-xs font-semibold text-amber-300 mb-2">🎯 AREAS TO IMPROVE</h4>
            <ul className="space-y-1">
              {score.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-xs text-amber-200">
                  • {weakness}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
    </div>
  );
}
