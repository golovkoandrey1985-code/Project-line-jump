import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Settings = {
  muted: boolean;
  volume: number; // 0..1
  setMuted: (m: boolean) => void;
  setVolume: (v: number) => void;
};

const SettingsContext = createContext<Settings | null>(null);

const KEY = 'lineJumpSettings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (!s) return false;
      return JSON.parse(s).muted ?? false;
    } catch {
      return false;
    }
  });
  const [volume, setVolume] = useState<number>(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (!s) return 0.7;
      const v = JSON.parse(s).volume;
      return typeof v === 'number' ? v : 0.7;
    } catch {
      return 0.7;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ muted, volume }));
    } catch {}
  }, [muted, volume]);

  const value = useMemo(
    () => ({
      muted,
      volume,
      setMuted,
      setVolume,
    }),
    [muted, volume]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}


