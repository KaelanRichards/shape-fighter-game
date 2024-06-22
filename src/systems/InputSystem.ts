// src/systems/InputSystem.ts
import { Scene } from "../engine/Scene";
import { VelocityComponent } from "../components/VelocityComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { PlayerControls } from "../utils/types";

export class InputSystem {
  private keysPressed: { [key: string]: boolean } = {};
  private playerControls: { [key: string]: PlayerControls } = {
    "Player 1": {
      left: "a",
      right: "d",
      up: "w",
      down: "s",
      attack: " ", // space
      block: "f",
    },
    "Player 2": {
      left: "ArrowLeft",
      right: "ArrowRight",
      up: "ArrowUp",
      down: "ArrowDown",
      attack: "Enter",
      block: "/",
    },
  };

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    this.keysPressed[e.key] = true;
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysPressed[e.key] = false;
  }

  public update(scene: Scene): void {
    scene.getEntities().forEach((entity) => {
      const velocity = entity.getComponent(VelocityComponent);
      const player = entity.getComponent(PlayerComponent);

      if (velocity && player) {
        const controls = this.playerControls[player.name];
        if (controls) {
          // Update velocity based on movement keys
          velocity.vx = 0;
          velocity.vy = 0;
          if (this.keysPressed[controls.left]) velocity.vx -= 1;
          if (this.keysPressed[controls.right]) velocity.vx += 1;
          if (this.keysPressed[controls.up]) velocity.vy -= 1;
          if (this.keysPressed[controls.down]) velocity.vy += 1;

          // Normalize diagonal movement
          if (velocity.vx !== 0 && velocity.vy !== 0) {
            const length = Math.sqrt(
              velocity.vx * velocity.vx + velocity.vy * velocity.vy
            );
            velocity.vx /= length;
            velocity.vy /= length;
          }

          // Update player state based on action keys
          player.blocking = this.keysPressed[controls.block];

          if (this.keysPressed[controls.attack] && !player.blocking) {
            this.attack(player);
          }
        }
      }
    });
  }

  private attack(player: PlayerComponent): void {
    if (player.attack()) {
      console.log(`${player.name} attacks!`);
    }
  }

  public cleanup(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
