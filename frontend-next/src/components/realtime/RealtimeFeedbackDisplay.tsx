"use client";

import { motion } from 'framer-motion';
import { Lightbulb, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import { RealtimeFeedback } from '@/lib/types';

interface RealtimeFeedbackDisplayProps {
  feedback: RealtimeFeedback | null;
  isLoading?: boolean;
}

export function RealtimeFeedbackDisplay({
  feedback,
  isLoading = false,
}: RealtimeFeedbackDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <div className="text-sm text-zinc-400">Generating feedback...</div>
        </div>
      </div>
    );
  }

  if (!feedback || !feedback.real_time_feedback) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-zinc-500" />
          <div className="text-sm text-zinc-400">Waiting for feedback...</div>
        </div>
      </div>
    );
  }

  const feedbackData = feedback.real_time_feedback;

  // Categorize feedback by priority
  const criticalFeedback = feedbackData.filter(
    (f) => f.priority === 'critical'
  );
  const importantFeedback = feedbackData.filter(
    (f) => f.priority === 'important'
  );
  const suggestiveFeedback = feedbackData.filter(
    (f) => f.priority === 'suggestive'
  );

  const getFeedbackIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'important':
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
  };

  const getFeedbackColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30';
      case 'important':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-green-500/10 border-green-500/30';
    }
  };

  const getFeedbackTextColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-300';
      case 'important':
        return 'text-yellow-300';
      default:
        return 'text-green-300';
    }
  };

  const renderFeedbackSection = (
    title: string,
    feedbacks: any[],
    titleColor: string
  ) => {
    if (feedbacks.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h4 className={`text-xs font-semibold ${titleColor} flex items-center gap-2`}>
          {title}
        </h4>
        <div className="space-y-2">
          {feedbacks.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-lg p-3 border ${getFeedbackColor(item.priority)}`}
            >
              <div className="flex gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getFeedbackIcon(item.priority)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{item.feedback}</p>
                  {item.suggestion && (
                    <p className="text-xs text-zinc-300 mt-1">
                      💡 {item.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">AI Coach Feedback</h3>
      </div>

      {/* Feedback Sections */}
      <div className="space-y-4">
        {renderFeedbackSection(
          '⚠️ CRITICAL - Fix Now',
          criticalFeedback,
          'text-red-400'
        )}

        {renderFeedbackSection(
          '⭐ IMPORTANT - High Priority',
          importantFeedback,
          'text-yellow-400'
        )}

        {renderFeedbackSection(
          '✨ TIPS - Keep Improving',
          suggestiveFeedback,
          'text-green-400'
        )}
      </div>

      {/* Confidence Indicator */}
      {feedbackData.length > 0 && feedbackData[0].confidence && (
        <motion.div
          className="bg-white/5 rounded-lg p-2 border border-white/10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-xs text-zinc-400 mb-1">Analysis Confidence</div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${(feedbackData[0].confidence || 0.8) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-mono text-blue-300">
              {((feedbackData[0].confidence || 0.8) * 100).toFixed(0)}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Total Feedback Count */}
      <div className="text-xs text-center text-zinc-400 pt-2 border-t border-white/10">
        {feedbackData.length} feedback item{feedbackData.length !== 1 ? 's' : ''}{' '}
        generated • Real-time analysis
      </div>
    </div>
  );
}
