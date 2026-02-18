import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

interface RealtimeMetrics {
    facial_score: number;
    voice_score: number;
    engagement_score: number;
    combo: number;
    multiplier: number;
    combo_status: string;
    total_score: number;
    average_score: number;
    feedback_messages: Array<{
        type: string;
        message: string;
        timestamp: number;
    }>;
    new_achievements?: Array<any>;
}

interface UseRealtimeAnalysisReturn {
    isConnected: boolean;
    metrics: RealtimeMetrics | null;
    error: string | null;
    latency: number;
    messageQueue: number;
    connect: (sessionId: string) => void;
    disconnect: () => void;
    sendVideoFrame: (frameData: string) => void;
    sendAudioChunk: (audioData: ArrayBuffer) => void;
    requestFeedback: () => void;
}

const getWebSocketUrl = () => {
    if (typeof window === 'undefined') return '';
    // Next.js rewrites don't support WebSocket upgrades, so connect directly to backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Convert http:// -> ws:// and https:// -> wss://
    return apiUrl.replace(/^http/, 'ws');
};
const RECONNECT_DELAY = 1000; // Start with 1 second
const MAX_RECONNECT_DELAY = 30000; // Max 30 seconds
const MESSAGE_BATCH_SIZE = 5; // Batch messages for better performance

export function useRealtimeAnalysis(): UseRealtimeAnalysisReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [latency, setLatency] = useState(0);
    const [messageQueue, setMessageQueue] = useState(0);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const reconnectDelayRef = useRef(RECONNECT_DELAY);
    const sessionIdRef = useRef<string | null>(null);
    const messageQueueRef = useRef<any[]>([]);
    const lastPingRef = useRef<number>(0);
    const batchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Debounce metrics updates to reduce re-renders
    const [debouncedMetrics] = useDebounce(metrics, 50);

    // Batch message sending for better performance
    const flushMessageQueue = useCallback(() => {
        if (messageQueueRef.current.length === 0 || !wsRef.current) return;

        const messages = messageQueueRef.current.splice(0, MESSAGE_BATCH_SIZE);
        messages.forEach(msg => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(msg));
            }
        });

        setMessageQueue(messageQueueRef.current.length);

        // Schedule next batch if queue not empty
        if (messageQueueRef.current.length > 0) {
            batchTimeoutRef.current = setTimeout(flushMessageQueue, 16); // ~60fps
        }
    }, []);

    const queueMessage = useCallback((message: any) => {
        messageQueueRef.current.push(message);
        setMessageQueue(messageQueueRef.current.length);

        // Start flushing if not already running
        if (!batchTimeoutRef.current) {
            batchTimeoutRef.current = setTimeout(flushMessageQueue, 16);
        }
    }, [flushMessageQueue]);

    const connect = useCallback((sessionId: string) => {
        sessionIdRef.current = sessionId;

        // Close existing connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        try {
            const wsUrl = getWebSocketUrl();
            const ws = new WebSocket(`${wsUrl}/ws/realtime-analysis/${sessionId}`);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
                reconnectDelayRef.current = RECONNECT_DELAY; // Reset delay on successful connection

                // Flush any queued messages
                flushMessageQueue();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Calculate latency
                    if (data.type === 'pong') {
                        const now = Date.now();
                        setLatency(now - lastPingRef.current);
                        return;
                    }

                    if (data.type === 'feedback') {
                        setMetrics(data.data);
                    } else if (data.type === 'error') {
                        setError(data.message);
                    }
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            ws.onerror = (event) => {
                console.error('WebSocket error:', event);
                setError('WebSocket connection error');
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);

                // Attempt to reconnect with exponential backoff
                if (sessionIdRef.current) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log(`Reconnecting in ${reconnectDelayRef.current}ms...`);
                        connect(sessionIdRef.current!);

                        // Exponential backoff
                        reconnectDelayRef.current = Math.min(
                            reconnectDelayRef.current * 2,
                            MAX_RECONNECT_DELAY
                        );
                    }, reconnectDelayRef.current);
                }
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            setError('Failed to establish connection');
        }
    }, [flushMessageQueue]);

    const disconnect = useCallback(() => {
        sessionIdRef.current = null;

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (batchTimeoutRef.current) {
            clearTimeout(batchTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        messageQueueRef.current = [];
        setMessageQueue(0);
    }, []);

    const sendVideoFrame = useCallback((frameData: string) => {
        queueMessage({
            type: 'video_frame',
            data: frameData
        });
    }, [queueMessage]);

    const sendAudioChunk = useCallback((audioData: ArrayBuffer) => {
        // Convert ArrayBuffer to base64
        const base64 = btoa(
            new Uint8Array(audioData).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            )
        );

        queueMessage({
            type: 'audio_chunk',
            data: base64
        });
    }, [queueMessage]);

    const requestFeedback = useCallback(() => {
        // Send ping for latency measurement
        lastPingRef.current = Date.now();

        queueMessage({
            type: 'request_feedback'
        });
    }, [queueMessage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    // Health check ping every 5 seconds
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                lastPingRef.current = Date.now();
                wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isConnected]);

    return {
        isConnected,
        metrics: debouncedMetrics,
        error,
        latency,
        messageQueue,
        connect,
        disconnect,
        sendVideoFrame,
        sendAudioChunk,
        requestFeedback
    };
}
