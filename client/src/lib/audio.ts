import { useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

function playTone(ctx: AudioContext, freq: number, durationMs: number, volume: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  setTimeout(() => {
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.stop(ctx.currentTime + 0.06);
  }, durationMs);
}

export function useAudio() {
  const { muted, volume } = useSettings();

  const api = useMemo(() => {
    let ctx: AudioContext | null = null;
    const ensure = () => {
      if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      return ctx;
    };
    return {
      jump() {
        if (muted) return;
        const c = ensure();
        playTone(c, 440, 90, volume * 0.25, 'square');
        playTone(c, 660, 60, volume * 0.15, 'sine');
      },
      star() {
        if (muted) return;
        const c = ensure();
        playTone(c, 880, 80, volume * 0.2, 'triangle');
        setTimeout(() => playTone(c, 1320, 80, volume * 0.18, 'triangle'), 60);
      },
      hit() {
        if (muted) return;
        const c = ensure();
        playTone(c, 160, 120, volume * 0.3, 'sawtooth');
      },
      levelComplete() {
        if (muted) return;
        const c = ensure();
        playTone(c, 523.25, 120, volume * 0.22, 'sine'); // C5
        setTimeout(() => playTone(c, 659.25, 120, volume * 0.22, 'sine'), 120); // E5
        setTimeout(() => playTone(c, 783.99, 160, volume * 0.22, 'sine'), 240); // G5
      },
      gameOver() {
        if (muted) return;
        const c = ensure();
        playTone(c, 392, 180, volume * 0.2, 'triangle');
        setTimeout(() => playTone(c, 261.63, 240, volume * 0.2, 'triangle'), 150);
      },
    };
  }, [muted, volume]);

  return api;
}


