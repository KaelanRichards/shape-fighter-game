import { WebSocketClient } from "./WebSocketClient";
import {
  NetworkProtocol,
  MessageType,
  NetworkMessage,
  GameState,
  PlayerInput,
} from "./NetworkProtocol";

export class NetworkManager {
  private client: WebSocketClient;
  private gameStateHandler: ((state: GameState) => void) | null = null;
  private playerJoinHandler: ((data: any) => void) | null = null;
  private playerLeaveHandler: ((data: any) => void) | null = null;
  private connectionStatusHandler: ((status: boolean) => void) | null = null;

  constructor(serverUrl: string) {
    this.client = new WebSocketClient(serverUrl);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.onOpen(() => {
      console.log("Connected to server");
      if (this.connectionStatusHandler) {
        this.connectionStatusHandler(true);
      }
    });

    this.client.onClose(() => {
      console.log("Disconnected from server");
      if (this.connectionStatusHandler) {
        this.connectionStatusHandler(false);
      }
      this.attemptReconnection();
    });

    this.client.onMessage(this.handleMessage.bind(this));
  }

  private attemptReconnection(): void {
    console.log("Attempting to reconnect...");
    setTimeout(() => {
      this.connect().catch(() => {
        this.attemptReconnection();
      });
    }, 5000);
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error("Failed to connect to the server:", error);
      throw error;
    }
  }

  public sendGameState(state: GameState): void {
    const message = NetworkProtocol.createGameStateMessage(state);
    this.client.send(message);
  }

  public sendPlayerInput(input: PlayerInput): void {
    const message = NetworkProtocol.createPlayerInputMessage(input);
    this.client.send(message);
  }

  public onGameState(handler: (state: GameState) => void): void {
    this.gameStateHandler = handler;
  }

  public onPlayerJoin(handler: (data: any) => void): void {
    this.playerJoinHandler = handler;
  }

  public onPlayerLeave(handler: (data: any) => void): void {
    this.playerLeaveHandler = handler;
  }

  public onConnectionStatus(handler: (status: boolean) => void): void {
    this.connectionStatusHandler = handler;
  }

  private handleMessage(message: NetworkMessage): void {
    switch (message.type) {
      case MessageType.GAME_STATE:
        if (this.gameStateHandler) {
          this.gameStateHandler(message.data as GameState);
        }
        break;
      case MessageType.PLAYER_JOIN:
        if (this.playerJoinHandler) {
          this.playerJoinHandler(message.data);
        }
        break;
      case MessageType.PLAYER_LEAVE:
        if (this.playerLeaveHandler) {
          this.playerLeaveHandler(message.data);
        }
        break;
      default:
        console.warn("Unhandled message type:", message.type);
    }
  }

  public disconnect(): void {
    this.client.close();
  }
}
