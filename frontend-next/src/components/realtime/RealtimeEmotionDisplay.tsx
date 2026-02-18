"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, AlertCircle, Heart, Zap } from 'lucide-react';
import { EmotionAnalysis } from '@/lib/types';

interface RealtimeEmotionDisplayProps {
  emotion: EmotionAnalysis | null;
  isLoading?: boolean;
}

export function RealtimeEmotionDisplay({ emotion, isLoading = false }: RealtimeEmotionDisplayProps) {
  const getEmotionIcon = (emotion: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'happiness': <Smile className="w-6 h-6 text-yellow-400" />,
      'happy': <Smile className="w-6 h-6 text-yellow-400" />,
      'sadness': <Frown className="w-6 h-6 text-blue-400" />,
      'sad': <Frown className="w-6 h-6 text-blue-400" />,
      'anger': <AlertCircle className="w-6 h-6 text-red-400" />,
      'surprise': <Zap className="w-6 h-6 text-purple-400" />,
      'neutral': <AlertCircle className="w-6 h-6 text-gray-400" />,
      'fear': <AlertCircle className="w-6 h-6 text-indigo-400" />,
      'disgust': <Frown className="w-6 h-6 text-green-400" />,
    };
    return iconMap[emotion.toLowerCase()] || <AlertCircle className="w-6 h-6 text-gray-400" />;
  };

  const getEmotionColor = (emotion: string) => {
    const colorMap: Record<string, string> = {
      'happiness': 'from-yellow-500/20 to-yellow-600/10',
      'happy': 'from-yellow-500/20 to-yellow-600/10',
      'sadness': 'from-blue-500/20 to-blue-600/10',
      'sad': 'from-blue-500/20 to-blue-600/10',
      'anger': 'from-red-500/20 to-red-600/10',
      'surprise': 'from-purple-500/20 to-purple-600/10',
      'neutral': 'from-gray-500/20 to-gray-600/10',
      'fear': 'from-indigo-500/20 to-indigo-600/10',
      'disgust': 'from-green-500/20 to-green-600/10',
    };
    return colorMap[emotion.toLowerCase()] || 'from-gray-500/20 to-gray-600/10';
  };

  if (!emotion) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="text-center py-4">
          <div className="text-sm text-zinc-400">Detecting emotions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm space-y-3">
      {/* Main Emotion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion.emotion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`bg-gradient-to-br ${getEmotionColor(emotion.emotion)} rounded-lg p-3 border border-white/10`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getEmotionIcon(emotion.emotion)}
              <span className="font-semibold text-white capitalize">
                {emotion.emotion}
              </span>
            </div>
            <span className="text-sm font-mono text-zinc-300">
              {(emotion.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-white/40 to-white/20"
              initial={{ width: 0 }}
              animate={{ width: `${emotion.confidence * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Engagement & Face Detection */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-400 mb-1">Face</div>
          <div className="text-sm font-semibold">
            {emotion.face_detected ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-400 mb-1">Engagement</div>
          <div className="text-sm font-semibold text-blue-400">
            {(emotion.engagement_score * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-400 mb-1">Eye Contact</div>
          <div className="text-sm font-semibold text-purple-400">
            {(emotion.eye_contact_score * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Engagement Level Badge */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">Level:</span>
        <motion.span
          className={`px-3 py-1 rounded-full font-semibold ${
            emotion.engagement_level === 'very_high' ? 'bg-green-500/30 text-green-300' :
            emotion.engagement_level === 'high' ? 'bg-blue-500/30 text-blue-300' :
            emotion.engagement_level === 'moderate' ? 'bg-yellow-500/30 text-yellow-300' :
            emotion.engagement_level === 'low' ? 'bg-orange-500/30 text-orange-300' :
            'bg-red-500/30 text-red-300'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {emotion.engagement_level?.replace(/_/g, ' ').toUpperCase()}
        </motion.span>
      </div>
    </div>
  );
}
