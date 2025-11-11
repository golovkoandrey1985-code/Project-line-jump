import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Settings = {
  muted: boolean;
  volume: number; // 0..1
  enableDoubleTap: boolean;
  enableVibration: boolean;
  setMuted: (m: boolean) => void;
  setVolume: (v: number) => void;
  setEnableDoubleTap: (e: boolean) => void;
  setEnableVibration: (e: boolean) => void;
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
  const [enableDoubleTap, setEnableDoubleTap] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (!s) return true;
      return JSON.parse(s).enableDoubleTap ?? true;
    } catch {
      return true;
    }
  });
  const [enableVibration, setEnableVibration] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (!s) return true;
      return JSON.parse(s).enableVibration ?? true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ muted, volume, enableDoubleTap, enableVibration }));
    } catch {}
  }, [muted, volume, enableDoubleTap, enableVibration]);

  const value = useMemo(
    () => ({
      muted,
      volume,
      enableDoubleTap,
      enableVibration,
      setMuted,
      setVolume,
      setEnableDoubleTap,
      setEnableVibration,
    }),
    [muted, volume, enableDoubleTap, enableVibration]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

