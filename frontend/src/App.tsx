import { useEffect, useState } from "react";
import "./App.css";
import { Entry } from "./components/entry/Entry";
import { RoomContextProvider } from "./context/roomContext";
import { GamePage } from "./pages/GamePage";
import { EVENTS } from "./types";
import { socket } from "./socket";

function App() {
  const [room, setRoom] = useState<boolean>(false);

  const handleJoinedRoom = () => {
    console.log("app joined");
    setRoom(true);
  };

  useEffect(() => {
    socket.on(EVENTS.PLAYER_JOINED, handleJoinedRoom);

    return () => {
      socket.off(EVENTS.PLAYER_JOINED, handleJoinedRoom);
    };
  }, []);
  return (
    <div className="flex flex-row justify-center items-center h-screen">
      <RoomContextProvider>
        {room ? <GamePage /> : <Entry />}
      </RoomContextProvider>
    </div>
  );
}

export default App;
