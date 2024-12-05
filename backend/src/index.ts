import { createServer } from "http";
import { Server } from "socket.io";
import {
  Player,
  // ClientToServerEvents,
  // InterServerEvents,
  // ServerToClientEvents,
  // SocketData,
} from "./types";
import {
  createNewPlayer,
  addPlayerToRoom,
  removePlayerFromRoom,
  findRoomsToJoin,
  createNewRoom,
} from "./roomUtils";

import {
  playerStartsDrawing,
  playerStopsDrawing,
  startGame,
  wordGuessed,
} from "./gameUtils";

const httpServer = createServer();
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket: any) => {
  console.log(`${socket.id} connected`);

  socket.on("join random room", (username: string, avatar: string) => {
    const admin = false;
    const newPlayer: Player = createNewPlayer(socket, username, avatar, admin);
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
    const admin = true;
    const newPlayer: Player = createNewPlayer(socket, username, avatar, admin);

    createNewRoom(newPlayer, socket);
  });

  socket.on(
    "join a room",
    (username: string, avatar: string, roomId: string) => {
      const admin = false;
      const newPlayer: Player = createNewPlayer(
        socket,
        username,
        avatar,
        admin
      );

      addPlayerToRoom(newPlayer, roomId, socket);
    }
  );

  socket.on("disconnect", () => {
    removePlayerFromRoom(socket);
  });

  //when player starts drawing
  socket.on(
    "starts drawing",
    (clientX: number, clientY: number, color: string, width: number) => {
      playerStartsDrawing(socket, clientX, clientY, color, width);
    }
  );

  //when player stops drawing
  socket.on("stops drawing", () => {
    playerStopsDrawing(socket);
  });

  //admin starts the game
  socket.on("start game", () => {
    startGame(socket);
  });

  socket.on("guess", (guess: string) => {
    wordGuessed(socket, guess);
  });
});

httpServer.listen(process.env.PORT);
