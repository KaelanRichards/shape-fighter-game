import React, { useRef, useEffect, useState } from "react";
import { Engine } from "./engine/Engine";

const ShapeFighter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [currentScene, setCurrentScene] = useState<
    "mainMenu" | "lobby" | "game"
  >("mainMenu");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const newEngine = new Engine(canvas, "ws://localhost:3001");
    setEngine(newEngine);

    const handleGameOver = () => {
      newEngine.stop();
      setCurrentScene("mainMenu");
    };

    newEngine.onGameOver = handleGameOver;

    newEngine.start();

    return () => {
      newEngine.cleanup();
    };
  }, []);

  useEffect(() => {
    if (!engine) return;

    switch (currentScene) {
      case "mainMenu":
        engine.setMainMenuScene();
        break;
      case "lobby":
        engine.setLobbyScene();
        break;
      case "game":
        engine.setGameScene();
        break;
    }
  }, [currentScene, engine]);

  const handleSceneChange = (scene: "mainMenu" | "lobby" | "game") => {
    setCurrentScene(scene);
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={400} height={400} />
      {currentScene === "mainMenu" && (
        <button onClick={() => handleSceneChange("lobby")}>Start Game</button>
      )}
      {currentScene === "lobby" && (
        <button onClick={() => handleSceneChange("game")}>Enter Game</button>
      )}
    </div>
  );
};

export default ShapeFighter;
