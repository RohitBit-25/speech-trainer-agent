import { useEffect, useRef, useState, useCallback } from 'react';

interface TranscriptSegment {
    text: string;
    timestamp: number;
    isFinal: boolean;
    hasFillerWord?: boolean;
}

interface UseSpeechRecognitionReturn {
    transcript: string;
    interimTranscript: string;
    segments: TranscriptSegment[];
    isListening: boolean;
    isSupported: boolean;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

// Filler words to detect
const FILLER_WORDS = new Set([
    'um', 'uh', 'like', 'you know', 'so', 'actually',
    'basically', 'literally', 'kind of', 'sort of', 'i mean'
]);

function detectFillerWords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return Array.from(FILLER_WORDS).some(filler => lowerText.includes(filler));
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const shouldListenRef = useRef(false); // Track intent to listen (stable ref, avoids stale closure)

    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Initialize recognition once on mount only
    useEffect(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser');
            return;
        }

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: any) => {
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript;

                if (result.isFinal) {
                    const segment: TranscriptSegment = {
                        text: text,
                        timestamp: Date.now(),
                        isFinal: true,
                        hasFillerWord: detectFillerWords(text)
                    };
                    setSegments(prev => [...prev, segment]);
                    setTranscript(prev => prev + text + ' ');
                } else {
                    interim += text;
                }
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') return; // Not an error, just silence
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-restart only if the user still wants to be listening
            if (shouldListenRef.current) {
                try {
                    recognition.start();
                } catch (err) {
                    console.error('Failed to restart recognition:', err);
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            shouldListenRef.current = false;
            try {
                recognition.stop();
            } catch (_) { }
        };
    }, []); // Run ONCE on mount — no deps needed

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported');
            return;
        }
        shouldListenRef.current = true;
        try {
            recognitionRef.current?.start();
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('Failed to start speech recognition');
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        shouldListenRef.current = false;
        try {
            recognitionRef.current?.stop();
        } catch (err) {
            console.error('Failed to stop recognition:', err);
        }
        setIsListening(false);
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setSegments([]);
    }, []);

    return {
        transcript,
        interimTranscript,
        segments,
        isListening,
        isSupported,
        error,
        startListening,
        stopListening,
        resetTranscript
    };
}
