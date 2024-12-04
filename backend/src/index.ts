import { createServer } from "http";
import { Server } from "socket.io";
import {
  Player,
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types";
import {
  createNewPlayer,
  addPlayerToRoom,
  removePlayerFromRoom,
  findRoomsToJoin,
  createNewRoom,
} from "./roomUtils";

const httpServer = createServer();
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket: any) => {
  console.log(`${socket.id} connected`);

  socket.on("join random room", (username: string, avatar: string) => {
    const newPlayer: Player = createNewPlayer(socket, username, avatar);
    const roomToJoin: string | null = findRoomsToJoin();

    if (roomToJoin === null) {
      socket.emit("error", {
        message: "All rooms are full. Please try again later",
      });
    } else {
      addPlayerToRoom(newPlayer, roomToJoin, socket);
    }
  });

  socket.on("create a new room", (username: string, avatar: string) => {
    const newPlayer: Player = createNewPlayer(socket, username, avatar);

    createNewRoom(newPlayer, socket);
  });

  socket.on(
    "join a room",
    (username: string, avatar: string, roomId: string) => {
      const newPlayer: Player = createNewPlayer(socket, username, avatar);

      addPlayerToRoom(newPlayer, roomId, socket);
    }
  );

  socket.on("disconnect", () => {
    removePlayerFromRoom(socket);
  });
});

httpServer.listen(process.env.PORT);
