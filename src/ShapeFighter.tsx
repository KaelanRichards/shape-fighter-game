import React, { useRef, useEffect, useState } from "react";
import { Engine } from "./engine/Engine";
import { Scene } from "./engine/Scene";
import { Entity } from "./engine/Entity";
import { TransformComponent } from "./components/TransformComponent";
import { VelocityComponent } from "./components/VelocityComponent";
import { PlayerComponent } from "./components/PlayerComponent";
import { ColliderComponent } from "./components/ColliderComponent";
import { RenderComponent } from "./components/RenderComponent";

const ShapeFighter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [players, setPlayers] = useState<{
    player1: Entity | null;
    player2: Entity | null;
  }>({
    player1: null,
    player2: null,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const newEngine = new Engine(canvas);
    const scene = newEngine.getScene();

    // Create players
    const player1 = createPlayer(scene, "Player 1", 100, 200, "blue");
    const player2 = createPlayer(scene, "Player 2", 300, 200, "red");

    setPlayers({ player1, player2 });
    setEngine(newEngine);

    // Start the game
    newEngine.start();

    // Clean up
    return () => {
      newEngine.cleanup();
    };
  }, []);

  const createPlayer = (
    scene: Scene,
    name: string,
    x: number,
    y: number,
    color: string
  ): Entity => {
    const player = new Entity();
    player.addComponent(new TransformComponent(player, x, y));
    player.addComponent(new VelocityComponent(player));
    player.addComponent(new PlayerComponent(player, name));
    player.addComponent(new ColliderComponent(player, 20)); // Assuming a radius of 20
    player.addComponent(new RenderComponent(player, color));
    scene.addEntity(player);
    return player;
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
};

export default ShapeFighter;
