import { Entity } from "./Entity";

export abstract class Component {
  protected entity: Entity;

  constructor(entity: Entity) {
    this.entity = entity;
  }

  public abstract update(deltaTime: number): void;
}
