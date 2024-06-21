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
}

interface GameState {
  player1: Player;
  player2: Player;
  screenShake: { x: number; y: number };
  winner: string | null;
}

const ShapeFighterGame: React.FC = () => {
  const [playHit] = useSound(hitSound);
  const [playBlock] = useSound(blockSound);
  const [playMove, { sound: moveAudio }] = useSound(moveSound, { loop: true });

  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const isMovingRef = useRef<boolean>(false);

  useEffect(() => {
    if (moveAudio) {
      moveSoundRef.current = moveAudio;
      moveSoundRef.current?.volume ?? (moveSoundRef.current!.volume = 0);
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
    },
    player2: {
      x: 300,
      y: 200,
      health: 100,
      stamina: 100,
      blocking: false,
      lastHit: 0,
    },
    screenShake: { x: 0, y: 0 },
    winner: null,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const updateGameState = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds

        setGameState((prevState) => {
          const newState = { ...prevState };
          let isAnyPlayerMoving = false;

          ["player1", "player2"].forEach((playerKey) => {
            const player = playerKey as "player1" | "player2";
            const playerState = newState[player] as Player;
            let { x, y, stamina, blocking } = playerState;
            const speed = 200; // Units per second
            const movement = speed * deltaTime;

            if (!blocking) {
              let dx = 0,
                dy = 0;

              if (keysPressed.current[player === "player1" ? "a" : "ArrowLeft"])
                dx -= 1;
              if (
                keysPressed.current[player === "player1" ? "d" : "ArrowRight"]
              )
                dx += 1;
              if (keysPressed.current[player === "player1" ? "w" : "ArrowUp"])
                dy -= 1;
              if (keysPressed.current[player === "player1" ? "s" : "ArrowDown"])
                dy += 1;

              if (dx !== 0 || dy !== 0) {
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                x += (dx / magnitude) * movement;
                y += (dy / magnitude) * movement;
                isAnyPlayerMoving = true;
              }
            }

            x = Math.max(0, Math.min(350, x));
            y = Math.max(0, Math.min(350, y));
            stamina = Math.min(100, stamina + 20 * deltaTime);

            newState[player] = {
              ...playerState,
              x,
              y,
              stamina,
              lastHit: Math.max(0, playerState.lastHit - deltaTime),
            };
          });

          updateMoveSound(isAnyPlayerMoving);

          newState.screenShake = {
            x: newState.screenShake.x * 0.9,
            y: newState.screenShake.y * 0.9,
          };

          return newState;
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(updateGameState);
    },
    [updateMoveSound]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGameState);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [updateGameState]);

  const attack = useCallback(
    (attacker: "player1" | "player2") => {
      playHit();
      setGameState((prevState) => {
        if (prevState[attacker].stamina < 20) return prevState;
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
          newState[defender].lastHit = 5;
        } else {
          playHit();
          newState[defender].health = Math.max(
            0,
            newState[defender].health - damage
          );
          newState[defender].lastHit = 15;
          newState.screenShake = {
            x: (Math.random() - 0.5) * 15,
            y: (Math.random() - 0.5) * 15,
          };
          const knockbackDistance = 20;
          const angle = Math.atan2(
            newState[defender].y - newState[attacker].y,
            newState[defender].x - newState[attacker].x
          );
          newState[defender].x += Math.cos(angle) * knockbackDistance;
          newState[defender].y += Math.sin(angle) * knockbackDistance;

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
          setTimeout(() => {
            attack("player1");
          }, 100);
          break;
        case "Enter":
          setTimeout(() => {
            attack("player2");
          }, 100);
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
              className={`absolute w-16 h-16 ${
                player === "player1" ? "bg-blue-500" : "bg-red-500"
              } rounded-full transition-all duration-100 ${
                blocking ? "scale-90 opacity-75" : ""
              } ${lastHit > 0 ? "animate-pulse" : ""}`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: `scale(${1 + lastHit / 30})`,
                boxShadow: `0 0 ${
                  lastHit * 2
                }px ${lastHit}px rgba(255, 255, 255, 0.5)`,
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
