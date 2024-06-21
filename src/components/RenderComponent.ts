import { Component } from "../engine/Component";
import { Entity } from "../engine/Entity";

export class RenderComponent extends Component {
  public color: string;

  constructor(entity: Entity, color: string = "white") {
    super(entity);
    this.color = color;
  }

  public update(deltaTime: number): void {
    // RenderComponent doesn't need an update method, but we implement it to satisfy the Component interface
  }
}
