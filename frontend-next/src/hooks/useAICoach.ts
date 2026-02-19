"use client"
import { useRef, useCallback, useState, useEffect } from 'react';
import type {
  RealtimeFeedback,
  EmotionAnalysis,
  VoiceQualityMetrics,
  PerformanceScore,
  SessionSummary
} from '@/lib/types';

interface UseAICoachOptions {
  sessionId: string;
  userId: string;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  onFeedback?: (feedback: RealtimeFeedback) => void;
  onEmotionUpdate?: (emotion: EmotionAnalysis) => void;
  onVoiceUpdate?: (voice: VoiceQualityMetrics) => void;
  onScoreUpdate?: (score: PerformanceScore) => void;
  onSessionSummary?: (summary: SessionSummary) => void;
  onError?: (error: string) => void;
}

interface UseAICoachReturn {
  ws: WebSocket | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Data
  currentFeedback: RealtimeFeedback | null;
  currentScore: PerformanceScore | null;
  currentEmotion: EmotionAnalysis | null;
  currentVoice: VoiceQualityMetrics | null;
  sessionSummary: SessionSummary | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendVideoFrame: (frameData: string) => void;
  sendAudioChunk: (audioData: string, transcript?: string) => void;
  endSession: () => void;
  reset: () => void;
}

export function useAICoach(optionsOrSessionId?: UseAICoachOptions | string): UseAICoachReturn {
  // Support both object and legacy string sessionId (if needed, but better to enforce object)
  const options = typeof optionsOrSessionId === 'string'
    ? { sessionId: optionsOrSessionId, userId: '' }
    : (optionsOrSessionId || { sessionId: '', userId: '' });

  const {
    sessionId,
    userId,
    difficulty = 'intermediate',
    onFeedback,
    onEmotionUpdate,
    onVoiceUpdate,
    onScoreUpdate,
    onSessionSummary,
    onError
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentFeedback, setCurrentFeedback] = useState<RealtimeFeedback | null>(null);
  const [currentScore, setCurrentScore] = useState<PerformanceScore | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [currentVoice, setCurrentVoice] = useState<VoiceQualityMetrics | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      const type = message.type;

      if (type === 'connection_established') {
        console.log('✅ Connected to AI Coach:', message.message);
        setIsLoading(false);
      }

      else if (type === 'analysis_result') {
        // Real-time analysis with feedback
        if (message.feedback) {
          const feedback: RealtimeFeedback = {
            type: 'feedback',
            session_id: sessionId,
            feedback: message.feedback,
            facial_analysis: message.facial_analysis,
            voice_analysis: message.voice_analysis,
            score: message.score,
            timestamp: message.timestamp || new Date().toISOString()
          };
          setCurrentFeedback(feedback);
          onFeedback?.(feedback);
        } else {
          setCurrentFeedback(null);
        }

        if (message.facial_analysis) {
          setCurrentEmotion(message.facial_analysis);
          onEmotionUpdate?.(message.facial_analysis);
        }

        if (message.voice_analysis) {
          setCurrentVoice(message.voice_analysis);
          onVoiceUpdate?.(message.voice_analysis);
        }

        if (message.score) {
          setCurrentScore(message.score);
          onScoreUpdate?.(message.score);
        }
      }

      else if (type === 'voice_analysis') {
        if (message.voice) {
          setCurrentVoice(message.voice);
          onVoiceUpdate?.(message.voice);
        }
      }

      else if (type === 'session_summary') {
        setSessionSummary(message.summary);
        onSessionSummary?.(message.summary);
      }

      else if (type === 'session_ended') {
        console.log('✅ Session ended:', message.message);
        setSessionSummary(message.summary);
        onSessionSummary?.(message.summary);
      }

      else if (type === 'error') {
        const errorMsg = message.error || 'Unknown error occurred';
        setError(errorMsg);
        onError?.(errorMsg);
        console.error('Backend error:', errorMsg);
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  }, [sessionId, onFeedback, onEmotionUpdate, onVoiceUpdate, onScoreUpdate, onSessionSummary, onError]);

  // Handle WebSocket close
  const handleClose = useCallback(() => {
    console.log('❌ Disconnected from AI Coach');
    setIsConnected(false);
    wsRef.current = null;
  }, []);

  // Handle WebSocket errors
  const handleError = useCallback((event: Event) => {
    const errorMsg = 'WebSocket connection error';
    setError(errorMsg);
    onError?.(errorMsg);
    console.error(errorMsg, event);
  }, [onError]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (isConnected || wsRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Next.js rewrites don't support WebSocket upgrades well, so connect directly to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
      const wsHost = apiUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${wsHost}/ws/practice/${sessionId}?user_id=${userId}&difficulty=${difficulty}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setIsLoading(false);
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = handleMessage;
      ws.onclose = handleClose;
      ws.onerror = handleError;

      wsRef.current = ws;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
      console.error('Connection error:', err);
    }
  }, [sessionId, userId, difficulty, isConnected, handleMessage, handleClose, handleError, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send video frame for real-time analysis
  const sendVideoFrame = useCallback((frameData: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'video_frame',
        session_id: sessionId,
        frame_data: frameData,
        timestamp: new Date().toISOString()
      }));
    }
  }, [sessionId, isConnected]);

  // Send audio chunk for voice analysis
  const sendAudioChunk = useCallback((audioData: string, transcript = '') => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'audio_chunk',
        session_id: sessionId,
        audio_data: audioData,
        transcript,
        timestamp: new Date().toISOString()
      }));
    }
  }, [sessionId, isConnected]);

  // Request session summary
  const endSession = useCallback(() => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'end_session'
      }));
    }
  }, [isConnected]);

  // Reset state
  const reset = useCallback(() => {
    setCurrentFeedback(null);
    setCurrentScore(null);
    setCurrentEmotion(null);
    setCurrentVoice(null);
    setSessionSummary(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    ws: wsRef.current,
    isConnected,
    isLoading,
    error,
    currentFeedback,
    currentScore,
    currentEmotion,
    currentVoice,
    sessionSummary,
    connect,
    disconnect,
    sendVideoFrame,
    sendAudioChunk,
    endSession,
    reset
  };
}
