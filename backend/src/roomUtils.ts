import { Room, Player } from "./types";

const maxRoomSize = process.env.MAX_ROOM_SIZE;
const RoomList = new Map<string, Room>();
const AvailableIds = new Map<number, number>();
const socketRoomMap = new Map<any, string>();
for (let i = 1; i <= 100; i++) {
  AvailableIds.set(i, 1);
}

export function createNewRoom(player: Player, socket: any): void {
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
    });
    AvailableIds.delete(parseInt(key));
    socketRoomMap.set(socket.id, roomId);
    socket.join(roomId);
    return;
  }
}

export function findRoomsToJoin(): string | null {
  for (const [key, value] of RoomList.entries()) {
    if (value.noOfPlayers < maxRoomSize) {
      return key;
    }
  }
  return null;
}

export function addPlayerToRoom(
  player: Player,
  roomId: string,
  socket: any
): void {
  const room = RoomList.get(roomId);
  if (!room) {
    socket.emit("error", { message: "Room does not exist" });
    return;
  }
  if (room.noOfPlayers === maxRoomSize) {
    socket.emit("error", { message: "Room is full" });
    return;
  }
  room.players.push(player);
  room.noOfPlayers++;
  socket.to(roomId).emit("player-joined", `${player.username} joined`);
  socketRoomMap.set(socket.id, roomId);
  socket.join(roomId);
  return;
}

export function createNewPlayer(
  socket: any,
  username: string,
  avatar: string
): Player {
  const newPlayer: Player = {
    username,
    avatar,
    score: 0,
    socketId: socket.id,
  };
  return newPlayer;
}

export function removePlayerFromRoom(socket: any): void {
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
    .emit(
      "player-left",
      `${playersRoom.players[playerIndex].username} has left the room`
    );
  playersRoom.players.splice(playerIndex, 1);
  playersRoom.noOfPlayers--;
  socketRoomMap.delete(socket.id);
  socket.leave(playersRoomId);
  if (playersRoom.noOfPlayers === 0) {
    RoomList.delete(playersRoomId);
  }
}
