// Конфигурация всех доступных персонажей

export type CharacterType = 'classic' | 'hedgehog' | 'robot' | 'slime' | 'geometric';

export interface CharacterConfig {
  id: CharacterType;
  name: string;
  description: string;
  thumbnail: string; // путь к изображению концепта
}

export const CHARACTERS: Record<CharacterType, CharacterConfig> = {
  classic: {
    id: 'classic',
    name: 'Jumpy Sphere',
    description: 'Классический круглый персонаж с лаптями',
    thumbnail: '/character-concepts/variant-1-classic.png',
  },
  hedgehog: {
    id: 'hedgehog',
    name: 'Hedgehog',
    description: 'Милый пушистый ежик с кроссовками',
    thumbnail: '/character-concepts/variant-2-animal.png',
  },
  robot: {
    id: 'robot',
    name: 'Playbot',
    description: 'Футуристический робот с антенной',
    thumbnail: '/character-concepts/variant-3-robot.png',
  },
  slime: {
    id: 'slime',
    name: 'Slime',
    description: 'Желеобразный слайм с большими глазами',
    thumbnail: '/character-concepts/variant-4-fantasy.png',
  },
  geometric: {
    id: 'geometric',
    name: 'Hexagon',
    description: 'Абстрактный геометрический персонаж',
    thumbnail: '/character-concepts/variant-5-geometric.png',
  },
};

// Доступные цвета для персонажа
export interface ColorOption {
  id: string;
  name: string;
  primary: string; // основной цвет тела
  glow: string; // цвет свечения
  legs: string; // цвет ножек (обычно совпадает с primary)
}

export const COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'cyan',
    name: 'Голубой',
    primary: '#00d9ff',
    glow: 'rgba(0, 217, 255, 0.5)',
    legs: '#00d9ff',
  },
  {
    id: 'pink',
    name: 'Розовый',
    primary: '#FF69B4',
    glow: 'rgba(255, 105, 180, 0.5)',
    legs: '#FF69B4',
  },
  {
    id: 'green',
    name: 'Зеленый',
    primary: '#00FF7F',
    glow: 'rgba(0, 255, 127, 0.5)',
    legs: '#00FF7F',
  },
  {
    id: 'purple',
    name: 'Фиолетовый',
    primary: '#9370DB',
    glow: 'rgba(147, 112, 219, 0.5)',
    legs: '#9370DB',
  },
  {
    id: 'orange',
    name: 'Оранжевый',
    primary: '#FFA500',
    glow: 'rgba(255, 165, 0, 0.5)',
    legs: '#FFA500',
  },
  {
    id: 'red',
    name: 'Красный',
    primary: '#FF4444',
    glow: 'rgba(255, 68, 68, 0.5)',
    legs: '#FF4444',
  },
  {
    id: 'yellow',
    name: 'Желтый',
    primary: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.5)',
    legs: '#FFD700',
  },
];

// Функция для получения сохраненных настроек
export function getSavedCharacter(): CharacterType {
  const saved = localStorage.getItem('selectedCharacter');
  return (saved as CharacterType) || 'slime';
}

export function getSavedColor(): ColorOption {
  const saved = localStorage.getItem('selectedColor');
  if (saved) {
    const color = COLOR_OPTIONS.find(c => c.id === saved);
    if (color) return color;
  }
  return COLOR_OPTIONS[0]; // cyan по умолчанию
}

// Функция для сохранения настроек
export function saveCharacter(character: CharacterType) {
  localStorage.setItem('selectedCharacter', character);
}

export function saveColor(colorId: string) {
  localStorage.setItem('selectedColor', colorId);
}
