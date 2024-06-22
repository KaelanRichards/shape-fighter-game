export enum MessageType {
  GAME_STATE,
  PLAYER_INPUT,
  PLAYER_JOIN,
  PLAYER_LEAVE,
}

export interface NetworkMessage {
  type: MessageType;
  data: any;
}

export interface GameState {
  players: {
    id: string;
    name: string;
    x: number;
    y: number;
    health: number;
    stamina: number;
  }[];
}

export interface PlayerInput {
  playerId: string;
  input: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    attack: boolean;
    block: boolean;
  };
}

export const NetworkProtocol = {
  createMessage(type: MessageType, data: any): NetworkMessage {
    return { type, data };
  },

  createGameStateMessage(gameState: GameState): NetworkMessage {
    return this.createMessage(MessageType.GAME_STATE, gameState);
  },

  createPlayerInputMessage(input: PlayerInput): NetworkMessage {
    return this.createMessage(MessageType.PLAYER_INPUT, input);
  },

  createPlayerJoinMessage(playerId: string): NetworkMessage {
    return this.createMessage(MessageType.PLAYER_JOIN, { playerId });
  },

  createPlayerLeaveMessage(playerId: string): NetworkMessage {
    return this.createMessage(MessageType.PLAYER_LEAVE, { playerId });
  },
};
