import { useRef, useState, useCallback } from 'react';

interface UseWebRTCOptions {
    video?: boolean;
    audio?: boolean;
    frameRate?: number;
}

interface UseWebRTCReturn {
    stream: MediaStream | null;
    isStreaming: boolean;
    error: string | null;
    startStream: () => Promise<void>;
    stopStream: () => void;
    captureFrame: () => string | null;
}

export function useWebRTC(options: UseWebRTCOptions = {}): UseWebRTCReturn {
    const {
        video = true,
        audio = true,
        frameRate = 30
    } = options;

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const startStream = useCallback(async () => {
        try {
            setError(null);

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: frameRate }
                } : false,
                audio: audio ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                } : false
            });

            setStream(mediaStream);
            setIsStreaming(true);

            // Create video element for frame capture
            if (video && !videoRef.current) {
                console.log("🎥 Creating internal video element for capture");
                videoRef.current = document.createElement('video');
                videoRef.current.srcObject = mediaStream;
                videoRef.current.muted = true; // Ensure muted to allow autoplay
                videoRef.current.play().catch(e => console.error("❌ Failed to play internal video:", e));
            } else {
                console.log("ℹ️ Internal video element already exists or video disabled", { video, ref: !!videoRef.current });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to access camera/microphone';
            setError(errorMessage);
            console.error('WebRTC error:', err);
        }
    }, [video, audio, frameRate]);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsStreaming(false);
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current = null;
        }
    }, [stream]);

    const captureFrame = useCallback((): string | null => {
        if (!videoRef.current || !isStreaming) {
            console.warn(`⚠️ captureFrame failed: videoRef=${!!videoRef.current}, isStreaming=${isStreaming}`);
            return null;
        }

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            ctx.drawImage(videoRef.current, 0, 0);
            return canvas.toDataURL('image/jpeg', 0.8);
        } catch (err) {
            console.error('Frame capture error:', err);
            return null;
        }
    }, [isStreaming]);

    return {
        stream,
        isStreaming,
        error,
        startStream,
        stopStream,
        captureFrame
    };
}
