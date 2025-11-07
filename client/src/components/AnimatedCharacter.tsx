import { useEffect, useRef } from "react";

export default function AnimatedCharacter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const jumpPhaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PLAYER_SIZE = 60;
    const centerX = canvas.width / 2;
    const groundY = canvas.height - 30;

    let isJumping = false;
    let jumpVelocity = 0;
    let playerY = groundY - PLAYER_SIZE;

    const GRAVITY = 0.8;
    const JUMP_POWER = -15;

    // Прыжок каждые 2 секунды
    const jumpInterval = setInterval(() => {
      if (!isJumping) {
        isJumping = true;
        jumpVelocity = JUMP_POWER;
      }
    }, 2000);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Физика прыжка
      if (isJumping) {
        jumpVelocity += GRAVITY;
        playerY += jumpVelocity;

        if (playerY >= groundY - PLAYER_SIZE) {
          playerY = groundY - PLAYER_SIZE;
          jumpVelocity = 0;
          isJumping = false;
        }
      }

      jumpPhaseRef.current += 0.1;
      const isOnGround = !isJumping;

      // Анимация сжатия/растяжения
      const squashStretch = isOnGround
        ? Math.sin(jumpPhaseRef.current) * 0.1
        : -jumpVelocity * 0.02;

      const bodyWidth = (PLAYER_SIZE / 2) * (1 - squashStretch * 0.5);
      const bodyHeight = (PLAYER_SIZE / 2) * (1 + squashStretch);

      const slimeCenterX = centerX;
      const slimeCenterY = playerY + PLAYER_SIZE / 2;

      // Тень
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      const shadowWidth = isJumping ? 30 : 40;
      ctx.ellipse(centerX, groundY + 5, shadowWidth, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ножки (маленькие капли)
      ctx.fillStyle = "#00d9ff";
      ctx.globalAlpha = 0.8;

      if (isOnGround) {
        const legCycle = Math.floor(jumpPhaseRef.current * 2) % 2;
        const legOffset = legCycle === 0 ? 3 : -3;

        // Левая ножка
        ctx.beginPath();
        ctx.ellipse(
          slimeCenterX - 8,
          playerY + PLAYER_SIZE - 2 + legOffset,
          6,
          10,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Правая ножка
        ctx.beginPath();
        ctx.ellipse(
          slimeCenterX + 8,
          playerY + PLAYER_SIZE - 2 - legOffset,
          6,
          10,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        // В прыжке: маленькие ножки
        ctx.beginPath();
        ctx.ellipse(
          slimeCenterX - 7,
          playerY + PLAYER_SIZE - 8,
          5,
          8,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
          slimeCenterX + 7,
          playerY + PLAYER_SIZE - 8,
          5,
          8,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Основное тело слайма (эллипс)
      ctx.fillStyle = "#00d9ff";
      ctx.shadowColor = "rgba(0, 217, 255, 0.5)";
      ctx.shadowBlur = 25;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.ellipse(
        slimeCenterX,
        slimeCenterY,
        bodyWidth,
        bodyHeight,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Блики (светлые пятна)
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.ellipse(
        slimeCenterX - 10,
        slimeCenterY - 8,
        8,
        12,
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(slimeCenterX + 8, slimeCenterY - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Капелька на голове
      ctx.fillStyle = "#00d9ff";
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(slimeCenterX, slimeCenterY - bodyHeight - 5);
      ctx.quadraticCurveTo(
        slimeCenterX - 5,
        slimeCenterY - bodyHeight - 10,
        slimeCenterX,
        slimeCenterY - bodyHeight - 12
      );
      ctx.quadraticCurveTo(
        slimeCenterX + 5,
        slimeCenterY - bodyHeight - 10,
        slimeCenterX,
        slimeCenterY - bodyHeight - 5
      );
      ctx.fill();
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(jumpInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={140}
      className="mx-auto"
    />
  );
}
