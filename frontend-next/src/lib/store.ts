import { create } from 'zustand';
import { ParsedAnalysisResult, UserProfile, Achievement } from './types';

interface AppState {
    isAnalyzing: boolean;
    result: ParsedAnalysisResult | null;
    videoFile: File | null;
    setAnalyzing: (isAnalyzing: boolean) => void;
    setResult: (result: ParsedAnalysisResult | null) => void;
    setVideoFile: (file: File | null) => void;
    updateTranscription: (text: string) => void;

    // Gamification
    userProfile: UserProfile;
    addXP: (amount: number) => void;
    unlockAchievement: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isAnalyzing: false,
    result: null,
    videoFile: null,

    // Initial User Profile
    userProfile: {
        xp: 0,
        level: 1,
        title: "NOVICE_SPEAKER",
        achievements: []
    },

    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    setResult: (result) => set({ result }),
    setVideoFile: (file) => set({ videoFile: file }),
    updateTranscription: (text) => set((state) => ({
        result: state.result ? {
            ...state.result,
            voice: {
                ...state.result.voice,
                transcription: text
            }
        } : null
    })),

    addXP: (amount) => set((state) => {
        const newXP = state.userProfile.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1; // Simple leveling: 1000 XP per level

        return {
            userProfile: {
                ...state.userProfile,
                xp: newXP,
                level: newLevel
            }
        };
    }),

    unlockAchievement: (id) => set((state) => {
        // Mock achievement data for now
        const achievementMap: Record<string, Achievement> = {
            'first_upload': { id: 'first_upload', title: 'FIRST_CONTACT', description: 'Uploaded your first analysis.', icon: '🚀' },
            'perfect_pitch': { id: 'perfect_pitch', title: 'PERFECT_PITCH', description: 'Achieved >90 tone consistency.', icon: '🎵' }
        };

        if (state.userProfile.achievements.some(a => a.id === id)) return state;

        const achievement = achievementMap[id];
        if (!achievement) return state;

        return {
            userProfile: {
                ...state.userProfile,
                achievements: [...state.userProfile.achievements, { ...achievement, unlockedAt: new Date() }]
            }
        };
    })
}));
