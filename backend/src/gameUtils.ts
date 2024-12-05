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

export function playerStartsDrawing(
  socket: any,
  clientX: number,
  clientY: number,
  color: string,
  width: number
): void {
  const socketRoomId: string | undefined = socketRoomMap.get(socket.id);
  if (!socketRoomId) {
    return;
  }
  socket
    .to(socketRoomId)
    .emit("player coordinates", { clientX, clientY, color, width });
}

export function playerStopsDrawing(socket: any): void {
  const socketRoomId: string | undefined = socketRoomMap.get(socket.id);
  if (!socketRoomId) {
    return;
  }
  socket.to(socketRoomId).emit("stopped drawing");
}

export function startGame(socket: any): void {
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
  io.to(roomId).emit("game started", room);
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
  io.to(currentPlayer.socketId).emit("word-choosen", word);
  io.to(roomId)
    .except(currentPlayer.socketId)
    .emit("word-choosen", wordWithBlanks);

  const timeOut = setTimeout(() => {
    endRound(roomId);
  }, MAX_DRAW_TIME * 1000);
  timers.set(roomId, timeOut);
}

export function endRound(roomId: string): void {
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

  io.to(roomId).emit("game-ended", currentRoom);
}

export function wordGuessed(socket: any, guess: string): void {
  const roomId: string | undefined = socketRoomMap.get(socket);
  if (!roomId) {
    return;
  }
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
    io.to(roomId).emit("guessed", guesserPlayer); // might need to change this to hide this response with green color on frontend
    //if all players have guessed
    if (
      currentRoom.gameState.correctGuessors.size ===
      currentRoom.players.length - 1
    ) {
      endRound(roomId);
    }
  } else {
    io.to(roomId).emit("guess", guess, guesserPlayer);
  }
}

export function clearTimers(roomId: string): void {
  if (timers.get(roomId)) {
    clearTimeout(timers.get(roomId));
    timers.delete(roomId);
  }
}
