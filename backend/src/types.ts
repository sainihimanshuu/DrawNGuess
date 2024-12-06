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
