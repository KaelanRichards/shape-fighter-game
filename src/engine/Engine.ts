// src/engine/Engine.ts
import { Scene } from "./Scene";
import { InputSystem } from "../systems/InputSystem";
import { PhysicsSystem } from "../systems/PhysicsSystem";
import { RenderingSystem } from "../systems/RenderingSystem";
import { SoundSystem } from "../systems/SoundSystem";
import { PlayerComponent } from "../components/PlayerComponent";
import { NetworkSystem } from "../systems/NetworkSystem";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { LobbyScene } from "../scenes/LobbyScene";
import { GameScene } from "../scenes/GameScene";
import { PlayerInput } from "../networking/NetworkProtocol";
import { VelocityComponent } from "../components/VelocityComponent";

export class Engine {
  private currentScene: Scene;
  private mainMenuScene: MainMenuScene;
  private lobbyScene: LobbyScene;
  private gameScene: GameScene;
  private inputSystem: InputSystem;
  private physicsSystem: PhysicsSystem;
  private renderingSystem: RenderingSystem;
  private soundSystem: SoundSystem;
  private networkSystem: NetworkSystem;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  public onGameOver: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, serverUrl: string) {
    this.renderingSystem = new RenderingSystem(canvas);
    this.soundSystem = new SoundSystem();
    this.inputSystem = new InputSystem();
    this.physicsSystem = new PhysicsSystem(
      this.soundSystem,
      this.renderingSystem
    );

    this.mainMenuScene = new MainMenuScene();
    this.lobbyScene = new LobbyScene();
    this.gameScene = new GameScene();
    this.currentScene = this.mainMenuScene;

    this.networkSystem = new NetworkSystem(this.currentScene, serverUrl);
  }

  public setMainMenuScene(): void {
    this.currentScene = this.mainMenuScene;
    this.updateNetworkSystemScene(this.currentScene);
  }

  public setLobbyScene(): void {
    this.currentScene = this.lobbyScene;
    this.updateNetworkSystemScene(this.currentScene);
  }

  public setGameScene(): void {
    this.currentScene = this.gameScene;
    this.updateNetworkSystemScene(this.currentScene);
  }

  private updateNetworkSystemScene(newScene: Scene): void {
    this.networkSystem.setScene(newScene);
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

  public restart(): void {
    this.stop();
    this.currentScene = new Scene();
    this.lastTime = performance.now();
    this.isRunning = false;
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
    this.inputSystem.update(this.currentScene);
    this.physicsSystem.update(this.currentScene, deltaTime);
    this.currentScene.update(deltaTime);
    this.soundSystem.update();

    const inputState = this.getInputState();
    this.networkSystem.update(deltaTime, inputState);

    if (this.currentScene === this.gameScene && this.isGameOver()) {
      this.gameOver();
    }
  }

  private getInputState(): PlayerInput {
    const localPlayer = this.currentScene
      .getEntities()
      .find((entity) => entity.getComponent(PlayerComponent)?.isLocalPlayer);
    if (localPlayer) {
      const playerComponent = localPlayer.getComponent(PlayerComponent);
      const velocityComponent = localPlayer.getComponent(VelocityComponent);
      return {
        playerId: playerComponent?.networkId || "",
        input: {
          left: (velocityComponent?.vx ?? 0) < 0,
          right: (velocityComponent?.vx ?? 0) > 0,
          up: (velocityComponent?.vy ?? 0) < 0,
          down: (velocityComponent?.vy ?? 0) > 0,
          attack: playerComponent?.isAttacking || false,
          block: playerComponent?.blocking || false,
        },
      };
    }
    return {
      playerId: "",
      input: {
        left: false,
        right: false,
        up: false,
        down: false,
        attack: false,
        block: false,
      },
    };
  }

  private render(): void {
    this.renderingSystem.render(this.currentScene);
  }

  private isGameOver(): boolean {
    const players = this.currentScene
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
    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  public getScene(): Scene {
    return this.currentScene;
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
    this.networkSystem.cleanup();
  }

  public setLocalPlayerId(playerId: string): void {
    this.networkSystem.setLocalPlayerId(playerId);
  }

  public async initialize(): Promise<void> {
    await this.networkSystem.initialize();
  }
}
