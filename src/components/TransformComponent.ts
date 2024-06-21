import { Component } from "../engine/Component";
import { Entity } from "../engine/Entity";

export class TransformComponent extends Component {
  public x: number;
  public y: number;
  public rotation: number;

  constructor(
    entity: Entity,
    x: number = 0,
    y: number = 0,
    rotation: number = 0
  ) {
    super(entity);
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }

  public update(deltaTime: number): void {
    // TransformComponent doesn't need an update method, but we implement it to satisfy the Component interface
  }
}
