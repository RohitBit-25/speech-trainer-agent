import { create } from 'zustand';
import { ParsedAnalysisResult } from './types';

interface AppState {
    isAnalyzing: boolean;
    result: ParsedAnalysisResult | null;
    videoFile: File | null;
    setAnalyzing: (isAnalyzing: boolean) => void;
    setResult: (result: ParsedAnalysisResult | null) => void;
    setVideoFile: (file: File | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isAnalyzing: false,
    result: null,
    videoFile: null,
    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    setResult: (result) => set({ result }),
    setVideoFile: (file) => set({ videoFile: file }),
}));
