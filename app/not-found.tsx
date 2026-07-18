"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("zotion_runner_high_score") || "0", 10);
    }
    return 0;
  });

  // Game configuration & variables
  const gameRef = useRef({
    score: 0,
    highScore: 0,
    speed: 6,
    player: {
      x: 80,
      y: 0,
      width: 32,
      height: 48,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      legCycle: 0,
    },
    obstacles: [] as Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      type: "brick" | "bird";
      passed: boolean;
      color: string;
      wingUp: boolean;
    }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
    }>,
    background: {
      mountains: [] as Array<{ x: number; w: number; h: number; color: string }>,
      trees: [] as Array<{ x: number; h: number; color: string }>,
    },
    spawnTimer: 0,
    studOffset: 0,
    bgOffset: 0,
  });

  // Initialize scrolling background items
  useEffect(() => {
    const bg = gameRef.current.background;
    // Preset mountains
    bg.mountains = [
      { x: 0, w: 200, h: 120, color: "#1e293b" },
      { x: 180, w: 300, h: 160, color: "#0f172a" },
      { x: 440, w: 220, h: 100, color: "#1e293b" },
      { x: 620, w: 280, h: 140, color: "#0f172a" },
      { x: 850, w: 200, h: 110, color: "#1e293b" },
    ];
    // Preset block trees
    bg.trees = [
      { x: 50, h: 70, color: "#166534" },
      { x: 250, h: 90, color: "#14532d" },
      { x: 400, h: 65, color: "#166534" },
      { x: 580, h: 80, color: "#14532d" },
      { x: 750, h: 70, color: "#166534" },
    ];
  }, []);

  // Sync highscore
  useEffect(() => {
    gameRef.current.highScore = highScore;
  }, [highScore]);

  // Restart handler
  const handleStartGame = () => {
    setIsGameOver(false);
    setIsPlaying(true);
    setScore(0);

    const game = gameRef.current;
    game.score = 0;
    game.speed = 6;
    game.obstacles = [];
    game.particles = [];
    game.player.y = 0;
    game.player.velocityY = 0;
    game.player.isJumping = false;
    game.player.isDucking = false;
  };

  // Keyboard control handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      const player = gameRef.current.player;

      if ((e.key === " " || e.key === "ArrowUp") && !player.isJumping && !player.isDucking) {
        player.velocityY = -12;
        player.isJumping = true;
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        player.isDucking = true;
        player.height = 28; // Compress size
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      const player = gameRef.current.player;

      if (e.key === "ArrowDown") {
        player.isDucking = false;
        player.height = 48; // Restore size
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, isGameOver]);

  // Touch/Mouse jump trigger
  const handleCanvasClick = () => {
    if (!isPlaying) {
      handleStartGame();
      return;
    }
    if (isGameOver) {
      handleStartGame();
      return;
    }
    const player = gameRef.current.player;
    if (!player.isJumping && !player.isDucking) {
      player.velocityY = -12;
      player.isJumping = true;
    }
  };

  // Main Canvas game loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = gameRef.current;
    const groundY = 240;

    const loop = () => {
      // 1. Clear Screen
      ctx.fillStyle = "#f8fafc"; // Light bg
      if (document.documentElement.classList.contains("dark")) {
        ctx.fillStyle = "#09090b"; // Dark bg
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render Parallax Mountains
      game.background.mountains.forEach((m) => {
        if (isPlaying && !isGameOver) {
          m.x -= game.speed * 0.15; // Slow scroll
        }
        if (m.x + m.w < 0) {
          m.x = canvas.width + Math.random() * 100;
        }

        // Draw blocky Lego-style mountain
        ctx.fillStyle = m.color;
        ctx.beginPath();
        // Stepped block look
        const steps = 6;
        const stepW = m.w / steps;
        const stepH = m.h / steps;
        for (let i = 0; i <= steps; i++) {
          const stepX = m.x + i * stepW;
          const currH = i <= steps / 2 ? i * 2 * stepH : (steps - i) * 2 * stepH;
          ctx.rect(stepX - stepW, groundY - currH, stepW + 1, currH);
        }
        ctx.fill();
      });

      // 3. Render Parallax Trees
      game.background.trees.forEach((t) => {
        if (isPlaying && !isGameOver) {
          t.x -= game.speed * 0.35; // Medium scroll
        }
        if (t.x + 40 < 0) {
          t.x = canvas.width + Math.random() * 200;
        }

        // Draw blocky Lego style pine trees
        ctx.fillStyle = t.color;
        ctx.beginPath();
        // Tree trunk
        ctx.fillStyle = "#78350f"; // Brown
        ctx.fillRect(t.x + 14, groundY - 20, 8, 20);

        // Pine layers
        ctx.fillStyle = t.color;
        ctx.fillRect(t.x + 8, groundY - 40, 20, 20);
        ctx.fillRect(t.x + 12, groundY - 60, 12, 20);
        ctx.fillRect(t.x + 15, groundY - t.h, 6, t.h - 60);
      });

      // 4. Update & Render Ground
      const groundHeight = 60;
      ctx.fillStyle = "#e2e8f0"; // light grey
      if (document.documentElement.classList.contains("dark")) {
        ctx.fillStyle = "#27272a"; // dark grey
      }
      ctx.fillRect(0, groundY, canvas.width, groundHeight);

      // Draw Lego Studs on the ground
      ctx.fillStyle = "#cbd5e1";
      if (document.documentElement.classList.contains("dark")) {
        ctx.fillStyle = "#3f3f46";
      }

      if (isPlaying && !isGameOver) {
        game.studOffset = (game.studOffset - game.speed) % 24;
      }

      for (let x = game.studOffset; x < canvas.width; x += 24) {
        // Draw standard small block studs
        ctx.beginPath();
        ctx.arc(x + 12, groundY + 4, 4, 0, Math.PI, true);
        ctx.fill();
      }

      // 5. Update & Draw Obstacles
      if (isPlaying && !isGameOver) {
        game.spawnTimer++;
        if (game.spawnTimer > Math.max(50, 100 - game.score * 0.5)) {
          game.spawnTimer = 0;
          const isBird = Math.random() > 0.65 && game.score > 10;
          if (isBird) {
            // Flying block bird
            game.obstacles.push({
              x: canvas.width,
              y: groundY - 55 - Math.random() * 30,
              width: 30,
              height: 18,
              type: "bird",
              passed: false,
              color: "#fbbf24", // Yellow lego bird
              wingUp: true,
            });
          } else {
            // Standard red/blue brick obstacle
            const sizeMult = Math.random() > 0.5 ? 2.5 : 1.5;
            game.obstacles.push({
              x: canvas.width,
              y: groundY - 24,
              width: 16 * sizeMult,
              height: 24,
              type: "brick",
              passed: false,
              color: Math.random() > 0.5 ? "#ef4444" : "#3b82f6", // lego red vs lego blue
              wingUp: false,
            });
          }
        }
      }

      game.obstacles.forEach((obs, index) => {
        if (isPlaying && !isGameOver) {
          obs.x -= game.speed;
        }

        // Draw obstacle
        if (obs.type === "brick") {
          ctx.fillStyle = obs.color;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Draw brick studs on obstacle
          ctx.fillStyle = obs.color === "#ef4444" ? "#b91c1c" : "#1d4ed8";
          const studStep = 12;
          for (let sx = obs.x + 4; sx < obs.x + obs.width; sx += studStep) {
            ctx.fillRect(sx, obs.y - 3, 5, 3);
          }
        } else {
          // Bird
          ctx.fillStyle = obs.color;
          // Block body
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          // Head / Beak
          ctx.fillStyle = "#ea580c";
          ctx.fillRect(obs.x - 6, obs.y + 4, 6, 6);

          // Wings flapping animation
          ctx.fillStyle = "#d97706";
          if (isPlaying && !isGameOver && Math.floor(Date.now() / 150) % 2 === 0) {
            obs.wingUp = !obs.wingUp;
          }
          if (obs.wingUp) {
            ctx.fillRect(obs.x + 8, obs.y - 10, 8, 10);
          } else {
            ctx.fillRect(obs.x + 8, obs.y + obs.height, 8, 10);
          }
        }

        // Collision Check
        const player = game.player;
        const py = groundY - player.height - player.y;

        // Bounding boxes
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          py < obs.y + obs.height &&
          py + player.height > obs.y
        ) {
          // HIT! TRIGGER GAME OVER
          setIsGameOver(true);
          setIsPlaying(false);

          // Trigger brick explosion particles
          for (let i = 0; i < 20; i++) {
            game.particles.push({
              x: player.x + player.width / 2,
              y: py + player.height / 2,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.8) * 8,
              color: obs.type === "brick" ? obs.color : "#fbbf24",
              size: Math.random() * 6 + 4,
              life: 1.0,
            });
          }
        }

        // Score tracking
        if (!obs.passed && obs.x < player.x) {
          obs.passed = true;
          game.score += 1;
          setScore(game.score);
          if (game.score % 10 === 0) {
            game.speed += 1; // Increase speed
          }
          if (game.score > game.highScore) {
            game.highScore = game.score;
            setHighScore(game.score);
            localStorage.setItem("zotion_runner_high_score", game.score.toString());
          }
        }

        // Cleanup passed items
        if (obs.x + obs.width < 0) {
          game.obstacles.splice(index, 1);
        }
      });

      // 6. Update & Render Exploding Lego Particles
      game.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.life -= 0.02;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.life <= 0) {
          game.particles.splice(index, 1);
        }
      });

      // 7. Update & Draw LEGO Minifigure Player
      const player = game.player;
      if (isPlaying && !isGameOver) {
        // Apply gravity
        player.velocityY += 0.6;
        player.y -= player.velocityY;

        // Ground check
        if (player.y <= 0) {
          player.y = 0;
          player.velocityY = 0;
          player.isJumping = false;
        }

        // Alternate legs for run cycles
        player.legCycle = (player.legCycle + game.speed * 0.15) % (Math.PI * 2);
      }

      const py = groundY - player.height - player.y;

      // Draw Minifig Body
      ctx.fillStyle = "#eab308"; // Lego Yellow Head
      ctx.fillRect(player.x + 8, py, 16, 12); // Head block

      // Draw Hair / Cap
      ctx.fillStyle = "#1e293b"; // Dark cap
      ctx.fillRect(player.x + 6, py - 4, 20, 5);

      // Face print details
      ctx.fillStyle = "#000000";
      ctx.fillRect(player.x + 18, py + 3, 2.5, 2.5); // Eye
      ctx.beginPath();
      ctx.arc(player.x + 19, py + 8, 3, 0, Math.PI, false); // Smile
      ctx.stroke();

      // Torso block
      ctx.fillStyle = "#ef4444"; // Red shirt
      ctx.fillRect(player.x + 4, py + 12, 24, 20);

      // Zotion Logo print on Torso
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(player.x + 12, py + 18, 8, 8);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(player.x + 14, py + 20, 4, 4);

      // Legs / Feet
      ctx.fillStyle = "#2563eb"; // Blue legs
      if (player.isJumping) {
        ctx.fillRect(player.x + 4, py + 32, 10, 16);
        ctx.fillRect(player.x + 18, py + 32, 10, 16);
      } else if (player.isDucking) {
        // Compress legs
        ctx.fillRect(player.x + 4, py + 18, 10, 10);
        ctx.fillRect(player.x + 18, py + 18, 10, 10);
      } else {
        // Alternate legs offsets based on run cycle sine waves
        const legOffset = Math.sin(player.legCycle) * 6;
        ctx.fillRect(player.x + 4, py + 32, 10, 16 + legOffset);
        ctx.fillRect(player.x + 18, py + 32, 10, 16 - legOffset);
      }

      // Loop frame
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isGameOver]);

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* 404 Brick shadow Header */}
        <div className="space-y-2">
          <h1 className="text-8xl font-black tracking-wider text-rose-500 select-none uppercase drop-shadow-[0_5px_0_rgba(185,28,28,0.6)]">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight">Brick Page Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            It looks like this link has shattered or was misplaced. While we clean up this mess, try to get a high score in **Zotion Brick Runner**!
          </p>
        </div>

        {/* Game Canvas Container */}
        <div className="relative mx-auto border-4 border-neutral-300 dark:border-neutral-800 rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xl max-w-[800px] w-full">
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            onClick={handleCanvasClick}
            className="w-full h-auto cursor-pointer block"
          />

          {/* Start Menu Overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-neutral-900/60 dark:bg-black/70 flex flex-col items-center justify-center text-white p-6 space-y-4">
              <span className="text-5xl">🧱</span>
              <h3 className="text-2xl font-black uppercase tracking-wider">Zotion Brick Runner</h3>
              <p className="text-xs text-neutral-200 text-center max-w-sm leading-relaxed">
                Jump over red & blue bricks, duck under yellow birds, and test your reaction limits.
              </p>
              <Button size="lg" onClick={handleStartGame} className="flex items-center gap-x-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition">
                <Play className="h-4 w-4 fill-white" /> Start Running
              </Button>
            </div>
          )}

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-red-950/70 dark:bg-black/85 flex flex-col items-center justify-center text-white p-6 space-y-4 animate-fade-in">
              <span className="text-5xl">💥</span>
              <h3 className="text-3xl font-black uppercase tracking-widest text-red-400">Game Over</h3>
              <div className="flex gap-x-8 text-sm">
                <div>
                  <p className="text-neutral-300 text-xs">Score</p>
                  <p className="text-2xl font-bold">{score}</p>
                </div>
                <div>
                  <p className="text-neutral-300 text-xs">High Score</p>
                  <p className="text-2xl font-bold">{highScore}</p>
                </div>
              </div>
              <Button size="lg" onClick={handleStartGame} className="flex items-center gap-x-2 bg-rose-600 hover:bg-rose-700 hover:scale-105 transition">
                <RotateCcw className="h-4 w-4" /> Run Again
              </Button>
            </div>
          )}

          {/* Dynamic Scoreboard HUD */}
          {isPlaying && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xs font-semibold bg-neutral-900/70 text-white px-3 py-1.5 rounded-full select-none">
              <div className="flex items-center gap-x-4">
                <span>Score: <strong className="text-sky-400 text-sm">{score}</strong></span>
                <span>High Score: <strong className="text-emerald-400 text-sm">{highScore}</strong></span>
              </div>
              <div className="text-[10px] text-neutral-300">
                Space/Up = Jump • Down = Duck
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
          <Button variant="outline" size="lg" asChild>
            <Link href="/" className="flex items-center gap-x-2">
              <ArrowLeft className="h-4 w-4" /> Go back home
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
