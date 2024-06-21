import { Component } from "./Component";

export class Entity {
  private components: Map<string, Component> = new Map();
  private id: number;
  private static nextId: number = 0;

  constructor() {
    this.id = Entity.nextId++;
  }

  public addComponent(component: Component): void {
    this.components.set(component.constructor.name, component);
  }

  public getComponent<T extends Component>(
    componentType: new (...args: any[]) => T
  ): T | undefined {
    return this.components.get(componentType.name) as T | undefined;
  }

  public removeComponent(
    componentType: new (...args: any[]) => Component
  ): void {
    this.components.delete(componentType.name);
  }

  public hasComponent(
    componentType: new (...args: any[]) => Component
  ): boolean {
    return this.components.has(componentType.name);
  }

  public update(deltaTime: number): void {
    this.components.forEach((component) => component.update(deltaTime));
  }

  public getId(): number {
    return this.id;
  }

  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }
}
