import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// Helper function to get title based on level
const getLevelTitle = (level: number): string => {
    if (level >= 20) return "LEGENDARY_ORATOR";
    if (level >= 15) return "MASTER_SPEAKER";
    if (level >= 10) return "EXPERT_COMMUNICATOR";
    if (level >= 7) return "SKILLED_PRESENTER";
    if (level >= 5) return "CONFIDENT_SPEAKER";
    if (level >= 3) return "RISING_VOICE";
    return "NOVICE_SPEAKER";
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
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
                const newTitle = getLevelTitle(newLevel);

                return {
                    userProfile: {
                        ...state.userProfile,
                        xp: newXP,
                        level: newLevel,
                        title: newTitle
                    }
                };
            }),

            unlockAchievement: (id) => set((state) => {
                // Mock achievement data for now
                const achievementMap: Record<string, Achievement> = {
                    'first_upload': { id: 'first_upload', title: 'FIRST_CONTACT', description: 'Uploaded your first analysis.', icon: '🚀' },
                    'perfect_pitch': { id: 'perfect_pitch', title: 'PERFECT_PITCH', description: 'Achieved >90 tone consistency.', icon: '🎵' },
                    'speed_demon': { id: 'speed_demon', title: 'SPEED_DEMON', description: 'Completed 10 analyses.', icon: '⚡' },
                    'content_master': { id: 'content_master', title: 'CONTENT_MASTER', description: 'Perfect clarity score.', icon: '📝' }
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
        }),
        {
            name: 'speech-trainer-storage',
            partialize: (state) => ({ userProfile: state.userProfile })
        }
    )
);
