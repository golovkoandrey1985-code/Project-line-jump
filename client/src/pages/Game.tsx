import { useEffect, useRef, useState } from 'react';
import { getCurrentLevel, setCurrentLevel, getLevelConfig, unlockLevel, isLevelUnlocked, LEVELS } from '../levels';

// Адаптивные размеры canvas
const CANVAS_WIDTH = typeof window !== 'undefined' ? Math.min(window.innerWidth, 800) : 800;
const CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight * 0.9 : 600; // 90% высоты экрана - fullscreen
const GROUND_HEIGHT = 65; // Минимальная высота дороги
const PLAYER_SIZE = 40;
const PLAYER_X_POSITION = 50; // Максимально влево
const INITIAL_LIVES = 3;
const MAX_LIVES = 5;

// Физика прыжков (настроено для мобильных)
const GRAVITY = 0.8; // уменьшена для более плавного падения
const JUMP_POWER = -15; // уменьшено под новую высоту canvas 500px
const HIGH_JUMP_POWER = -18; // для высоких препятствий (уменьшено чтобы не уходить за экран)
const DOUBLE_TAP_THRESHOLD = 600; // мс (увеличено для мобильных)

// Препятствия (базовые настройки)
const MIN_OBSTACLE_DISTANCE = 400; // увеличено с 300
const INITIAL_DELAY = 2000; // задержка перед первым препятствием

// Цветовая палитра (обновлено согласно дизайн-концепции)
const COLORS = {
  // Небо и фон
  skyTop: '#87CEEB',
  skyBottom: '#FFB6C1',
  sun: '#FFD700',
  mountainFar: '#8B7355',
  mountainMid: '#A0826D',
  trees: '#2ECC71',
  
  // Дорога (упрощенная)
  roadMain: '#3a4a5a', // Спокойный серо-синий
  roadDark: '#2d3a47', // Темнее для бордюров
  roadLine: 'rgba(255, 255, 255, 0.3)', // Полупрозрачная разметка
  
  // Персонаж
  player: '#00d9ff',
  playerGlow: 'rgba(0, 217, 255, 0.5)',
  playerLegs: '#00d9ff',
  
  // Препятствия
  obstacleLow: '#FF3366',
  obstacleHigh: '#FF6B35',
  obstacleGlow: 'rgba(255, 51, 102, 0.5)',
  
  // Бонусы
  star: '#ffd700',
  starGlow: 'rgba(255, 215, 0, 0.6)',
  
  // Погода
  rain: '#87CEEB',
  snow: '#FFFFFF',
  
  // UI
  ui: '#00d9ff',
};

type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelSelect' | 'levelComplete';

interface Obstacle {
  x: number;
  height: number; // 'low' или 'high'
  width: number;
}

