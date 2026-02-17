import { useEffect, useRef, useState, useCallback } from 'react';

interface RealtimeMetrics {
    facial_score: number;
    voice_score: number;
    base_score: number;
    final_score: number;
    combo: number;
    max_combo: number;
    multiplier: number;
    combo_status: string;
    feedback_messages: FeedbackMessage[];
    new_achievements: Achievement[];
    total_score: number;
    average_score: number;
}

interface FeedbackMessage {
    type: 'positive' | 'warning' | 'error';
    message: string;
    icon: string;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    xp: number;
}

interface UseRealtimeAnalysisReturn {
    isConnected: boolean;
    metrics: RealtimeMetrics | null;
    error: string | null;
    connect: (sessionId: string) => void;
    disconnect: () => void;
    sendVideoFrame: (frameData: string) => void;
    sendAudioChunk: (audioData: ArrayBuffer) => void;
    requestFeedback: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws');

export function useRealtimeAnalysis(): UseRealtimeAnalysisReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback((sessionId: string) => {
        try {
            const ws = new WebSocket(`${WS_URL}/ws/realtime-analysis/${sessionId}`);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.error) {
                        setError(data.error);
                        return;
                    }

                    if (data.type === 'feedback') {
                        setMetrics(data.data);
                    }
                } catch (err) {
                    console.error('Message parse error:', err);
                }
            };

            ws.onerror = (event) => {
                console.error('WebSocket error:', event);
                setError('WebSocket connection error');
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);

                // Attempt reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (wsRef.current?.readyState === WebSocket.CLOSED) {
                        connect(sessionId);
                    }
                }, 3000);
            };

            wsRef.current = ws;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
        }
    }, []);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        setMetrics(null);
    }, []);

    const sendVideoFrame = useCallback((frameData: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'video_frame',
                data: frameData
            }));
        }
    }, []);

    const sendAudioChunk = useCallback((audioData: ArrayBuffer) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Convert ArrayBuffer to base64
            const base64 = btoa(
                new Uint8Array(audioData).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            wsRef.current.send(JSON.stringify({
                type: 'audio_chunk',
                data: base64
            }));
        }
    }, []);

    const requestFeedback = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'request_feedback'
            }));
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        metrics,
        error,
        connect,
        disconnect,
        sendVideoFrame,
        sendAudioChunk,
        requestFeedback
    };
}
