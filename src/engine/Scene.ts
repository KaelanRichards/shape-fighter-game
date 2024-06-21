import { Entity } from "./Entity";

export class Scene {
  private entities: Entity[] = [];

  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  public removeEntity(entity: Entity): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  public update(deltaTime: number): void {
    this.entities.forEach((entity) => entity.update(deltaTime));
  }

  public getEntities(): Entity[] {
    return this.entities;
  }
}
