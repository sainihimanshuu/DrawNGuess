import { useEffect } from "react";
import { Canvas } from "../components/canvas/canvas";
import { ChatArea } from "../components/chatArea/chatArea";
import { Header } from "../components/header/header";
import { PlayerList } from "../components/sidebar/playerList";
import { EVENTS, Player, toastOptions } from "../types";
import { socket } from "../socket";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomToast } from "../components/common/CustomToast";

export const GamePage = (): JSX.Element => {
  useEffect(() => {
    const playerJoined = (player: Player) => {
      toast.success(
        <CustomToast message={`${player.username} joined`} />,
        toastOptions
      );
    };
    const playerLeft = (player: Player) => {
      toast.error(
        <CustomToast message={`${player.username} left`} />,
        toastOptions
      );
    };

    socket.on(EVENTS.PLAYER_JOINED, playerJoined);
    socket.on(EVENTS.PLAYER_LEFT, playerLeft);

    return () => {
      socket.off(EVENTS.PLAYER_JOINED, playerJoined);
      socket.off(EVENTS.PLAYER_LEFT, playerLeft);
    };
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col w-full mx-6">
        <Header />
        {/* w-full in the below div */}
        <div className="flex flex-row justify-center mt-2">
          <PlayerList className="flex-1" />
          <Canvas className="flex-3" />
          <ChatArea className="flex-1" />
        </div>
      </div>
    </>
  );
};
