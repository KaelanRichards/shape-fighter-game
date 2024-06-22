import { System } from "../engine/System";
import { NetworkManager } from "../networking/NetworkManager";
import { NetworkComponent } from "../components/NetworkComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { TransformComponent } from "../components/TransformComponent";
import { Entity } from "../engine/Entity";
import { GameState, PlayerInput } from "../networking/NetworkProtocol";
import { VelocityComponent } from "../components/VelocityComponent";
import { Scene } from "../engine/Scene";

export class NetworkSystem extends System {
  private networkManager: NetworkManager;
  private lastReceivedState: GameState | null = null;
  private interpolationFactor: number = 0.1;
  private localPlayerId: string | null = null;

  constructor(scene: Scene, serverUrl: string) {
    super(scene);
    this.networkManager = new NetworkManager(serverUrl);
    this.setupNetworkHandlers();
  }

  public async initialize(): Promise<void> {
    try {
      await this.networkManager.connect();
      console.log("Connected to the server successfully");
    } catch (error) {
      console.error("Failed to connect to the server:", error);
      // Implement a retry mechanism or notify the user
    }
  }

  public update(deltaTime: number, inputState: PlayerInput): void {
    const gameState = this.gatherGameState();
    this.networkManager.sendGameState(gameState);
    this.networkManager.sendPlayerInput(inputState);
  }

  public applyLocalInput(input: PlayerInput): void {
    if (this.localPlayerId) {
      input.playerId = this.localPlayerId;
      this.networkManager.sendPlayerInput(input);
      this.applyInputLocally(input);
    }
  }

  private setupNetworkHandlers(): void {
    this.networkManager.onGameState(this.handleGameState.bind(this));
    this.networkManager.onPlayerJoin(this.handlePlayerJoin.bind(this));
    this.networkManager.onPlayerLeave(this.handlePlayerLeave.bind(this));
  }

  private gatherGameState(): GameState {
    const state: GameState = { players: [] };
    this.scene.getEntities().forEach((entity) => {
      const networkComponent = entity.getComponent(NetworkComponent);
      const playerComponent = entity.getComponent(PlayerComponent);
      const transformComponent = entity.getComponent(TransformComponent);

      if (networkComponent && playerComponent && transformComponent) {
        state.players.push({
          id: networkComponent.networkId,
          name: playerComponent.name,
          x: transformComponent.x,
          y: transformComponent.y,
          health: playerComponent.health,
          stamina: playerComponent.stamina,
        });
      }
    });
    return state;
  }

  private handleGameState(state: GameState): void {
    this.lastReceivedState = state;
    state.players.forEach((playerData) => {
      const entity = this.findEntityByNetworkId(playerData.id);
      if (entity) {
        if (playerData.id !== this.localPlayerId) {
          this.updateEntityFromNetworkData(entity, playerData);
        }
      } else {
        this.createNewNetworkedEntity(playerData);
      }
    });
  }

  private handlePlayerJoin(data: { playerId: string }): void {
    console.log(`Player joined: ${data.playerId}`);
    // You can implement additional logic here, such as creating a new entity for the joined player
  }

  private handlePlayerLeave(data: { playerId: string }): void {
    console.log(`Player left: ${data.playerId}`);
    const entity = this.findEntityByNetworkId(data.playerId);
    if (entity) {
      this.scene.removeEntity(entity);
    }
  }

  private findEntityByNetworkId(networkId: string): Entity | undefined {
    return this.scene.getEntities().find((entity) => {
      const networkComponent = entity.getComponent(NetworkComponent);
      return networkComponent && networkComponent.networkId === networkId;
    });
  }

  private updateEntityFromNetworkData(
    entity: Entity,
    data: GameState["players"][0]
  ): void {
    const playerComponent = entity.getComponent(PlayerComponent);
    const transformComponent = entity.getComponent(TransformComponent);

    if (playerComponent && transformComponent) {
      playerComponent.name = data.name;
      playerComponent.health = data.health;
      playerComponent.stamina = data.stamina;

      // Interpolate position
      transformComponent.x +=
        (data.x - transformComponent.x) * this.interpolationFactor;
      transformComponent.y +=
        (data.y - transformComponent.y) * this.interpolationFactor;
    }
  }

  private createNewNetworkedEntity(data: GameState["players"][0]): void {
    const newEntity = new Entity();
    newEntity.addComponent(new NetworkComponent(newEntity, data.id.toString()));
    newEntity.addComponent(
      new PlayerComponent(newEntity, data.name, data.id, false)
    );
    newEntity.addComponent(new TransformComponent(newEntity, data.x, data.y));
    this.scene.addEntity(newEntity);
  }

  private applyInputLocally(input: PlayerInput): void {
    const localPlayer = this.findEntityByNetworkId(input.playerId);
    if (localPlayer) {
      const velocity = localPlayer.getComponent(VelocityComponent);
      const player = localPlayer.getComponent(PlayerComponent);

      if (velocity && player) {
        // Update velocity based on input
        velocity.vx = (input.input.right ? 1 : 0) - (input.input.left ? 1 : 0);
        velocity.vy = (input.input.down ? 1 : 0) - (input.input.up ? 1 : 0);

        // Normalize diagonal movement
        if (velocity.vx !== 0 && velocity.vy !== 0) {
          const length = Math.sqrt(
            velocity.vx * velocity.vx + velocity.vy * velocity.vy
          );
          velocity.vx /= length;
          velocity.vy /= length;
        }

        // Update player state based on action inputs
        player.blocking = input.input.block;
        if (input.input.attack && !player.blocking) {
          player.attack();
        }
      }
    }
  }

  public setLocalPlayerId(playerId: string): void {
    this.localPlayerId = playerId;
  }

  public setScene(scene: Scene): void {
    this.scene = scene;
  }

  public cleanup(): void {
    this.networkManager.disconnect();
  }
}
