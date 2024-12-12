import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { EVENTS, Room } from "../types";
import { socket } from "../socket";

export const RoomContext = createContext<Room | null>(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be within RoomContextProvider");
  }
  return context;
};

export const RoomContextProvider = ({ children }: { children: ReactNode }) => {
  const [room, setRoom] = useState<Room>({
    players: [],
    noOfPlayers: 0,
    admin: "",
    gameState: {
      currentRound: 0,
      currentPlayer: 0,
      currentWord: "",
      correctGuessors: new Set<string>(),
    },
  });

  const handleJoinedRoom = (room: Room) => {
    console.log("handle joined rrom from context");
    setRoom(room);
  };

  useEffect(() => {
    socket.on(EVENTS.JOINED_ROOM, handleJoinedRoom);

    return () => {
      socket.off(EVENTS.JOINED_ROOM, handleJoinedRoom);
    };
  }, []);

  const contextValue = {
    players: room.players,
    noOfPlayers: room.noOfPlayers,
    admin: room.admin,
    gameState: {
      currentRound: room.gameState.currentRound,
      currentPlayer: room.gameState.currentPlayer,
      currentWord: room.gameState.currentWord,
      correctGuessors: room.gameState.correctGuessors,
    },
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
