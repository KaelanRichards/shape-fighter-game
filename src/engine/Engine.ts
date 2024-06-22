// src/engine/Engine.ts
import { Scene } from "./Scene";
import { InputSystem } from "../systems/InputSystem";
import { PhysicsSystem } from "../systems/PhysicsSystem";
import { RenderingSystem } from "../systems/RenderingSystem";
import { SoundSystem } from "../systems/SoundSystem";
import { PlayerComponent } from "../components/PlayerComponent";

export class Engine {
  private scene: Scene;
  private inputSystem: InputSystem;
  private physicsSystem: PhysicsSystem;
  private renderingSystem: RenderingSystem;
  private soundSystem: SoundSystem;
  private isRunning: boolean = false;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new Scene();
    this.inputSystem = new InputSystem();
    this.soundSystem = new SoundSystem();
    this.renderingSystem = new RenderingSystem(canvas);
    this.physicsSystem = new PhysicsSystem(
      this.soundSystem,
      this.renderingSystem
    );
  }

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.soundSystem.startMusic();
      this.gameLoop();
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.soundSystem.stopMusic();
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    this.inputSystem.update(this.scene);
    this.physicsSystem.update(this.scene, deltaTime);
    this.scene.update(deltaTime);
    this.soundSystem.update();

    // Check for game over condition
    if (this.isGameOver()) {
      this.gameOver();
    }
  }

  private render(): void {
    this.renderingSystem.render(this.scene);
  }

  private isGameOver(): boolean {
    const players = this.scene
      .getEntities()
      .filter((entity) => entity.hasComponent(PlayerComponent));
    return players.some((player) => {
      const playerComponent = player.getComponent(PlayerComponent);
      return playerComponent && playerComponent.health <= 0;
    });
  }

  private gameOver(): void {
    this.stop();
    this.soundSystem.playSound("gameover");
    console.log("Game Over!");
    // You can add more game over logic here, such as displaying a game over screen
    // or resetting the game state
  }

  public getScene(): Scene {
    return this.scene;
  }

  public resize(width: number, height: number): void {
    this.renderingSystem.resize(width, height);
  }

  public setVolume(volume: number): void {
    this.soundSystem.setVolume(volume);
  }

  public toggleMute(): void {
    this.soundSystem.toggleMute();
  }

  public cleanup(): void {
    this.stop();
    this.soundSystem.cleanup();
    this.inputSystem.cleanup();
  }
}
