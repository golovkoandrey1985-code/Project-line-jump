// Утилита для вибрации (Vibration API)

export function vibrate(pattern: number | number[], enabled: boolean = true) {
  if (!enabled) return;
  
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return; // Vibration API не поддерживается
  }
  
  try {
    navigator.vibrate(pattern);
  } catch (e) {
    console.warn('Vibration failed:', e);
  }
}

// Предустановленные паттерны
export const VIBRATION_PATTERNS = {
  jump: 30, // короткая вибрация при прыжке (увеличено для лучшей чувствительности)
  star: [30, 20, 30], // двойная вибрация при сборе звезды
  hit: [100, 50, 100], // сильная вибрация при ударе
  levelComplete: [100, 50, 100, 50, 100], // праздничная вибрация
  gameOver: [200, 100, 200], // длинная вибрация при game over
} as const;

