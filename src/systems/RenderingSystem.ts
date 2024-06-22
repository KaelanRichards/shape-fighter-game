// src/systems/RenderingSystem.ts
import { Scene } from "../engine/Scene";
import { TransformComponent } from "../components/TransformComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { VelocityComponent } from "../components/VelocityComponent";
import { ARENA_WIDTH, ARENA_HEIGHT, PLAYER_RADIUS } from "../utils/constants";

export class RenderingSystem {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private screenShake: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  public render(scene: Scene): void {
    this.clearCanvas();
    this.applyScreenShake();
    this.drawArena();
    this.drawEntities(scene);
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private applyScreenShake(): void {
    const shakeIntensity = 5;
    const shakeDecay = 0.9;

    if (this.screenShake > 0) {
      const shakeOffsetX =
        (Math.random() - 0.5) * shakeIntensity * this.screenShake;
      const shakeOffsetY =
        (Math.random() - 0.5) * shakeIntensity * this.screenShake;
      this.ctx.translate(shakeOffsetX, shakeOffsetY);
      this.screenShake *= shakeDecay;
    } else {
      this.screenShake = 0;
    }
  }

  public addScreenShake(amount: number): void {
    this.screenShake = Math.min(this.screenShake + amount, 1);
  }

  private drawArena(): void {
    // Draw arena border
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Draw center line
    this.ctx.beginPath();
    this.ctx.moveTo(ARENA_WIDTH / 2, 0);
    this.ctx.lineTo(ARENA_WIDTH / 2, ARENA_HEIGHT);
    this.ctx.stroke();
  }

  private drawEntities(scene: Scene): void {
    scene.getEntities().forEach((entity) => {
      const transform = entity.getComponent(TransformComponent);
      const player = entity.getComponent(PlayerComponent);
      const velocity = entity.getComponent(VelocityComponent);

      if (transform && player) {
        this.drawPlayer(transform, player, velocity);
      }
    });
  }

  private drawPlayer(
    transform: TransformComponent,
    player: PlayerComponent,
    velocity?: VelocityComponent
  ): void {
    const { x, y } = transform;

    // Draw player body
    this.ctx.fillStyle = player.name === "Player 1" ? "blue" : "red";
    this.ctx.beginPath();
    this.ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw direction indicator
    if (velocity && (velocity.vx !== 0 || velocity.vy !== 0)) {
      const angle = Math.atan2(velocity.vy, velocity.vx);
      this.ctx.strokeStyle = "yellow";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(
        x + Math.cos(angle) * PLAYER_RADIUS,
        y + Math.sin(angle) * PLAYER_RADIUS
      );
      this.ctx.stroke();
    }

    // Draw blocking indicator
    if (player.blocking) {
      this.ctx.strokeStyle = "cyan";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, PLAYER_RADIUS + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw health bar
    this.drawBar(x, y - 30, player.health, 100, "green");

    // Draw stamina bar
    this.drawBar(x, y - 25, player.stamina, 100, "yellow");

    // Draw player name
    this.ctx.fillStyle = "white";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(player.name, x, y - 40);
  }

  private drawBar(
    x: number,
    y: number,
    value: number,
    maxValue: number,
    color: string
  ): void {
    const barWidth = 40;
    const barHeight = 5;
    const fillWidth = (value / maxValue) * barWidth;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - barWidth / 2, y, fillWidth, barHeight);
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }
}
