import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAudioCaptureReturn {
    isCapturing: boolean;
    error: string | null;
    startCapture: (stream: MediaStream, onAudioData: (base64Data: string) => void) => void;
    stopCapture: () => void;
}

export function useAudioCapture(): UseAudioCaptureReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for audio processing nodes
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const onAudioDataRef = useRef<((data: string) => void) | null>(null);

    // Process audio buffer to 16kHz mono PCM
    const processAudio = useCallback((inputBuffer: AudioBuffer) => {
        const inputData = inputBuffer.getChannelData(0);

        // Simple downsampling to 16kHz
        // Browser audio is usually 44.1kHz or 48kHz
        const targetSampleRate = 16000;
        const currentSampleRate = inputBuffer.sampleRate;
        const compression = currentSampleRate / targetSampleRate;

        const length = Math.floor(inputData.length / compression);
        const result = new Int16Array(length);

        for (let i = 0; i < length; i++) {
            // Simple decimation
            const inputIndex = Math.floor(i * compression);

            // Clamp and convert float32 (-1.0 to 1.0) to int16 (-32768 to 32767)
            const s = Math.max(-1, Math.min(1, inputData[inputIndex]));
            result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert to base64 string
        // We need to convert buffer to binary string
        let binary = '';
        const bytes = new Uint8Array(result.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        const base64Data = btoa(binary);

        if (onAudioDataRef.current) {
            onAudioDataRef.current(base64Data);
        }
    }, []);

    const startCapture = useCallback((stream: MediaStream, onAudioData: (base64Data: string) => void) => {
        try {
            if (stream.getAudioTracks().length === 0) {
                setError("No audio track in stream");
                return;
            }

            onAudioDataRef.current = onAudioData;

            // Initialize AudioContext
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            // bufferSize: 4096 is a good balance for latency/performance
            // 4096 samples @ 44.1kHz ~= 92ms
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                processAudio(e.inputBuffer);
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsCapturing(true);
            setError(null);

        } catch (err: any) {
            console.error("Failed to start audio capture:", err);
            setError(err.message || "Failed to start audio processing");
        }
    }, [processAudio]);

    const stopCapture = useCallback(() => {
        // Disconnect nodes
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        // Close context
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }

        setIsCapturing(false);
        onAudioDataRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCapture();
        };
    }, [stopCapture]);

    return {
        isCapturing,
        error,
        startCapture,
        stopCapture
    };
}
