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

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Filler words to detect
    const fillerWords = new Set([
        'um', 'uh', 'like', 'you know', 'so', 'actually',
        'basically', 'literally', 'kind of', 'sort of', 'i mean'
    ]);

    const detectFillerWords = useCallback((text: string): boolean => {
        const lowerText = text.toLowerCase();
        return Array.from(fillerWords).some(filler =>
            lowerText.includes(filler)
        );
    }, []);

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
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript;

                if (result.isFinal) {
                    final += text + ' ';

                    // Add to segments
                    const segment: TranscriptSegment = {
                        text: text,
                        timestamp: Date.now(),
                        isFinal: true,
                        hasFillerWord: detectFillerWords(text)
                    };

                    setSegments(prev => [...prev, segment]);
                } else {
                    interim += text;
                }
            }

            if (final) {
                setTranscript(prev => prev + final);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'no-speech') {
                // Don't show error for no speech, just continue
                return;
            }

            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);

            // Auto-restart if we were listening
            if (recognitionRef.current && isListening) {
                try {
                    recognition.start();
                } catch (err) {
                    console.error('Failed to restart recognition:', err);
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isSupported, isListening, detectFillerWords]);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported');
            return;
        }

        try {
            recognitionRef.current?.start();
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('Failed to start speech recognition');
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        try {
            recognitionRef.current?.stop();
            setIsListening(false);
        } catch (err) {
            console.error('Failed to stop recognition:', err);
        }
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
