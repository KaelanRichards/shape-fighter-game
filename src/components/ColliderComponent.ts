import { Component } from "../engine/Component";
import { Entity } from "../engine/Entity";

export class ColliderComponent extends Component {
  public radius: number;

  constructor(entity: Entity, radius: number) {
    super(entity);
    this.radius = radius;
  }

  public update(deltaTime: number): void {
    // ColliderComponent doesn't need an update method, but we implement it to satisfy the Component interface
  }
}
