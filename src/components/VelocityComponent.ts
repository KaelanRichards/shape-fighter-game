import { Component } from "../engine/Component";
import { Entity } from "../engine/Entity";

export class VelocityComponent extends Component {
  public vx: number;
  public vy: number;

  constructor(entity: Entity, vx: number = 0, vy: number = 0) {
    super(entity);
    this.vx = vx;
    this.vy = vy;
  }

  public update(deltaTime: number): void {
    // VelocityComponent doesn't need an update method, but we implement it to satisfy the Component interface
  }
}
