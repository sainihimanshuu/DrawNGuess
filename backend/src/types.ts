export interface Player {
  username: string;
  avatar: string;
  score: number;
  socketId: any;
  drawing: boolean;
  admin: boolean;
  guessedAt: Date | null;
}

export interface Room {
  players: [Player];
  noOfPlayers: number;
  admin: string; //socket.id
  gameState: GameState;
}

interface GameState {
  currentRound: number;
  currentPlayer: number; //index
  currentWord: string;
  correctGuessors: Set<string>; //socket.id
}
// export interface ServerToClientEvents {
//   noArg: () => void;
//   basicEmit: (a: number, b: string, c: Buffer) => void;
//   withAck: (d: string, callback: (e: number) => void) => void;
// }

// export interface ClientToServerEvents {
//   hello: () => void;
// }

// export interface InterServerEvents {
//   ping: () => void;
// }

// export interface SocketData {
//   name: string;
//   age: number;
// }