interface Star {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface WeatherParticle {
  x: number;
  y: number;
  vy: number; // скорость падения
  vx?: number; // для снега (покачивание)
  size: number;
}

interface FlyingObject {
  x: number;
  y: number;
  vx: number; // скорость движения
  vy?: number; // для воздушных шаров
  type: 'bird' | 'balloon' | 'plane' | 'helicopter';
  size: number;
  wingPhase?: number; // для анимации крыльев
  color: string; // цвет объекта
  variant?: number; // вариант для птиц (1-3)
  rotorPhase?: number; // для вращения винта вертолета
}

type WeatherType = 'clear' | 'rain' | 'snow';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [baseScore, setBaseScore] = useState(0); // Базовые очки с предыдущих уровней
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [currentLevelId, setCurrentLevelId] = useState(() => getCurrentLevel());
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('lineJumpHighScore');
    return saved ? parseInt(saved) : 0;
  });
  
  // Career Score - накопительный счет за все время
  const [careerScore, setCareerScore] = useState(() => {
    const saved = localStorage.getItem('lineJumpCareerScore');
    return saved ? parseInt(saved) : 0;
  });

  // Игровые переменные
  const playerYRef = useRef(CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE);
  const playerVelocityYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastObstacleTimeRef = useRef(0);
  const lastStarTimeRef = useRef(0);
  const distanceRef = useRef(0);
  
  // Погодная система
  const weatherRef = useRef<WeatherType>('clear');
  const weatherParticlesRef = useRef<WeatherParticle[]>([]);
  const lastWeatherChangeRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const [showDoubleTapIndicator, setShowDoubleTapIndicator] = useState(false);
  const waitingForSecondTapRef = useRef(false); // Флаг ожидания второго тапа
  const invincibleUntilRef = useRef(0);
  
  // Параллакс фона
  const bgOffsetRef = useRef(0);
  
  // Летающие объекты
  const flyingObjectsRef = useRef<FlyingObject[]>([]);
  const lastFlyingObjectSpawnRef = useRef(0);
  
  // Способности персонажа
  const [hasTripleJump, setHasTripleJump] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const magnetEndTimeRef = useRef(0);
  const tripleJumpEndTimeRef = useRef(0);
  const lastTripleJumpScoreRef = useRef(0); // Последний счет когда был активирован тройной прыжок
  const lastMagnetScoreRef = useRef(0); // Последний счет когда был активирован магнит
  const consecutiveStarsRef = useRef(0); // Для щита

  // Сброс игры
  const resetGame = (keepScore: boolean = false) => {
    playerYRef.current = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;
    playerVelocityYRef.current = 0;
    isJumpingRef.current = false;
    obstaclesRef.current = [];
    starsRef.current = [];
    particlesRef.current = [];
    lastObstacleTimeRef.current = 0;
    lastStarTimeRef.current = 0;
    distanceRef.current = 0;
    invincibleUntilRef.current = 0;
    weatherRef.current = 'clear';
    weatherParticlesRef.current = [];
    lastWeatherChangeRef.current = 0;
    flyingObjectsRef.current = [];
    lastFlyingObjectSpawnRef.current = 0;
    setHasTripleJump(false);
    setHasShield(false);
    setHasMagnet(false);
    magnetEndTimeRef.current = 0;
    consecutiveStarsRef.current = 0;
    if (!keepScore) {
      setScore(0);
      setBaseScore(0);
    } else {
      // Сохраняем текущий score как baseScore
      setBaseScore(score);
    }
    setLives(INITIAL_LIVES);
  };

  // Создание частиц
  const createParticles = (x: number, y: number, color: string, count: number = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
      });
    }
  };

  // Обработка тапа/клика (улучшенная механика двойного тапа)
  const handleTap = () => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;
    const isOnGround = playerYRef.current === groundY;
    const isInAir = !isOnGround;

    // Случай 1: Второй тап в воздухе (двойной тап) - работает в любой момент полета!
    if (waitingForSecondTapRef.current && timeSinceLastTap > 0 && timeSinceLastTap < DOUBLE_TAP_THRESHOLD) {
      // Высокий прыжок или тройной (если есть способность)
      const jumpPower = hasTripleJump ? -22 : HIGH_JUMP_POWER; // Тройной прыжок еще выше
      playerVelocityYRef.current = jumpPower;
      isJumpingRef.current = true;
      setShowDoubleTapIndicator(false);
      
      if (hasTripleJump) {
        // Радужный эффект для тройного прыжка
        createParticles(PLAYER_X_POSITION, playerYRef.current + PLAYER_SIZE, '#ff00ff', 12);
        createParticles(PLAYER_X_POSITION, playerYRef.current + PLAYER_SIZE, '#00ffff', 12);
      } else {
        createParticles(PLAYER_X_POSITION, playerYRef.current + PLAYER_SIZE, '#ffd700', 8);
      }
      
      waitingForSecondTapRef.current = false;
      lastTapTimeRef.current = 0;
      return;
    }

    // Случай 2: Первый тап на земле
    if (isOnGround) {
      // Обычный прыжок
      playerVelocityYRef.current = JUMP_POWER;
      isJumpingRef.current = true;
      createParticles(PLAYER_X_POSITION, playerYRef.current + PLAYER_SIZE, COLORS.player, 5);
      
      // Начинаем ожидать второй тап
      waitingForSecondTapRef.current = true;
      setShowDoubleTapIndicator(true);
      
      // Автоматически сбрасываем через DOUBLE_TAP_THRESHOLD
      setTimeout(() => {
        waitingForSecondTapRef.current = false;
        setShowDoubleTapIndicator(false);
      }, DOUBLE_TAP_THRESHOLD);
      
      lastTapTimeRef.current = now;
    }
    // Тапы в воздухе без активного окна двойного тапа игнорируются
  };

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing') {
        setGameState('paused');
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Игровой цикл
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;

    const gameLoop = () => {
      // Обновляем параллакс только во время игры
      if (gameState === 'playing') {
        bgOffsetRef.current += 2; // Движение фона
      }

      // === ФОН ===
      
      // Небо с градиентом
      const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
      skyGradient.addColorStop(0, COLORS.skyTop);
      skyGradient.addColorStop(1, COLORS.skyBottom);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);

      // Солнце
      ctx.fillStyle = COLORS.sun;
      ctx.shadowBlur = 30;
      ctx.shadowColor = COLORS.sun;
      ctx.beginPath();
      ctx.arc(150, 100, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Декоративные звезды в верхней части (увеличено)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const starPositions = [
        {x: 80, y: 25}, {x: 150, y: 45}, {x: 220, y: 30}, {x: 290, y: 55},
        {x: 360, y: 35}, {x: 430, y: 60}, {x: 500, y: 40}, {x: 570, y: 50},
        {x: 640, y: 30}, {x: 710, y: 45}, {x: 120, y: 70}, {x: 380, y: 75},
        {x: 520, y: 65}, {x: 660, y: 70}, {x: 200, y: 80}
      ];
      starPositions.forEach(pos => {
        const twinkle = Math.sin(distanceRef.current * 0.05 + pos.x) * 0.3 + 0.7;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Дальние горы (параллакс 0.15x)
      ctx.fillStyle = COLORS.mountainFar;
      for (let i = 0; i < 4; i++) {
        let x = (i * 300 - bgOffsetRef.current * 0.15) % (CANVAS_WIDTH + 300);
        if (x < -300) x += CANVAS_WIDTH + 300; // Бесконечный скроллинг
        const baseY = CANVAS_HEIGHT - GROUND_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(x - 100, baseY);
        ctx.lineTo(x, baseY - 120);
        ctx.lineTo(x + 100, baseY);
        ctx.closePath();
        ctx.fill();
      }

      // Средние горы (параллакс 0.25x)
      ctx.fillStyle = COLORS.mountainMid;
      for (let i = 0; i < 5; i++) {
        let x = (i * 250 - bgOffsetRef.current * 0.25) % (CANVAS_WIDTH + 250);
        if (x < -250) x += CANVAS_WIDTH + 250; // Бесконечный скроллинг
        const baseY = CANVAS_HEIGHT - GROUND_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(x - 125, baseY);
        ctx.lineTo(x, baseY - 80);
        ctx.lineTo(x + 125, baseY);
        ctx.closePath();
        ctx.fill();
      }

      // Деревья (параллакс 0.4x) - разные размеры и оттенки
      const treeColors = ['#2ECC71', '#27AE60', '#229954']; // Разные оттенки зеленого
      for (let i = 0; i < 8; i++) {
        let x = (i * 150 - bgOffsetRef.current * 0.4) % (CANVAS_WIDTH + 150);
        if (x < -150) x += CANVAS_WIDTH + 150; // Бесконечный скроллинг
        const baseY = CANVAS_HEIGHT - GROUND_HEIGHT;
        
        // Размер дерева: маленькое (0.7x), среднее (1.0x), большое (1.4x)
        const sizeVariant = i % 3;
        const scale = sizeVariant === 0 ? 0.7 : sizeVariant === 1 ? 1.0 : 1.4;
        
        // Цвет кроны
        const treeColor = treeColors[i % treeColors.length];
        
        // Ствол
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 5 * scale, baseY - 30 * scale, 10 * scale, 30 * scale);
        
        // Крона (треугольник)
        ctx.fillStyle = treeColor;
        ctx.beginPath();
        ctx.moveTo(x - 20 * scale, baseY - 30 * scale);
        ctx.lineTo(x, baseY - 60 * scale);
        ctx.lineTo(x + 20 * scale, baseY - 30 * scale);
        ctx.closePath();
        ctx.fill();
      }

      // Облака (параллакс 0.5x) - максимальное количество
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 12; i++) {
        let x = (i * 150 - bgOffsetRef.current * 0.5) % (CANVAS_WIDTH + 150);
        if (x < -150) x += CANVAS_WIDTH + 150; // Бесконечный скроллинг
        const y = 40 + (i % 4) * 50; // Больше слоев
        const size = 25 + (i % 3) * 15; // Большие размеры
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.8, y, size * 1.3, 0, Math.PI * 2);
        ctx.arc(x + size * 1.8, y, size * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // === ЛЕТАЮЩИЕ ОБЪЕКТЫ ===
      
      // Спаун летающих объектов (каждые 5-10 секунд)
      const currentTime = Date.now();
      if (gameState === 'playing' && currentTime - lastFlyingObjectSpawnRef.current > 1500 + Math.random() * 2000) { // Очень частый спаун (1.5-3.5с)
        // Спауним 1-3 объекта одновременно
        const spawnCount = Math.random() > 0.7 ? 3 : (Math.random() > 0.5 ? 2 : 1);
        
        // Цвета для шаров
        const balloonColors = ['#FF3366', '#3366FF', '#33FF66', '#FFFF33', '#FF66FF', '#9966FF'];
        // Цвета для птиц
        const birdColors = ['#8B4513', '#696969', '#FFFFFF'];
        
        for (let i = 0; i < spawnCount; i++) {
          // Случайный выбор типа: птица, шар, самолет, вертолет
          const rand = Math.random();
          let type: 'bird' | 'balloon' | 'plane' | 'helicopter';
          if (rand < 0.4) type = 'bird';
          else if (rand < 0.7) type = 'balloon';
          else if (rand < 0.85) type = 'plane';
          else type = 'helicopter';
          
          const yPos = 30 + Math.random() * 200; // Верхняя часть экрана
          
          // Выбираем цвет в зависимости от типа
          let color: string;
          if (type === 'balloon') {
            color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
          } else if (type === 'bird') {
            color = birdColors[Math.floor(Math.random() * birdColors.length)];
          } else if (type === 'plane') {
            color = '#CCCCCC'; // Серебристый самолет
          } else {
            color = '#FF6B35'; // Оранжевый вертолет
          }
          
          flyingObjectsRef.current.push({
            x: CANVAS_WIDTH + 50 + i * 100, // Разносим по X
            y: yPos,
            vx: type === 'bird' ? -3 - Math.random() * 2 : 
                type === 'balloon' ? -1 - Math.random() :
                type === 'plane' ? -4 - Math.random() * 2 : // Самолеты быстрые
                -2 - Math.random(), // Вертолеты средние
            vy: type === 'balloon' ? -0.5 : undefined, // Шары плывут вверх
            type,
            size: type === 'bird' ? 20 : 
                  type === 'balloon' ? 25 :
                  type === 'plane' ? 30 :
                  28, // Вертолет
            wingPhase: 0,
            color,
            variant: type === 'bird' ? Math.floor(Math.random() * 3) + 1 : undefined, // 1-3 для птиц
            rotorPhase: type === 'helicopter' ? 0 : undefined,
          });
        }
        
        lastFlyingObjectSpawnRef.current = currentTime;
      }
      
      // Обновляем и рисуем летающие объекты
      flyingObjectsRef.current = flyingObjectsRef.current.filter(obj => {
        // Обновляем позицию
        obj.x += obj.vx;
        if (obj.vy !== undefined) {
          obj.y += obj.vy;
        }
        
        // Удаляем если вышли за экран
        if (obj.x < -100 || obj.y < -100) return false;
        
        // Рисуем в зависимости от типа
        if (obj.type === 'bird') {
          // Птица (разные варианты)
          obj.wingPhase = (obj.wingPhase || 0) + 0.2;
          const wingOffset = Math.sin(obj.wingPhase) * 5;
          
          ctx.fillStyle = obj.color;
          
          // Тело (разные размеры в зависимости от variant)
          const bodyScale = obj.variant === 1 ? 1.0 : obj.variant === 2 ? 0.8 : 1.2;
          ctx.beginPath();
          ctx.ellipse(obj.x, obj.y, obj.size * 0.6 * bodyScale, obj.size * 0.4 * bodyScale, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Крылья
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x - obj.size * bodyScale, obj.y + wingOffset);
          ctx.lineTo(obj.x - obj.size * 0.5 * bodyScale, obj.y);
          ctx.closePath();
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x + obj.size * bodyScale, obj.y + wingOffset);
          ctx.lineTo(obj.x + obj.size * 0.5 * bodyScale, obj.y);
          ctx.closePath();
          ctx.fill();
        } else if (obj.type === 'balloon') {
          // Воздушный шар (цветной)
          const balloonGradient = ctx.createRadialGradient(obj.x - 5, obj.y - 5, 5, obj.x, obj.y, obj.size);
          // Создаем градиент на основе цвета
          balloonGradient.addColorStop(0, obj.color);
          balloonGradient.addColorStop(1, obj.color + 'CC'); // Темнее
          
          // Шар
          ctx.fillStyle = balloonGradient;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Блик
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(obj.x - 8, obj.y - 8, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Веревка
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y + obj.size);
          ctx.lineTo(obj.x, obj.y + obj.size + 20);
          ctx.stroke();
        } else if (obj.type === 'plane') {
          // Самолет
          ctx.fillStyle = obj.color;
          
          // Фюзеляж
          ctx.beginPath();
          ctx.ellipse(obj.x, obj.y, obj.size, obj.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Крылья
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x - obj.size * 0.8, obj.y - obj.size * 0.15, obj.size * 1.6, obj.size * 0.3);
          
          // Хвост
          ctx.beginPath();
          ctx.moveTo(obj.x - obj.size, obj.y);
          ctx.lineTo(obj.x - obj.size * 1.2, obj.y - obj.size * 0.3);
          ctx.lineTo(obj.x - obj.size * 0.9, obj.y);
          ctx.fill();
        } else if (obj.type === 'helicopter') {
          // Вертолет
          obj.rotorPhase = (obj.rotorPhase || 0) + 0.3;
          
          ctx.fillStyle = obj.color;
          
          // Кабина
          ctx.beginPath();
          ctx.ellipse(obj.x, obj.y, obj.size * 0.7, obj.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Винт (вращающийся)
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.save();
          ctx.translate(obj.x, obj.y - obj.size * 0.6);
          ctx.rotate(obj.rotorPhase);
          ctx.beginPath();
          ctx.moveTo(-obj.size, 0);
          ctx.lineTo(obj.size, 0);
          ctx.stroke();
          ctx.restore();
          
          // Хвостовая балка
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x - obj.size * 1.2, obj.y - obj.size * 0.1, obj.size * 0.8, obj.size * 0.2);
        }
        
        return true;
      });

      // === ДОРОГА (разные типы для уровней) ===
      
      // Выбираем тип дороги в зависимости от уровня
      if (currentLevelId === 1) {
        // Уровень 1: Серо-синяя дорога (текущая)
        ctx.fillStyle = COLORS.roadMain;
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
        
        ctx.fillStyle = COLORS.roadDark;
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 5);
        ctx.fillRect(0, CANVAS_HEIGHT - 5, CANVAS_WIDTH, 5);

        ctx.strokeStyle = COLORS.roadLine;
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]);
        ctx.lineDashOffset = -(distanceRef.current * 2) % 25;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT / 2);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
      } else if (currentLevelId === 2) {
        // Уровень 2: Асфальт с желтой разметкой
        ctx.fillStyle = '#2C2C2C'; // Темно-серый асфальт
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
        
        // Желтые бордюры
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 3);
        ctx.fillRect(0, CANVAS_HEIGHT - 3, CANVAS_WIDTH, 3);

        // Желтая двойная разметка
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 15]);
        ctx.lineDashOffset = -(distanceRef.current * 2) % 35;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT / 2 - 5);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT / 2 - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT / 2 + 5);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT / 2 + 5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
      } else if (currentLevelId === 3) {
        // Уровень 3: Пустынная дорога (песочная)
        // Песочный градиент
        const sandGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
        sandGradient.addColorStop(0, '#EDC9AF');
        sandGradient.addColorStop(1, '#D2B48C');
        ctx.fillStyle = sandGradient;
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
        
        // Камни по краям
        ctx.fillStyle = '#8B7355';
        for (let i = 0; i < 10; i++) {
          const x = (i * 80 - distanceRef.current * 0.5) % CANVAS_WIDTH;
          const y = CANVAS_HEIGHT - GROUND_HEIGHT + 10 + (i % 3) * 15;
          ctx.beginPath();
          ctx.arc(x, y, 3 + (i % 2) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Бордюры из камней
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 4);
        ctx.fillRect(0, CANVAS_HEIGHT - 4, CANVAS_WIDTH, 4);
      }

      // Обновляем физику игрока
      playerVelocityYRef.current += GRAVITY;
      playerYRef.current += playerVelocityYRef.current;

      // Проверка приземления
      if (playerYRef.current >= groundY) {
        playerYRef.current = groundY;
        playerVelocityYRef.current = 0;
        isJumpingRef.current = false;
      }

      // Увеличиваем дистанцию
      distanceRef.current += 1;
      const levelScore = Math.floor(distanceRef.current / 10);
      const currentScore = baseScore + levelScore;
      setScore(currentScore);
      
      // Проверяем получение способностей (повторяющиеся каждые N очков)
      // Тройной прыжок - каждые 500 очков, длительность 15 секунд
      if (Math.floor(currentScore / 500) > Math.floor(lastTripleJumpScoreRef.current / 500)) {
        setHasTripleJump(true);
        tripleJumpEndTimeRef.current = Date.now() + 15000; // 15 секунд
        lastTripleJumpScoreRef.current = currentScore;
        createParticles(PLAYER_X_POSITION, playerYRef.current, '#ff00ff', 20);
      }
      
      // Магнит - каждые 400 очков, длительность 10 секунд
      if (Math.floor(currentScore / 400) > Math.floor(lastMagnetScoreRef.current / 400)) {
        setHasMagnet(true);
        magnetEndTimeRef.current = Date.now() + 10000; // 10 секунд
        lastMagnetScoreRef.current = currentScore;
        createParticles(PLAYER_X_POSITION, playerYRef.current, '#ffd700', 20);
      }
      
      // Проверяем истечение времени способностей
      if (hasTripleJump && Date.now() > tripleJumpEndTimeRef.current) {
        setHasTripleJump(false);
      }

      // Проверяем завершение уровня
      const currentLevelConfig = getLevelConfig(currentLevelId) || LEVELS[0];
      if (currentScore >= currentLevelConfig.targetScore) {
        // Уровень завершен!
        const nextLevelId = currentLevelId + 1;
        if (nextLevelId <= LEVELS.length) {
          unlockLevel(nextLevelId);
        }
        
        // Обновляем Career Score (НЕ обнуляем score!)
        const newCareerScore = careerScore + currentScore;
        console.log('Level Complete! Career Score:', careerScore, '+ Level Score:', currentScore, '= New Career Score:', newCareerScore);
        setCareerScore(newCareerScore);
        localStorage.setItem('lineJumpCareerScore', newCareerScore.toString());
        
        setGameState('levelComplete');
        return;
      }

      const now = Date.now();
      
      // === ПОГОДНАЯ СИСТЕМА ===
      
      // Смена погоды каждые 40-60 секунд
      const WEATHER_CHANGE_INTERVAL = 40000 + Math.random() * 20000;
      if (now - lastWeatherChangeRef.current > WEATHER_CHANGE_INTERVAL) {
        const weathers: WeatherType[] = ['clear', 'rain', 'snow'];
        const currentIndex = weathers.indexOf(weatherRef.current);
        weatherRef.current = weathers[(currentIndex + 1) % weathers.length];
        lastWeatherChangeRef.current = now;
        weatherParticlesRef.current = []; // Сбрасываем старые частицы
      }
      
      // Создание погодных частиц (оптимизировано)
      if (weatherRef.current === 'rain' && weatherParticlesRef.current.length < 20) {
        weatherParticlesRef.current.push({
          x: Math.random() * CANVAS_WIDTH,
          y: -10,
          vy: 8 + Math.random() * 4,
          size: 2,
        });
      } else if (weatherRef.current === 'snow' && weatherParticlesRef.current.length < 15) {
        weatherParticlesRef.current.push({
          x: Math.random() * CANVAS_WIDTH,
          y: -10,
          vy: 1 + Math.random() * 2,
          vx: Math.sin(Math.random() * Math.PI * 2) * 0.5,
          size: 3 + Math.random() * 3,
        });
      }
      
      // Обновление и рисование погодных частиц
      weatherParticlesRef.current = weatherParticlesRef.current.filter(p => {
        p.y += p.vy;
        if (p.vx !== undefined) {
          p.x += p.vx;
        }
        
        if (p.y > CANVAS_HEIGHT) return false;
        
        if (weatherRef.current === 'rain') {
          // Дождь - тонкие линии
          ctx.strokeStyle = COLORS.rain;
          ctx.lineWidth = p.size;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + 10);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (weatherRef.current === 'snow') {
          // Снег - кружочки
          ctx.fillStyle = COLORS.snow;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        
        return true;
      });

      // Получаем конфигурацию текущего уровня
      const levelConfig = getLevelConfig(currentLevelId) || LEVELS[0];
      const obstacleSpeed = levelConfig.obstacleSpeed;
      const obstacleSpawnInterval = levelConfig.obstacleSpawnInterval;

      // Спаун препятствий с паттернами
      const timeSinceStart = distanceRef.current * (1000 / 60); // примерное время в мс
      if (timeSinceStart > INITIAL_DELAY && now - lastObstacleTimeRef.current > obstacleSpawnInterval) {
        const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
        if (!lastObstacle || lastObstacle.x < CANVAS_WIDTH - MIN_OBSTACLE_DISTANCE) {
          
          // Паттерны препятствий в зависимости от уровня
          const patternRoll = Math.random();
          
          if (currentLevelId === 1) {
            // Уровень 1: Одиночные (60%) и парные (40%)
            if (patternRoll < 0.6) {
              // Одиночное препятствие
              const isHigh = Math.random() > 0.6;
              obstaclesRef.current.push({
                x: CANVAS_WIDTH,
                height: isHigh ? 70 : 35,
                width: 30,
              });
            } else {
              // Парные низкие
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height: 35, width: 30 },
                { x: CANVAS_WIDTH + 70, height: 35, width: 30 }
              );
            }
          } else if (currentLevelId === 2) {
            // Уровень 2: Одиночные (30%), парные (40%), комбо (30%)
            if (patternRoll < 0.3) {
              // Одиночное
              const isHigh = Math.random() > 0.5;
              obstaclesRef.current.push({
                x: CANVAS_WIDTH,
                height: isHigh ? 70 : 35,
                width: 30,
              });
            } else if (patternRoll < 0.7) {
              // Парные (низкие или высокие)
              const isHigh = Math.random() > 0.5;
              const height = isHigh ? 70 : 35;
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height, width: 30 },
                { x: CANVAS_WIDTH + 70, height, width: 30 }
              );
            } else {
              // Комбо: высокий + низкий
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height: 70, width: 30 },
                { x: CANVAS_WIDTH + 150, height: 35, width: 30 }
              );
            }
          } else {
            // Уровень 3+: Все паттерны
            if (patternRoll < 0.15) {
              // Одиночное
              const isHigh = Math.random() > 0.5;
              obstaclesRef.current.push({
                x: CANVAS_WIDTH,
                height: isHigh ? 70 : 35,
                width: 30,
              });
            } else if (patternRoll < 0.35) {
              // Парные низкие
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height: 35, width: 30 },
                { x: CANVAS_WIDTH + 70, height: 35, width: 30 }
              );
            } else if (patternRoll < 0.55) {
              // Два высоких на расстоянии (для тройного прыжка)
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height: 70, width: 30 },
                { x: CANVAS_WIDTH + 200, height: 70, width: 30 }
              );
            } else if (patternRoll < 0.70) {
              // Тройные низкие
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height: 35, width: 30 },
                { x: CANVAS_WIDTH + 70, height: 35, width: 30 },
                { x: CANVAS_WIDTH + 140, height: 35, width: 30 }
              );
            } else if (patternRoll < 0.85) {
              // Пирамида: низкий-высокий-низкий
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height: 35, width: 30 },
                { x: CANVAS_WIDTH + 100, height: 70, width: 30 },
                { x: CANVAS_WIDTH + 200, height: 35, width: 30 }
              );
            } else {
              // Комбо: высокий + низкий
              obstaclesRef.current.push(
                { x: CANVAS_WIDTH, height: 70, width: 30 },
                { x: CANVAS_WIDTH + 150, height: 35, width: 30 }
              );
            }
          }
          
          lastObstacleTimeRef.current = now;
        }
      }

      // Спаун звездочек
      if (now - lastStarTimeRef.current > 10000) {
        starsRef.current.push({
          x: CANVAS_WIDTH,
          y: CANVAS_HEIGHT - GROUND_HEIGHT - 60 - Math.random() * 40, // опущено ниже для доступности
        });
        lastStarTimeRef.current = now;
      }

      // Обновляем и рисуем препятствия
      obstaclesRef.current = obstaclesRef.current.filter(obs => {
        obs.x -= obstacleSpeed;

        if (obs.x < -obs.width) return false;

        // Рисуем препятствие с градиентом
        const isHighObstacle = obs.height > 60;
        const obsY = CANVAS_HEIGHT - GROUND_HEIGHT - obs.height;
        
        // Градиент
        const obsGradient = ctx.createLinearGradient(obs.x, obsY, obs.x, obsY + obs.height);
        if (isHighObstacle) {
          obsGradient.addColorStop(0, COLORS.obstacleHigh);
          obsGradient.addColorStop(1, '#FF4520'); // темнее
        } else {
          obsGradient.addColorStop(0, COLORS.obstacleLow);
          obsGradient.addColorStop(1, '#CC2952'); // темнее
        }
        
        ctx.fillStyle = obsGradient;
        ctx.shadowColor = COLORS.obstacleGlow;
        ctx.shadowBlur = 15;
        ctx.fillRect(obs.x, obsY, obs.width, obs.height);
        ctx.shadowBlur = 0;
        
        // Обводка
        ctx.strokeStyle = isHighObstacle ? '#CC5528' : '#CC1F44';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obsY, obs.width, obs.height);

        // Проверка столкновения
        const playerX = PLAYER_X_POSITION;
        const playerBottom = playerYRef.current + PLAYER_SIZE;
        const playerRight = playerX + PLAYER_SIZE;
        const obsTop = CANVAS_HEIGHT - GROUND_HEIGHT - obs.height;
        const obsBottom = CANVAS_HEIGHT - GROUND_HEIGHT;

        // Уменьшаем hitbox препятствий для более щедрой коллизии
        const hitboxMargin = 8; // отступ для уменьшения hitbox
        if (
          now > invincibleUntilRef.current &&
          playerRight > obs.x + hitboxMargin &&
          playerX < obs.x + obs.width - hitboxMargin &&
          playerBottom > obsTop + hitboxMargin &&
          playerYRef.current < obsBottom - hitboxMargin
        ) {
          // Столкновение!
          createParticles(playerX + PLAYER_SIZE / 2, playerYRef.current + PLAYER_SIZE / 2, COLORS.player, 10); // уменьшено
          
          const newLives = lives - 1;
          setLives(newLives);
          invincibleUntilRef.current = now + 1000;

          // Отключаем все активные способности при получении урона
          if (hasMagnet) {
            setHasMagnet(false);
            magnetEndTimeRef.current = 0;
          }
          if (hasTripleJump) {
            setHasTripleJump(false);
            tripleJumpEndTimeRef.current = 0;
          }

          // Проверяем щит
          if (hasShield) {
            // Щит защитил - сбрасываем его
            setHasShield(false);
            consecutiveStarsRef.current = 0;
            createParticles(PLAYER_X_POSITION, playerYRef.current, '#00ffff', 30);
            // Восстанавливаем жизнь
            setLives(lives);
          } else if (newLives <= 0) {
            setGameState('gameOver');
            
            // Обновляем Career Score
            const newCareerScore = careerScore + score;
            setCareerScore(newCareerScore);
            localStorage.setItem('lineJumpCareerScore', newCareerScore.toString());
            
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('lineJumpHighScore', score.toString());
            }
          }
        }

        return true;
      });

      // Обновляем и рисуем звездочки
      starsRef.current = starsRef.current.filter(star => {
        star.x -= obstacleSpeed;

        if (star.x < -20) return false;

        // Рисуем звездочку
        ctx.fillStyle = COLORS.star;
        ctx.shadowColor = COLORS.starGlow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const outerRadius = 22; // увеличено для лучшей видимости
          const innerRadius = 10;
          
          if (i === 0) {
            ctx.moveTo(star.x + Math.cos(angle) * outerRadius, star.y + Math.sin(angle) * outerRadius);
          } else {
            ctx.lineTo(star.x + Math.cos(angle) * outerRadius, star.y + Math.sin(angle) * outerRadius);
          }
          
          const innerAngle = angle + Math.PI / 5;
          ctx.lineTo(
            star.x + Math.cos(innerAngle) * innerRadius,
            star.y + Math.sin(innerAngle) * innerRadius
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Проверка сбора
        const playerX = PLAYER_X_POSITION;
        const distance = Math.hypot(
          playerX + PLAYER_SIZE / 2 - star.x,
          playerYRef.current + PLAYER_SIZE / 2 - star.y
        );

        // Магнит - увеличенный радиус сбора
        const isMagnetActive = hasMagnet && Date.now() < magnetEndTimeRef.current;
        const collectRadius = isMagnetActive ? 150 : 75; // Магнит притягивает с большого расстояния
        
        if (distance < (PLAYER_SIZE + collectRadius) / 2) {
          createParticles(star.x, star.y, COLORS.star, 12);
          const newLives = Math.min(lives + 1, MAX_LIVES);
          setLives(newLives);
          
          // Счетчик последовательных звездочек для щита
          consecutiveStarsRef.current += 1;
          if (consecutiveStarsRef.current >= 3 && !hasShield) {
            setHasShield(true);
            createParticles(PLAYER_X_POSITION, playerYRef.current, '#00ffff', 20);
          }
          
          return false;
        }

        return true;
      });

      // Обновляем и рисуем частицы
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life -= 0.02;

        if (p.life <= 0) return false;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.globalAlpha = 1;

        return true;
      });

      // Рисуем персонажа-слайма
      const playerX = PLAYER_X_POSITION;
      const isInvincible = now < invincibleUntilRef.current;
      const isOnGround = playerYRef.current === groundY;
      
      // Визуальные эффекты способностей
      const centerX = playerX + PLAYER_SIZE / 2;
      const centerY = playerYRef.current + PLAYER_SIZE / 2;
      
      // Щит - мерцающий барьер
      if (hasShield) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5 + Math.sin(distanceRef.current * 0.3) * 0.3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, PLAYER_SIZE * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Магнит - золотое свечение
      const isMagnetActive = hasMagnet && Date.now() < magnetEndTimeRef.current;
      if (isMagnetActive) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, PLAYER_SIZE * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // Золотые искры
        for (let i = 0; i < 3; i++) {
          const angle = (distanceRef.current * 0.1 + i * Math.PI * 2 / 3);
          const sparkX = centerX + Math.cos(angle) * PLAYER_SIZE * 0.8;
          const sparkY = centerY + Math.sin(angle) * PLAYER_SIZE * 0.8;
          ctx.fillStyle = '#ffd700';
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      
      // Тройной прыжок - радужный след
      if (hasTripleJump && !isOnGround) {
        const trailGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, PLAYER_SIZE);
        trailGradient.addColorStop(0, 'rgba(255, 0, 255, 0.3)');
        trailGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (!isInvincible || Math.floor(now / 100) % 2 === 0) {
        // Анимация сжатия/растяжения
        const squashStretch = isOnGround 
          ? Math.sin(distanceRef.current * 0.2) * 0.1 // Легкое колебание при беге
          : -playerVelocityYRef.current * 0.02; // Сжатие при прыжке
        
        const bodyWidth = PLAYER_SIZE / 2 * (1 - squashStretch * 0.5);
        const bodyHeight = PLAYER_SIZE / 2 * (1 + squashStretch);
        
        // Ножки (маленькие капли)
        ctx.fillStyle = COLORS.playerLegs;
        ctx.globalAlpha = 0.8;
        
        if (isOnGround) {
          const legCycle = Math.floor(distanceRef.current / 10) % 2;
          const legOffset = legCycle === 0 ? 3 : -3;
          
          // Левая ножка
          ctx.beginPath();
          ctx.ellipse(
            playerX + PLAYER_SIZE / 2 - 8,
            playerYRef.current + PLAYER_SIZE - 2 + legOffset,
            6, 10, 0, 0, Math.PI * 2
          );
          ctx.fill();
          
          // Правая ножка
          ctx.beginPath();
          ctx.ellipse(
            playerX + PLAYER_SIZE / 2 + 8,
            playerYRef.current + PLAYER_SIZE - 2 - legOffset,
            6, 10, 0, 0, Math.PI * 2
          );
          ctx.fill();
        } else {
          // В прыжке: маленькие ножки
          ctx.beginPath();
          ctx.ellipse(
            playerX + PLAYER_SIZE / 2 - 7,
            playerYRef.current + PLAYER_SIZE - 8,
            5, 8, 0, 0, Math.PI * 2
          );
          ctx.fill();
          
          ctx.beginPath();
          ctx.ellipse(
            playerX + PLAYER_SIZE / 2 + 7,
            playerYRef.current + PLAYER_SIZE - 8,
            5, 8, 0, 0, Math.PI * 2
          );
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Тело слайма (желеобразная форма)
        const centerX = playerX + PLAYER_SIZE / 2;
        const centerY = playerYRef.current + PLAYER_SIZE / 2;
        
        // Основное тело (эллипс)
        ctx.fillStyle = COLORS.player;
        ctx.shadowColor = COLORS.playerGlow;
        ctx.shadowBlur = 25;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          bodyWidth,
          bodyHeight,
          0, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        
        // Блики (светлые пятна)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX - 10, centerY - 8, 8, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX + 8, centerY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Капелька на голове
        ctx.fillStyle = COLORS.player;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - bodyHeight - 5);
        ctx.quadraticCurveTo(
          centerX - 5, centerY - bodyHeight - 10,
          centerX, centerY - bodyHeight - 12
        );
        ctx.quadraticCurveTo(
          centerX + 5, centerY - bodyHeight - 10,
          centerX, centerY - bodyHeight - 5
        );
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Глаза (большие блестящие)
        // Белки
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(centerX - 10, centerY - 3, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 10, centerY - 3, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Зрачки
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(centerX - 10, centerY - 1, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 10, centerY - 1, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Блики в глазах
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX - 12, centerY - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 8, centerY - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Улыбка
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 5, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // UI - Счетчик очков с контрастным фоном
      const scoreText = `${score}`;
      ctx.font = 'bold 32px Arial';
      const scoreWidth = ctx.measureText(scoreText).width;
      
      // Фон для счетчика
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(10, 20, scoreWidth + 20, 40);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 20, scoreWidth + 20, 40);
      
      // Текст счетчика
      ctx.fillStyle = '#00ffff';
      ctx.fillText(scoreText, 20, 50);

      // Жизни
      for (let i = 0; i < MAX_LIVES; i++) {
        ctx.fillStyle = i < lives ? '#ff3366' : '#2a2f4a';
        ctx.beginPath();
        const heartX = CANVAS_WIDTH - 40 - i * 35;
        const heartY = 30;
        ctx.arc(heartX - 5, heartY, 8, 0, Math.PI * 2);
        ctx.arc(heartX + 5, heartY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(heartX - 12, heartY);
        ctx.lineTo(heartX, heartY + 12);
        ctx.lineTo(heartX + 12, heartY);
        ctx.fill();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [gameState, lives, score, highScore]);

  return (
    <div 
      className="min-h-screen flex items-start justify-center bg-gradient-to-b from-gray-900 to-gray-800"
      onTouchStart={(e) => {
        if (gameState === 'playing') {
          e.preventDefault();
          handleTap();
        }
      }}
      onClick={() => {
        if (gameState === 'playing') {
          handleTap();
        }
      }}
      style={{ touchAction: 'none' }}
    >
      <div className="relative flex flex-col">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-cyan-500 rounded-lg shadow-2xl cursor-pointer"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTap();
          }}
          onClick={handleTap}
          style={{ touchAction: 'none' }}
        />
        
        {/* Визуальная область для тапов */}
        {gameState === 'playing' && (
          <div className="w-full h-[10vh] bg-gradient-to-t from-cyan-500/30 to-transparent border-t-2 border-cyan-500/50 flex items-center justify-center">
            <div className="text-cyan-300/60 text-sm md:text-base font-semibold animate-pulse">
              👆 TAP TO JUMP
            </div>
          </div>
        )}

        {/* Меню */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 mb-2 md:mb-4">Line Jump</h1>
            {careerScore > 0 && (
              <p className="text-lg md:text-2xl text-yellow-400 mb-2">
                🏆 Карьерный счет: {careerScore.toLocaleString()}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  resetGame();
                  setGameState('playing');
                }}
                className="px-6 py-3 md:px-12 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-base md:text-2xl font-bold rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
              >
                Играть
              </button>
              <button
                onClick={() => setGameState('levelSelect')}
                className="px-6 py-3 md:px-12 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base md:text-xl font-bold rounded-full hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg"
              >
                Выбрать уровень
              </button>
            </div>
          </div>
        )}

        {/* Пауза */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <h2 className="text-3xl md:text-5xl font-bold text-cyan-400 mb-4">Пауза</h2>
            <div className="flex gap-2 px-4">
              <button
                onClick={() => setGameState('playing')}
                className="px-4 py-2 md:px-8 md:py-3 bg-green-500 text-white text-sm md:text-xl font-bold rounded-full hover:bg-green-400 transition-all"
              >
                Продолжить
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-4 py-2 md:px-8 md:py-3 bg-red-500 text-white text-sm md:text-xl font-bold rounded-full hover:bg-red-400 transition-all"
              >
                Выход
              </button>
            </div>
          </div>
        )}

        {/* Выбор уровня */}
        {gameState === 'levelSelect' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg overflow-y-auto p-4 md:p-8">
            <h2 className="text-2xl md:text-4xl font-bold text-cyan-400 mb-4 md:mb-8">Выберите уровень</h2>
            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
              {LEVELS.map(level => {
                const isUnlocked = isLevelUnlocked(level.id);
                const isCurrent = level.id === currentLevelId;
                return (
                  <button
                    key={level.id}
                    onClick={() => {
                      if (isUnlocked) {
                        setCurrentLevelId(level.id);
                        setCurrentLevel(level.id);
                        resetGame();
                        setGameState('playing');
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`p-3 md:p-6 rounded-xl font-bold text-left transition-all ${
                      !isUnlocked
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : isCurrent
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg md:text-2xl">{level.name}</span>
                      {!isUnlocked && <span className="text-xl md:text-3xl">🔒</span>}
                      {isCurrent && <span className="text-sm bg-white/20 px-2 py-1 rounded">Текущий</span>}
                    </div>
                    <p className="text-xs md:text-sm opacity-80 mb-2">{level.description}</p>
                    <div className="flex gap-2 md:gap-4 text-xs opacity-70">
                      <span>🎯 Цель: {level.targetScore}</span>
                      <span>⚡ Скорость: {level.obstacleSpeed}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setGameState('menu')}
              className="mt-4 md:mt-8 px-4 py-2 md:px-8 md:py-3 bg-gray-600 text-white text-sm md:text-lg font-bold rounded-full hover:bg-gray-500 transition-all"
            >
              ← Назад
            </button>
          </div>
        )}

        {/* Завершение уровня */}
        {gameState === 'levelComplete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <h2 className="text-3xl md:text-5xl font-bold text-green-400 mb-2">✅ Уровень завершен!</h2>
            <p className="text-xl md:text-3xl text-white mb-1">Этот забег: +{score}</p>
            <p className="text-lg md:text-2xl text-yellow-400 mb-1">🏆 Карьерный счет: {careerScore.toLocaleString()}</p>
            <p className="text-base md:text-xl text-gray-400 mb-4">Рекорд уровня: {highScore}</p>
            <div className="flex flex-wrap gap-2 justify-center px-4">
              {currentLevelId < LEVELS.length && (
                <button
                  onClick={() => {
                    // Career Score уже сохранен при завершении уровня
                    setCurrentLevelId(currentLevelId + 1);
                    setCurrentLevel(currentLevelId + 1);
                    resetGame(true); // Сохраняем score между уровнями
                    setGameState('playing');
                  }}
                  className="px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm md:text-xl font-bold rounded-full hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg"
                >
                  Следующий уровень →
                </button>
              )}
              <button
                onClick={() => {
                  resetGame();
                  setGameState('playing');
                }}
                className="px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm md:text-xl font-bold rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
              >
                Повторить
              </button>
              <button
                onClick={() => setGameState('levelSelect')}
                className="px-4 py-2 md:px-8 md:py-4 bg-gray-600 text-white text-sm md:text-xl font-bold rounded-full hover:bg-gray-500 transition-all"
              >
                Уровни
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <h2 className="text-3xl md:text-5xl font-bold text-red-400 mb-2">Game Over</h2>
            <p className="text-xl md:text-3xl text-white mb-1">Этот забег: +{score}</p>
            <p className="text-lg md:text-2xl text-yellow-400 mb-1">🏆 Карьерный счет: {careerScore.toLocaleString()}</p>
            <p className="text-base md:text-xl text-gray-400 mb-4">Рекорд уровня: {highScore}</p>
            <button
              onClick={() => {
                resetGame();
                setGameState('playing');
              }}
              className="px-6 py-3 md:px-12 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-base md:text-2xl font-bold rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
            >
              Играть снова
            </button>
          </div>
        )}

        {/* Кнопка паузы */}
        {gameState === 'playing' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setGameState('paused');
            }}
            className="absolute top-2 left-2 md:left-4 px-4 py-1 md:px-6 md:py-2 bg-cyan-500/20 text-cyan-400 text-sm md:text-base font-bold rounded-full hover:bg-cyan-500/30 transition-all z-10"
          >
            ⏸️ Пауза
          </button>
        )}

        {/* Компактные иконки способностей справа */}
        {gameState === 'playing' && (
          <div className="absolute top-14 right-2 md:right-4 flex flex-col gap-2">
            {/* Тройной прыжок */}
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl ${
              hasTripleJump 
                ? 'bg-purple-500/90 shadow-lg shadow-purple-500/50' 
                : 'bg-gray-800/40 border border-purple-500/30'
            }`}>
              🚀
            </div>
            
            {/* Магнит */}
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl ${
              hasMagnet && Date.now() < magnetEndTimeRef.current
                ? 'bg-yellow-500/90 shadow-lg shadow-yellow-500/50' 
                : 'bg-gray-800/40 border border-yellow-500/30'
            }`}>
              ⭐
            </div>
            
            {/* Щит */}
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl ${
              hasShield
                ? 'bg-cyan-500/90 shadow-lg shadow-cyan-500/50' 
                : 'bg-gray-800/40 border border-cyan-500/30'
            }`}>
              🛡️
            </div>
          </div>
        )}
        
        {/* Подсказка внизу - УДАЛЕНА */}
        
        {/* Индикатор готовности двойного тапа */}
        {gameState === 'playing' && showDoubleTapIndicator && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="text-4xl md:text-6xl font-bold text-yellow-400 animate-pulse drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
              ↑↑
            </div>
            <div className="text-base md:text-xl text-yellow-300 text-center mt-1 md:mt-2 drop-shadow-lg">
              Тап еще раз!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
