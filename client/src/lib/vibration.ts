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
  jump: 10, // короткая вибрация при прыжке
  star: [20, 10, 20], // двойная вибрация при сборе звезды
  hit: [50, 30, 50], // сильная вибрация при ударе
  levelComplete: [100, 50, 100, 50, 100], // праздничная вибрация
  gameOver: [200, 100, 200], // длинная вибрация при game over
} as const;

