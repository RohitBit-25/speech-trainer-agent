"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { getActiveSessionChallenges } from '@/lib/api';
import type { ActiveSessionChallenge, SkillCategory } from '@/lib/types';

interface ChallengeProgress {
    challengeId: string;
    title: string;
    skillCategory: SkillCategory;
    progress: number;
    targetValue: string;
    currentValue: number;
    completed: boolean;
}

interface UseActiveSessionChallengesReturn {
    challenges: ActiveSessionChallenge[];
    challengesByCategory: Record<SkillCategory, ActiveSessionChallenge[]>;
    activeChallenges: ChallengeProgress[];
    loading: boolean;
    error: string | null;
    refreshChallenges: () => Promise<void>;
    updateChallengeProgress: (metrics: {
        eye_contact?: number;
        speech_rate_wpm?: number;
        facial_confidence?: number;
        content_clarity?: number;
        volume_db?: number;
        engagement_score?: number;
    }) => void;
}

export function useActiveSessionChallenges(userId: string | null): UseActiveSessionChallengesReturn {
    const [challenges, setChallenges] = useState<ActiveSessionChallenge[]>([]);
    const [challengesByCategory, setChallengesByCategory] = useState<Record<SkillCategory, ActiveSessionChallenge[]>>({
        body_language: [],
        voice_control: [],
        content_clarity: [],
        presence: [],
        general: []
    });
    const [activeChallenges, setActiveChallenges] = useState<ChallengeProgress[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Track current progress values for real-time updates
    const progressRef = useRef<Record<string, number>>({});

    const fetchChallenges = useCallback(async () => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const data = await getActiveSessionChallenges(userId);
            setChallenges(data.challenges);
            setChallengesByCategory(data.by_category);
            
            // Initialize active challenges tracking
            const initialProgress = data.challenges.map(c => ({
                challengeId: c.challenge_id,
                title: c.title,
                skillCategory: c.skill_category,
                progress: c.progress,
                targetValue: c.target_value,
                currentValue: c.current_value,
                completed: c.completed
            }));
            setActiveChallenges(initialProgress);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Calculate challenge progress based on current metrics
    const updateChallengeProgress = useCallback((metrics: {
        eye_contact?: number;
        speech_rate_wpm?: number;
        facial_confidence?: number;
        content_clarity?: number;
        volume_db?: number;
        engagement_score?: number;
    }) => {
        setActiveChallenges(prev => prev.map(challenge => {
            const req = challenges.find(c => c.challenge_id === challenge.challengeId)?.requirements;
            if (!req) return challenge;

            let newProgress = challenge.progress;
            let newCurrentValue = challenge.currentValue;

            // Eye contact challenges
            if (req.min_eye_contact_percent && metrics.eye_contact !== undefined) {
                newCurrentValue = metrics.eye_contact;
                newProgress = Math.min(100, (metrics.eye_contact / req.min_eye_contact_percent) * 100);
            }

            // WPM/Pacing challenges
            if (req.target_wpm_min && req.target_wpm_max && metrics.speech_rate_wpm !== undefined) {
                newCurrentValue = metrics.speech_rate_wpm;
                if (metrics.speech_rate_wpm >= req.target_wpm_min && metrics.speech_rate_wpm <= req.target_wpm_max) {
                    newProgress = 100;
                } else {
                    const mid = (req.target_wpm_min + req.target_wpm_max) / 2;
                    const distance = Math.abs(metrics.speech_rate_wpm - mid);
                    newProgress = Math.max(0, 100 - (distance / 50 * 100));
                }
            }

            // Facial confidence challenges
            if (req.min_facial_confidence && metrics.facial_confidence !== undefined) {
                newCurrentValue = metrics.facial_confidence;
                newProgress = Math.min(100, (metrics.facial_confidence / req.min_facial_confidence) * 100);
            }

            // Content clarity challenges
            if (req.min_content_clarity && metrics.content_clarity !== undefined) {
                newCurrentValue = metrics.content_clarity;
                newProgress = Math.min(100, (metrics.content_clarity / req.min_content_clarity) * 100);
            }

            // Volume challenges
            if (req.volume_min_db && req.volume_max_db && metrics.volume_db !== undefined) {
                newCurrentValue = metrics.volume_db;
                if (metrics.volume_db >= req.volume_min_db && metrics.volume_db <= req.volume_max_db) {
                    newProgress = 100;
                } else {
                    const mid = (req.volume_min_db + req.volume_max_db) / 2;
                    const distance = Math.abs(metrics.volume_db - mid);
                    newProgress = Math.max(0, 100 - (distance / 20 * 100));
                }
            }

            // Engagement challenges
            if (req.min_engagement_score && metrics.engagement_score !== undefined) {
                newCurrentValue = metrics.engagement_score;
                newProgress = Math.min(100, (metrics.engagement_score / req.min_engagement_score) * 100);
            }

            return {
                ...challenge,
                progress: newProgress,
                currentValue: newCurrentValue,
                completed: newProgress >= 100
            };
        }));
    }, [challenges]);

    // Initial fetch
    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    // Poll for updates every 30 seconds
    useEffect(() => {
        if (!userId) return;
        
        const interval = setInterval(() => {
            fetchChallenges();
        }, 30000);

        return () => clearInterval(interval);
    }, [userId, fetchChallenges]);

    return {
        challenges,
        challengesByCategory,
        activeChallenges,
        loading,
        error,
        refreshChallenges: fetchChallenges,
        updateChallengeProgress
    };
}
