import { Room, Player } from "./types";
import {
  MAX_ROOM_SIZE,
  RoomList,
  AvailableIds,
  socketRoomMap,
} from "./appData";
import { Socket } from "socket.io";
import { EVENTS } from "./appData";

//maybe i need to send an updated list of players every time

export function createNewRoom(player: Player, socket: Socket): void {
  if (AvailableIds.size === 0) {
    socket.emit("error", {
      message: "Cannot create room now. Please try again later",
    });
    return;
  }
  for (const key in AvailableIds.keys()) {
    const roomId = `room${key}`;
    RoomList.set(roomId, {
      players: [player],
      noOfPlayers: 1,
      admin: socket.id,
      gameState: {
        currentRound: 0,
        currentPlayer: 0,
        currentWord: "",
        correctGuessors: new Set<string>(),
      },
    });
    AvailableIds.delete(parseInt(key));
    socketRoomMap.set(socket.id, roomId);
    socket.join(roomId);
    socket.emit(EVENTS.JOINED_ROOM, roomId);
    return;
  }
}

export function findRoomsToJoin(): string | null {
  for (const [key, value] of RoomList.entries()) {
    if (value.noOfPlayers < MAX_ROOM_SIZE) {
      return key;
    }
  }
  return null;
}

export function addPlayerToRoom(
  player: Player,
  roomId: string,
  socket: Socket
): void {
  const room = RoomList.get(roomId);
  if (!room) {
    socket.emit("error", { message: "Room does not exist" });
    return;
  }
  if (room.noOfPlayers === MAX_ROOM_SIZE) {
    socket.emit("error", { message: "Room is full" });
    return;
  }
  room.players.push(player);
  room.noOfPlayers++;
  socket.to(roomId).emit(EVENTS.PLAYER_JOINED, player);
  socketRoomMap.set(socket.id, roomId);
  socket.join(roomId);
  return;
}

export function createNewPlayer(
  socket: Socket,
  username: string,
  avatar: string,
  admin: boolean
): Player {
  const newPlayer: Player = {
    username,
    avatar,
    score: 0,
    socketId: socket.id,
    drawing: false,
    admin,
    guessedAt: null,
  };
  return newPlayer;
}

export function removePlayerFromRoom(socket: Socket): void {
  const playersRoomId: string | undefined = socketRoomMap.get(socket.id);
  if (!playersRoomId) {
    return;
  }
  const playersRoom: Room | undefined = RoomList.get(playersRoomId);
  if (!playersRoom) {
    return;
  }
  const playerIndex = playersRoom.players.findIndex(
    (p) => p.socketId === socket.id
  );
  if (playerIndex === -1) {
    return;
  }
  socket
    .to(playersRoomId)
    .emit(EVENTS.PLAYER_LEFT, playersRoom.players[playerIndex]);

  //remove the player
  playersRoom.players.splice(playerIndex, 1);
  playersRoom.noOfPlayers--;
  socketRoomMap.delete(socket.id);
  socket.leave(playersRoomId);

  //if leaving player was the last player
  if (playersRoom.noOfPlayers === 0) {
    RoomList.delete(playersRoomId);
    return;
  }

  //if leaving player was admin, make a new admin
  if (playersRoom.admin === socket.id) {
    const newAdminSocketId = playersRoom.players[0].socketId;
    playersRoom.admin = newAdminSocketId;
    playersRoom.players[0].admin = true;
  }
}
