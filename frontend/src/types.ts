import { ToastPosition } from "react-toastify";

export enum EVENTS {
  //CLIENT
  CONNECTED = "connected",
  JOIN_RANDOM_ROOM = "join-random-room",
  CREATE_A_NEW_ROOM = "create-a-new-room",
  JOIN_A_ROOM = "join-a-room",
  DISCONNECT = "disconnect",
  STARTS_DRAWING = "starts-drawing",
  STOPS_DRAWING = "stops-drawing",
  START_GAME = "start-game",
  GUESS = "guess",
  //SERVER
  JOINED_ROOM = "joined-room",
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "palyer-left",
  PLAYER_COORDINATES = "player-coordinates",
  STOPPED_DRAWING = "stopped-drawing",
  GAME_STARTED = "game-started",
  WORD_GIVEN = "word-given",
  GAME_ENDED = "game-ended",
  CORRECT_GUESS = "correct-guess",
  WRONG_GUESS = "wrong-guess",
  TURN_ENDED = "turn-ended",
  ROOM_DOES_NOT_EXIST = "room-does-not-exist",
  ROOM_IS_FULL = "room-is-full",
}

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
  players: Player[];
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

export const toastOptions = {
  position: "top-center" as ToastPosition,
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  theme: "colored",
};
