import React, { useState, useEffect, useRef, useCallback } from "react";
import useSound from "use-sound";
import hitSound from "../assets/hit.mp3";
import blockSound from "../assets/block.mp3";
import moveSound from "../assets/move.mp3";

interface Player {
  x: number;
  y: number;
  health: number;
  stamina: number;
  blocking: boolean;
  lastHit: number;
  velocity: { x: number; y: number };
}

interface GameState {
  player1: Player;
  player2: Player;
  screenShake: { x: number; y: number };
  winner: string | null;
}

const ARENA_WIDTH = 400;
const ARENA_HEIGHT = 400;
const PLAYER_RADIUS = 16;
const MAX_SPEED = 250;
const ACCELERATION = 1000;
const FRICTION = 0.9;

const ShapeFighterGame: React.FC = () => {
  const [playHit] = useSound(hitSound);
  const [playBlock] = useSound(blockSound);
  const [playMove, { sound: moveAudio }] = useSound(moveSound, { loop: true });

  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const isMovingRef = useRef<boolean>(false);

  useEffect(() => {
    if (moveAudio) {
      moveSoundRef.current = moveAudio;
      if (moveSoundRef.current) {
        moveSoundRef.current.volume = 0;
      }
    }
  }, [moveAudio]);

  const updateMoveSound = useCallback(
    (isMoving: boolean) => {
      if (!moveSoundRef.current) return;

      if (isMoving && !isMovingRef.current) {
        playMove();
        moveSoundRef.current.volume = 0.5;
        isMovingRef.current = true;
      } else if (!isMoving && isMovingRef.current) {
        moveSoundRef.current.volume = 0;
        moveSoundRef.current.pause();
        isMovingRef.current = false;
      }
    },
    [playMove]
  );

  const [gameState, setGameState] = useState<GameState>({
    player1: {
      x: 50,
      y: 200,
      health: 100,
      stamina: 100,
      blocking: false,
      lastHit: 0,
      velocity: { x: 0, y: 0 },
    },
    player2: {
      x: 350,
      y: 200,
      health: 100,
      stamina: 100,
      blocking: false,
      lastHit: 0,
      velocity: { x: 0, y: 0 },
    },
    screenShake: { x: 0, y: 0 },
    winner: null,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const updatePlayerPosition = (
    player: Player,
    deltaTime: number,
    keys: string[]
  ): Player => {
    let { x, y, velocity, stamina, blocking } = player;
    const acceleration = blocking ? ACCELERATION * 0.5 : ACCELERATION;

    // Apply acceleration based on input
    let dx = 0,
      dy = 0;
    if (keysPressed.current[keys[0]]) dx -= 1;
    if (keysPressed.current[keys[1]]) dx += 1;
    if (keysPressed.current[keys[2]]) dy -= 1;
    if (keysPressed.current[keys[3]]) dy += 1;

    if (!blocking) {
      velocity.x += dx * acceleration * deltaTime;
      velocity.y += dy * acceleration * deltaTime;
    }

    // Apply friction
    velocity.x *= FRICTION;
    velocity.y *= FRICTION;

    // Limit speed
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    if (speed > MAX_SPEED) {
      velocity.x = (velocity.x / speed) * MAX_SPEED;
      velocity.y = (velocity.y / speed) * MAX_SPEED;
    }

    // Update position
    x += velocity.x * deltaTime;
    y += velocity.y * deltaTime;

    // Arena boundaries
    x = Math.max(PLAYER_RADIUS, Math.min(ARENA_WIDTH - PLAYER_RADIUS, x));
    y = Math.max(PLAYER_RADIUS, Math.min(ARENA_HEIGHT - PLAYER_RADIUS, y));

    // Regenerate stamina
    stamina = Math.min(100, stamina + 15 * deltaTime);

    return { ...player, x, y, velocity, stamina };
  };

  const updateGameState = useCallback(
    (deltaTime: number) => {
      setGameState((prevState) => {
        if (prevState.winner) return prevState;

        const newState = { ...prevState };
        let isAnyPlayerMoving = false;

        newState.player1 = updatePlayerPosition(newState.player1, deltaTime, [
          "a",
          "d",
          "w",
          "s",
        ]);
        newState.player2 = updatePlayerPosition(newState.player2, deltaTime, [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ]);

        isAnyPlayerMoving =
          newState.player1.velocity.x !== 0 ||
          newState.player1.velocity.y !== 0 ||
          newState.player2.velocity.x !== 0 ||
          newState.player2.velocity.y !== 0;

        updateMoveSound(isAnyPlayerMoving);

        // Decrease lastHit timer
        newState.player1.lastHit = Math.max(
          0,
          newState.player1.lastHit - deltaTime
        );
        newState.player2.lastHit = Math.max(
          0,
          newState.player2.lastHit - deltaTime
        );

        // Apply screen shake decay
        newState.screenShake = {
          x: newState.screenShake.x * 0.9,
          y: newState.screenShake.y * 0.9,
        };

        return newState;
      });
    },
    [updateMoveSound]
  );

  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      updateGameState(deltaTime);
      requestAnimationFrame(animate);
    };
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [updateGameState]);

  const attack = useCallback(
    (attacker: "player1" | "player2") => {
      setGameState((prevState) => {
        if (prevState.winner || prevState[attacker].stamina < 20)
          return prevState;

        const defender = attacker === "player1" ? "player2" : "player1";
        const distance = Math.hypot(
          prevState[attacker].x - prevState[defender].x,
          prevState[attacker].y - prevState[defender].y
        );
        if (distance > 70) return prevState;

        const newState = { ...prevState };
        const damage = 15;
        newState[attacker].stamina -= 20;

        if (newState[defender].blocking) {
          playBlock();
          newState[defender].stamina -= 10;
          newState.screenShake = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8,
          };
          newState[defender].lastHit = 0.25;
        } else {
          playHit();
          newState[defender].health = Math.max(
            0,
            newState[defender].health - damage
          );
          newState[defender].lastHit = 0.5;
          newState.screenShake = {
            x: (Math.random() - 0.5) * 15,
            y: (Math.random() - 0.5) * 15,
          };

          // Apply knockback
          const knockbackForce = 500;
          const angle = Math.atan2(
            newState[defender].y - newState[attacker].y,
            newState[defender].x - newState[attacker].x
          );
          newState[defender].velocity.x += Math.cos(angle) * knockbackForce;
          newState[defender].velocity.y += Math.sin(angle) * knockbackForce;

          if (newState[defender].health === 0) {
            newState.winner = attacker === "player1" ? "Player 1" : "Player 2";
          }
        }
        return newState;
      });
    },
    [playHit, playBlock]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      switch (e.key) {
        case " ":
          attack("player1");
          break;
        case "Enter":
          attack("player2");
          break;
        case "f":
          setGameState((prev) => ({
            ...prev,
            player1: { ...prev.player1, blocking: true },
          }));
          break;
        case "/":
          setGameState((prev) => ({
            ...prev,
            player2: { ...prev.player2, blocking: true },
          }));
          break;
      }
    },
    [attack]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current[e.key] = false;
    if (e.key === "f" || e.key === "/") {
      setGameState((prev) => ({
        ...prev,
        player1: { ...prev.player1, blocking: e.key !== "f" },
        player2: { ...prev.player2, blocking: e.key !== "/" },
      }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="relative w-full max-w-2xl aspect-video bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${gameState.screenShake.x}px, ${gameState.screenShake.y}px)`,
        }}
      >
        {["player1", "player2"].map((playerKey) => {
          const player = playerKey as "player1" | "player2";
          const { x, y, health, stamina, blocking, lastHit } =
            gameState[player];
          return (
            <div
              key={playerKey}
              className={`absolute w-8 h-8 ${
                player === "player1" ? "bg-blue-500" : "bg-red-500"
              } rounded-full transition-all duration-100 ${
                blocking ? "scale-90 opacity-75" : ""
              } ${lastHit > 0 ? "animate-pulse" : ""}`}
              style={{
                left: `${x - PLAYER_RADIUS}px`,
                top: `${y - PLAYER_RADIUS}px`,
                transform: `scale(${1 + lastHit})`,
                boxShadow: `0 0 ${lastHit * 20}px ${
                  lastHit * 10
                }px rgba(255, 255, 255, 0.5)`,
              }}
            >
              <div className="absolute -top-6 left-0 w-full">
                <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${health}%` }}
                  ></div>
                </div>
                <div className="bg-gray-700 h-1 rounded-full mt-1">
                  <div
                    className="bg-yellow-500 h-full"
                    style={{ width: `${stamina}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {gameState.winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-4xl font-bold">
            {gameState.winner} wins!
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeFighterGame;
