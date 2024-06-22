// src/systems/PhysicsSystem.ts
import { Scene } from "../engine/Scene";
import { Entity } from "../engine/Entity";
import { TransformComponent } from "../components/TransformComponent";
import { VelocityComponent } from "../components/VelocityComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { ComboComponent } from "../components/ComboComponent";
import { SoundSystem } from "../systems/SoundSystem";
import { RenderingSystem } from "../systems/RenderingSystem";
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  FRICTION,
  MAX_SPEED,
  PLAYER_RADIUS,
} from "../utils/constants";

export class PhysicsSystem {
  private soundSystem: SoundSystem;
  private renderingSystem: RenderingSystem;

  constructor(soundSystem: SoundSystem, renderingSystem: RenderingSystem) {
    this.soundSystem = soundSystem;
    this.renderingSystem = renderingSystem;
  }

  public update(scene: Scene, deltaTime: number): void {
    const entities = scene.getEntities();

    // Update positions and apply friction
    entities.forEach((entity) => this.updatePosition(entity, deltaTime));

    // Check for collisions
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        this.checkCollision(entities[i], entities[j]);
      }
    }
  }

  private updatePosition(entity: Entity, deltaTime: number): void {
    const transform = entity.getComponent(TransformComponent);
    const velocity = entity.getComponent(VelocityComponent);
    const player = entity.getComponent(PlayerComponent);

    if (transform && velocity) {
      // Apply movement
      transform.x += velocity.vx * MAX_SPEED * deltaTime;
      transform.y += velocity.vy * MAX_SPEED * deltaTime;

      // Apply friction
      velocity.vx *= Math.pow(FRICTION, deltaTime);
      velocity.vy *= Math.pow(FRICTION, deltaTime);

      // Stop very small movements
      if (Math.abs(velocity.vx) < 0.01) velocity.vx = 0;
      if (Math.abs(velocity.vy) < 0.01) velocity.vy = 0;

      // Arena boundaries
      transform.x = Math.max(
        PLAYER_RADIUS,
        Math.min(ARENA_WIDTH - PLAYER_RADIUS, transform.x)
      );
      transform.y = Math.max(
        PLAYER_RADIUS,
        Math.min(ARENA_HEIGHT - PLAYER_RADIUS, transform.y)
      );

      // Reduce speed while blocking
      if (player && player.blocking) {
        velocity.vx *= 0.5;
        velocity.vy *= 0.5;
      }
    }
  }

  private checkCollision(entity1: Entity, entity2: Entity): void {
    const transform1 = entity1.getComponent(TransformComponent);
    const transform2 = entity2.getComponent(TransformComponent);
    const velocity1 = entity1.getComponent(VelocityComponent);
    const velocity2 = entity2.getComponent(VelocityComponent);

    if (transform1 && transform2 && velocity1 && velocity2) {
      const dx = transform2.x - transform1.x;
      const dy = transform2.y - transform1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < PLAYER_RADIUS * 2) {
        // Collision detected, resolve it
        this.resolveCollision(entity1, entity2, dx, dy, distance);
      }
    }
  }

  private resolveCollision(
    entity1: Entity,
    entity2: Entity,
    dx: number,
    dy: number,
    distance: number
  ): void {
    const transform1 = entity1.getComponent(TransformComponent);
    const transform2 = entity2.getComponent(TransformComponent);
    const velocity1 = entity1.getComponent(VelocityComponent);
    const velocity2 = entity2.getComponent(VelocityComponent);
    const player1 = entity1.getComponent(PlayerComponent);
    const player2 = entity2.getComponent(PlayerComponent);

    if (
      transform1 &&
      transform2 &&
      velocity1 &&
      velocity2 &&
      player1 &&
      player2
    ) {
      // Calculate collision normal
      const nx = dx / distance;
      const ny = dy / distance;

      // Calculate relative velocity
      const relativeVelocityX = velocity2.vx - velocity1.vx;
      const relativeVelocityY = velocity2.vy - velocity1.vy;

      // Calculate relative velocity in terms of the normal direction
      const velocityAlongNormal =
        relativeVelocityX * nx + relativeVelocityY * ny;

      // Do not resolve if velocities are separating
      if (velocityAlongNormal > 0) return;

      // Calculate restitution (bounciness)
      const restitution = 0.2;

      // Calculate impulse scalar
      let impulseScalar = -(1 + restitution) * velocityAlongNormal;
      impulseScalar /= 2; // Assuming equal mass for both entities

      // Apply impulse
      velocity1.vx -= impulseScalar * nx;
      velocity1.vy -= impulseScalar * ny;
      velocity2.vx += impulseScalar * nx;
      velocity2.vy += impulseScalar * ny;

      // Separate the entities to prevent sticking
      const overlap = (PLAYER_RADIUS * 2 - distance) / 2;
      transform1.x -= overlap * nx;
      transform1.y -= overlap * ny;
      transform2.x += overlap * nx;
      transform2.y += overlap * ny;

      // Handle damage if one player is attacking and the other isn't blocking
      if (!player1.blocking && !player2.blocking) {
        const damage = 5; // Example damage value
        player1.health -= damage;
        player2.health -= damage;

        // Handle combos
        const combo1 = entity1.getComponent(ComboComponent);
        const combo2 = entity2.getComponent(ComboComponent);

        if (combo1 && combo2) {
          combo1.incrementCombo();
          combo2.resetCombo();
          this.soundSystem.playComboSound(combo1.comboCount);
          this.renderingSystem.addScreenShake(0.2 * combo1.comboCount);
        }

        // Ensure health doesn't go below 0
        player1.health = Math.max(0, player1.health);
        player2.health = Math.max(0, player2.health);
      }
    }
  }
}
