import { Scene } from "../engine/Scene";
import { Entity } from "../engine/Entity";
import { TransformComponent } from "../components/TransformComponent";
import { RenderComponent } from "../components/RenderComponent";

export class LobbyScene extends Scene {
  private players: Entity[] = [];

  constructor() {
    super();
    this.initializeLobby();
  }

  private initializeLobby(): void {
    // Create lobby UI elements
    this.createLobbyText("Waiting for players...", 200, 100);
    this.createLobbyText("Press SPACE to start when ready", 200, 300);
  }

  private createLobbyText(text: string, x: number, y: number): Entity {
    const textEntity = new Entity();
    textEntity.addComponent(new TransformComponent(textEntity, x, y));
    textEntity.addComponent(new RenderComponent(textEntity, "white"));
    this.addEntity(textEntity);
    return textEntity;
  }

  public addPlayer(name: string): void {
    const player = new Entity();
    player.addComponent(
      new TransformComponent(player, 200, 200 + this.players.length * 50)
    );
    player.addComponent(new RenderComponent(player, "white"));
    this.addEntity(player);
    this.players.push(player);
  }

  public removePlayer(name: string): void {
    const playerIndex = this.players.findIndex(
      (p) => p.getComponent(RenderComponent)?.color === name
    );
    if (playerIndex !== -1) {
      this.removeEntity(this.players[playerIndex]);
      this.players.splice(playerIndex, 1);
    }
  }

  public isReadyToStart(): boolean {
    return this.players.length >= 2;
  }
}

export {};
