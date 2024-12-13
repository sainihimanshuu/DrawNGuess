import {
  RoomList,
  socketRoomMap,
  wordLibrary,
  timers,
  MAX_DRAW_TIME,
  MAX_ROUNDS,
} from "./appData";
import { io } from "./index";
import { Room, Player } from "./types";
import { generateWordWithBlanks } from "./utils";
import { Socket } from "socket.io";
import { EVENTS } from "./appData";

export function playerStartsDrawing(
  socket: Socket,
  clientX: number,
  clientY: number
  // color: string,
  // width: number
): void {
  const socketRoomId: string | undefined = socketRoomMap.get(socket.id);
  if (!socketRoomId) {
    return;
  }
  socket.to(socketRoomId).emit(EVENTS.PLAYER_COORDINATES, clientX, clientY);
}

export function playerStopsDrawing(socket: Socket): void {
  const socketRoomId: string | undefined = socketRoomMap.get(socket.id);
  if (!socketRoomId) {
    return;
  }
  socket.to(socketRoomId).emit(EVENTS.STOPPED_DRAWING);
}

export function startGame(socket: Socket): void {
  const roomId: string | undefined = socketRoomMap.get(socket.id);
  if (!roomId) {
    return;
  }
  const room: Room | undefined = RoomList.get(roomId);
  if (!room) {
    return;
  }
  room.gameState.currentRound = 1;
  room.gameState.currentPlayer = 0;
  io.to(roomId).emit(EVENTS.GAME_STARTED, room);
  assignWord(roomId);
}

export function assignWord(roomId: string): void {
  const wordIndex: number =
    Math.floor(Math.random() * (wordLibrary.length - 1 - 0 + 1)) + 0; //Math.floor(Math.random() * (max - min + 1) ) + min; include both min and max
  const word: string = wordLibrary[wordIndex];
  const wordWithBlanks: string = generateWordWithBlanks(word);
  const currentRoom: Room | undefined = RoomList.get(roomId);
  if (!currentRoom) {
    return;
  }
  const currentPlayerIndex: number = currentRoom.gameState.currentPlayer;
  const currentPlayer: Player = currentRoom.players[currentPlayerIndex];
  io.to(currentPlayer.socketId).emit(EVENTS.WORD_GIVEN, word);
  io.to(roomId)
    .except(currentPlayer.socketId)
    .emit(EVENTS.WORD_GIVEN, wordWithBlanks);

  const timeOut = setTimeout(() => {
    endRound(roomId);
  }, MAX_DRAW_TIME * 1000);
  timers.set(roomId, timeOut);
}

export function endRound(roomId: string): void {
  clearTimers(roomId);
  const currentRoom: Room | undefined = RoomList.get(roomId);
  if (!currentRoom) {
    return;
  }
  currentRoom.gameState.currentPlayer++;
  if (currentRoom.gameState.currentPlayer === 8) {
    //this means the current round has ended
    currentRoom.gameState.currentPlayer = 0;
    currentRoom.gameState.currentRound++;
  }

  givePoints(roomId);
  currentRoom.gameState.currentWord = "";
  io.to(roomId).emit(EVENTS.TURN_ENDED, currentRoom);

  const timeOut = setTimeout(() => {
    if (currentRoom.gameState.currentRound === MAX_ROUNDS) {
      endGame(roomId);
    } else {
      assignWord(roomId);
    }
  }, 5 * 1000); //wait for five seconds before ending the game or starting a new round
  timers.set(roomId, timeOut);
}

export function givePoints(roomId: string): void {
  const currentRoom: Room | undefined = RoomList.get(roomId);
  if (!currentRoom) {
    return;
  }
  //scores to players who guessed correctly
  const now = new Date();
  for (const p of currentRoom.players) {
    if (currentRoom.gameState.correctGuessors.has(p.socketId)) {
      const timeLeft =
        Math.abs(now.getTime() - (p.guessedAt ? p.guessedAt : now).getTime()) /
        1000;
      p.score += Math.max(100, timeLeft * 10);
    }
    if (p === currentRoom.players[currentRoom.gameState.currentPlayer]) {
      //player who drew
      p.score += 50 * currentRoom.gameState.correctGuessors.size;
    }
  }
}

export function endGame(roomId: string): void {
  const currentRoom: Room | undefined = RoomList.get(roomId);
  if (!currentRoom) {
    return;
  }
  clearTimers(roomId);
  currentRoom.gameState.currentPlayer = 0;
  currentRoom.gameState.currentRound = 0;
  currentRoom.gameState.currentWord = "";
  currentRoom.gameState.correctGuessors.clear();

  io.to(roomId).emit(EVENTS.GAME_ENDED, currentRoom);
}

export function wordGuessed(socket: Socket, guess: string): void {
  const roomId: string | undefined = socketRoomMap.get(socket.id);
  console.log(socketRoomMap.size);
  if (!roomId) {
    console.log(roomId);
    console.log(guess, "inside roomId check");
    return;
  }
  console.log(guess);
  const currentRoom: Room | undefined = RoomList.get(roomId);
  if (!currentRoom) {
    return;
  }
  const word = currentRoom.gameState.currentWord;
  const guesserPlayer: Player | undefined = currentRoom.players.find(
    (p) => p.socketId === socket.id
  );
  if (!guesserPlayer) {
    return;
  }
  if (guess.toLowerCase() === word) {
    currentRoom.gameState.correctGuessors.add(socket.id);
    guesserPlayer.guessedAt = new Date();
    io.to(roomId).emit(EVENTS.CORRECT_GUESS, guesserPlayer); // might need to change this to hide this response with green color on frontend
    //if all players have guessed
    if (
      currentRoom.gameState.correctGuessors.size ===
      currentRoom.players.length - 1
    ) {
      endRound(roomId);
    }
  } else {
    io.to(roomId).emit(EVENTS.WRONG_GUESS, guess, guesserPlayer);
  }
}

export function clearTimers(roomId: string): void {
  if (timers.get(roomId)) {
    clearTimeout(timers.get(roomId));
    timers.delete(roomId);
  }
}
