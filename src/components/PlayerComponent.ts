import { Component } from "../engine/Component";
import { Entity } from "../engine/Entity";

export class PlayerComponent extends Component {
  public health: number;
  public stamina: number;
  public blocking: boolean;
  public name: string;
  public lastAttackTime: number;
  public isAttacking: boolean;
  public isLocalPlayer: boolean;
  public networkId: string;

  constructor(
    entity: Entity,
    name: string,
    networkId: string,
    isLocalPlayer: boolean = false
  ) {
    super(entity);
    this.health = 100;
    this.stamina = 100;
    this.blocking = false;
    this.name = name;
    this.lastAttackTime = 0;
    this.isAttacking = false;
    this.isLocalPlayer = isLocalPlayer;
    this.networkId = networkId;
  }

  public update(deltaTime: number): void {
    // Regenerate stamina
    this.stamina = Math.min(100, this.stamina + 10 * deltaTime);

    // Cooldown for attacks
    this.lastAttackTime = Math.max(0, this.lastAttackTime - deltaTime);

    // Reset attack state
    this.isAttacking = false;
  }

  public takeDamage(amount: number): void {
    if (!this.blocking) {
      this.health = Math.max(0, this.health - amount);
    } else {
      // Reduced damage when blocking
      this.health = Math.max(0, this.health - amount * 0.5);
      this.stamina = Math.max(0, this.stamina - amount * 2); // Blocking consumes stamina
    }
  }

  public attack(): boolean {
    const attackCost = 20;
    if (this.stamina >= attackCost && this.lastAttackTime <= 0) {
      this.stamina -= attackCost;
      this.lastAttackTime = 0.5; // 0.5 second cooldown
      this.isAttacking = true;
      return true;
    }
    return false;
  }

  public serialize(): object {
    return {
      networkId: this.networkId,
      name: this.name,
      health: this.health,
      stamina: this.stamina,
      blocking: this.blocking,
      isAttacking: this.isAttacking,
    };
  }

  public deserialize(data: any): void {
    this.networkId = data.networkId;
    this.name = data.name;
    this.health = data.health;
    this.stamina = data.stamina;
    this.blocking = data.blocking;
    this.isAttacking = data.isAttacking;
  }
}
