// Телеметрия для сбора статистики игры (локальное хранилище)

export interface GameSession {
  timestamp: number;
  score: number;
  distance: number;
  level: number;
  reason: 'levelComplete' | 'gameOver' | 'quit';
  livesAtEnd: number;
  obstaclesPassed?: number;
  starsCollected?: number;
}

const TELEMETRY_KEY = 'lineJumpTelemetry';
const MAX_SESSIONS = 100; // Храним последние 100 сессий

export function saveSession(session: GameSession) {
  try {
    const saved = localStorage.getItem(TELEMETRY_KEY);
    const sessions: GameSession[] = saved ? JSON.parse(saved) : [];
    sessions.push(session);
    
    // Оставляем только последние MAX_SESSIONS
    if (sessions.length > MAX_SESSIONS) {
      sessions.splice(0, sessions.length - MAX_SESSIONS);
    }
    
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to save telemetry:', e);
  }
}

export function getTelemetryStats() {
  try {
    const saved = localStorage.getItem(TELEMETRY_KEY);
    if (!saved) return null;
    
    const sessions: GameSession[] = JSON.parse(saved);
    if (sessions.length === 0) return null;
    
    const totalSessions = sessions.length;
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
    const totalDistance = sessions.reduce((sum, s) => sum + s.distance, 0);
    const avgScore = totalScore / totalSessions;
    const avgDistance = totalDistance / totalSessions;
    
    const levelCompletes = sessions.filter(s => s.reason === 'levelComplete').length;
    const gameOvers = sessions.filter(s => s.reason === 'gameOver').length;
    
    const maxScore = Math.max(...sessions.map(s => s.score));
    const maxDistance = Math.max(...sessions.map(s => s.distance));
    
    return {
      totalSessions,
      avgScore: Math.round(avgScore),
      avgDistance: Math.round(avgDistance),
      maxScore,
      maxDistance,
      levelCompletes,
      gameOvers,
      completionRate: (levelCompletes / totalSessions) * 100,
    };
  } catch (e) {
    console.warn('Failed to read telemetry:', e);
    return null;
  }
}

export function clearTelemetry() {
  localStorage.removeItem(TELEMETRY_KEY);
}

