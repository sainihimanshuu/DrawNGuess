import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { EVENTS, Player, Room } from "../types";
import { socket } from "../socket";

interface ContextValues {
  roomId: string;
  players: Player[];
  noOfPlayers: number;
  admin: string;
  gameState: {
    currentRound: number;
    currentPlayer: number;
    currentWord: string;
    correctGuessors: Set<string>;
  };
  me: Player | undefined;
  setMe: React.Dispatch<React.SetStateAction<Player>>;
  setRoom: React.Dispatch<React.SetStateAction<Room>>;
}

export const RoomContext = createContext<ContextValues | null>(null);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be within RoomContextProvider");
  }
  return context;
};

export const RoomContextProvider = ({ children }: { children: ReactNode }) => {
  const [room, setRoom] = useState<Room>({
    roomId: "",
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
  const [me, setMe] = useState<Player>({
    username: "",
    avatar: "",
    score: 0,
    socketId: "",
    drawing: false,
    admin: false,
    guessedAt: null,
  });

  const handleJoinedRoom = (room: Room) => {
    console.log("handle joined rrom from context");
    setRoom(room);
    setMe(
      (prevMe) => room.players.find((p) => p.socketId === socket.id) || prevMe
    );
  };

  useEffect(() => {
    socket.on(EVENTS.JOINED_ROOM, handleJoinedRoom);

    return () => {
      socket.off(EVENTS.JOINED_ROOM, handleJoinedRoom);
    };
  }, []);

  const contextValue: ContextValues = {
    roomId: room.roomId,
    players: room.players,
    noOfPlayers: room.noOfPlayers,
    admin: room.admin,
    gameState: {
      currentRound: room.gameState.currentRound,
      currentPlayer: room.gameState.currentPlayer,
      currentWord: room.gameState.currentWord,
      correctGuessors: room.gameState.correctGuessors,
    },
    setRoom: setRoom,
    me: me,
    setMe: setMe,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
