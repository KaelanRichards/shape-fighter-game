import { GameState, PlayerInput } from "./NetworkProtocol";

export class Serialization {
  public static serializeGameState(state: GameState): string {
    return JSON.stringify(state);
  }

  public static deserializeGameState(data: string): GameState {
    return JSON.parse(data);
  }

  public static serializePlayerInput(input: PlayerInput): string {
    return JSON.stringify(input);
  }

  public static deserializePlayerInput(data: string): PlayerInput {
    return JSON.parse(data);
  }
}

export {};
