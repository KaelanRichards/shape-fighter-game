import { Scene } from "../engine/Scene";
import { Entity } from "../engine/Entity";
import { TransformComponent } from "../components/TransformComponent";
import { VelocityComponent } from "../components/VelocityComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { ColliderComponent } from "../components/ColliderComponent";
import { RenderComponent } from "../components/RenderComponent";
import { ComboComponent } from "../components/ComboComponent";
import { NetworkComponent } from "../components/NetworkComponent";
import { ARENA_WIDTH, ARENA_HEIGHT, PLAYER_RADIUS } from "../utils/constants";

export class GameScene extends Scene {
  private players: Entity[] = [];

  constructor() {
    super();
    this.initializePlayers();
  }

  private initializePlayers(): void {
    const player1 = this.createPlayer("Player 1", 100, 200, "blue", true);
    const player2 = this.createPlayer("Player 2", 300, 200, "red");
    this.players.push(player1, player2);
  }

  private createPlayer(
    name: string,
    x: number,
    y: number,
    color: string,
    isLocalPlayer: boolean = false
  ): Entity {
    const player = new Entity();
    const networkId = `player_${name.toLowerCase().replace(" ", "_")}`;
    player.addComponent(new TransformComponent(player, x, y));
    player.addComponent(new VelocityComponent(player));
    player.addComponent(
      new PlayerComponent(player, name, networkId, isLocalPlayer)
    );
    player.addComponent(new ColliderComponent(player, PLAYER_RADIUS));
    player.addComponent(new RenderComponent(player, color));
    player.addComponent(new ComboComponent(player));
    player.addComponent(new NetworkComponent(player, networkId));
    this.addEntity(player);
    return player;
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);
    this.checkGameOver();
  }

  private checkGameOver(): void {
    const alivePlayers = this.players.filter((player) => {
      const playerComponent = player.getComponent(PlayerComponent);
      return playerComponent && playerComponent.health > 0;
    });

    if (alivePlayers.length <= 1) {
      console.log("Game Over!");
      // Implement game over logic here
    }
  }
}

export {};
