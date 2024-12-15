import { Room, Player } from "./types";
import {
  MAX_ROOM_SIZE,
  RoomList,
  AvailableIds,
  socketRoomMap,
} from "./appData";
import { Socket } from "socket.io";
import { EVENTS } from "./appData";
import { io } from ".";

//maybe i need to send an updated list of players every time

export function createNewRoom(player: Player, socket: Socket): void {
  if (AvailableIds.size === 0) {
    socket.emit("error", {
      message: "Cannot create room now. Please try again later",
    });
    return;
  }
  const keysArray = Array.from(AvailableIds.keys());
  for (const key of keysArray) {
    const roomId = `room${key}`;
    RoomList.set(roomId, {
      roomId: roomId,
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
    AvailableIds.delete(key);
    socketRoomMap.set(socket.id, roomId);
    socket.join(roomId);
    const room = RoomList.get(roomId);
    socket.emit(EVENTS.JOINED_ROOM, room);
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
    socket.emit(EVENTS.ROOM_DOES_NOT_EXIST);
    return;
  }
  if (room.noOfPlayers === MAX_ROOM_SIZE) {
    socket.emit(EVENTS.ROOM_IS_FULL);
    return;
  }
  room.players.push(player);
  room.noOfPlayers++;
  socket.to(roomId).emit(EVENTS.PLAYER_JOINED, player);
  socketRoomMap.set(socket.id, roomId);
  console.log("map size on joining of room: ", socketRoomMap.size);
  socket.join(roomId);
  socket.emit(EVENTS.JOINED_ROOM, room);
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
  console.log("room size when leaving:", socketRoomMap.size);

  //if leaving player was the last player
  if (playersRoom.noOfPlayers === 0) {
    RoomList.delete(playersRoomId);
    const roomId = playersRoom.roomId;
    const id = parseInt(roomId[roomId.length - 1]);
    AvailableIds.set(id, 1);
    return;
  }

  //if leaving player was admin, make a new admin
  if (playersRoom.admin === socket.id) {
    console.log("old admin username:", playersRoom.admin);
    const newAdminSocketId = playersRoom.players[0].socketId;
    playersRoom.admin = newAdminSocketId;
    playersRoom.players[0].admin = true;
    console.log("new admin username:", playersRoom.admin);
    io.to(newAdminSocketId).emit(EVENTS.YOU_ARE_ADMIN);
  }
}
