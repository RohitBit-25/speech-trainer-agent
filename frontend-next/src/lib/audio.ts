"use client";

class AudioController {
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0.1; // Low volume by default
        }
    }

    private ensureContext() {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    public playTone(frequency: number, type: OscillatorType, duration: number) {
        if (!this.enabled || !this.audioContext || !this.gainNode) return;
        this.ensureContext();

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        const envelope = this.audioContext.createGain();
        envelope.connect(this.gainNode);
        envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
        envelope.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(envelope);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    public playHover() {
        // High pitched short blip
        this.playTone(800, 'square', 0.05);
    }

    public playClick() {
        // Lower pitched confirmation
        this.playTone(400, 'triangle', 0.1);
    }

    public playSuccess() {
        // Ascending major triad
        if (!this.enabled || !this.audioContext) return;
        const now = this.audioContext.currentTime;
        this.scheduleTone(523.25, 'square', 0.1, now);
        this.scheduleTone(659.25, 'square', 0.1, now + 0.1);
        this.scheduleTone(783.99, 'square', 0.2, now + 0.2);
    }

    public playError() {
        // Descending tritone (dissonant)
        if (!this.enabled || !this.audioContext) return;
        const now = this.audioContext.currentTime;
        this.scheduleTone(440, 'sawtooth', 0.2, now);
        this.scheduleTone(311.13, 'sawtooth', 0.4, now + 0.2);
    }

    public playTyping() {
        // Very short, quiet mechanical click
        this.playTone(2000 + Math.random() * 500, 'square', 0.01);
    }

    private scheduleTone(freq: number, type: OscillatorType, dur: number, time: number) {
        if (!this.audioContext || !this.gainNode) return;
        const osc = this.audioContext.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        const env = this.audioContext.createGain();
        env.connect(this.gainNode);
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(0.3, time + 0.01);
        env.gain.exponentialRampToValueAtTime(0.01, time + dur);

        osc.connect(env);
        osc.start(time);
        osc.stop(time + dur);
    }

    public toggle(enabled: boolean) {
        this.enabled = enabled;
    }
}

// Singleton instance
export const audioController = new AudioController();
