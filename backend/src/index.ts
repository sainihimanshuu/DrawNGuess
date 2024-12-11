import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Player } from "./types";
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
import { EVENTS } from "./appData";

const httpServer = createServer();
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const PORT = process.env.PORT || 3000;

//future- join a random room
//cases to solve - 1. timer value on frontend when a player join game midway someone's turn
//2. drawing data until the player has drawn

io.on("connection", (socket: Socket) => {
  console.log(`${socket.id} connected`);

  socket.on(EVENTS.CONNECTED, (username: string, avatar: string) => {
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

  socket.on(EVENTS.CREATE_A_NEW_ROOM, (username: string, avatar: string) => {
    console.log("ram ram");
    const admin = true;
    const newPlayer: Player = createNewPlayer(socket, username, avatar, admin);

    createNewRoom(newPlayer, socket);
  });

  socket.on(
    EVENTS.JOIN_A_ROOM,
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

  socket.on(EVENTS.DISCONNECT, () => {
    removePlayerFromRoom(socket);
  });

  //when player starts drawing
  socket.on(EVENTS.STARTS_DRAWING, (clientX: number, clientY: number) => {
    playerStartsDrawing(socket, clientX, clientY);
  });

  //when player stops drawing
  socket.on(EVENTS.STOPS_DRAWING, () => {
    playerStopsDrawing(socket);
  });

  //admin starts the game
  socket.on(EVENTS.START_GAME, () => {
    startGame(socket);
  });

  socket.on(EVENTS.GUESS, (guess: string) => {
    wordGuessed(socket, guess);
  });
});

httpServer.listen(PORT, () => {
  console.log("listening on port", PORT);
});
