import { Component } from "../engine/Component";
import { Entity } from "../engine/Entity";

export class NetworkComponent extends Component {
  public networkId: string;
  public lastUpdateTime: number;

  constructor(entity: Entity, networkId: string) {
    super(entity);
    this.networkId = networkId;
    this.lastUpdateTime = Date.now();
  }

  public update(deltaTime: number): void {
    // Network-specific update logic can be added here if needed
  }
}
