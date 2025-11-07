// Конфигурация уровней игры

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  obstacleSpeed: number;
  obstacleSpawnInterval: number; // мс
  targetScore: number; // очки для завершения уровня
  difficulty: 'easy' | 'medium' | 'hard';
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Уровень 1',
    description: 'Разминка',
    obstacleSpeed: 4,
    obstacleSpawnInterval: 3000, // 3 секунды
    targetScore: 500,
    difficulty: 'easy',
  },
  {
    id: 2,
    name: 'Уровень 2',
    description: 'Ускорение',
    obstacleSpeed: 5.5,
    obstacleSpawnInterval: 2300, // 2.3 секунды
    targetScore: 1300,
    difficulty: 'medium',
  },
  {
    id: 3,
    name: 'Уровень 3',
    description: 'Экстрим',
    obstacleSpeed: 7,
    obstacleSpawnInterval: 1800, // 1.8 секунды
    targetScore: 2300,
    difficulty: 'hard',
  },
];

// Функции для работы с прогрессом
export function getCurrentLevel(): number {
  const saved = localStorage.getItem('currentLevel');
  return saved ? parseInt(saved, 10) : 1;
}

export function getUnlockedLevels(): number[] {
  const saved = localStorage.getItem('unlockedLevels');
  return saved ? JSON.parse(saved) : [1]; // По умолчанию разблокирован только первый
}

export function unlockLevel(levelId: number) {
  const unlocked = getUnlockedLevels();
  if (!unlocked.includes(levelId)) {
    unlocked.push(levelId);
    localStorage.setItem('unlockedLevels', JSON.stringify(unlocked));
  }
}

export function setCurrentLevel(levelId: number) {
  localStorage.setItem('currentLevel', levelId.toString());
}

export function getLevelConfig(levelId: number): LevelConfig | undefined {
  return LEVELS.find(l => l.id === levelId);
}

export function isLevelUnlocked(levelId: number): boolean {
  return getUnlockedLevels().includes(levelId);
}
