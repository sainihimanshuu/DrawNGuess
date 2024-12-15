import { useEffect, useState } from "react";
import { Canvas } from "../components/canvas/canvas";
import { ChatArea } from "../components/chatArea/chatArea";
import { Header } from "../components/header/header";
import { PlayerList } from "../components/sidebar/playerList";
import { EVENTS, Player, Room } from "../types";
import { socket } from "../socket";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { CustomToast } from "../components/common/CustomToast";
import { useRoom } from "../context/roomContext";
import { Button } from "../components/common/Button";

export const GamePage = (): JSX.Element => {
  const { roomId, me, setMe, setRoom } = useRoom();
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    // const playerJoined = (player: Player) => {
    //   // toast.success(
    //   //   <CustomToast message={`${player.username} joined`} />,
    //   //   toastOptions
    //   // );
    // };
    // const playerLeft = (player: Player) => {
    //   // toast.error(
    //   //   <CustomToast message={`${player.username} left`} />,
    //   //   toastOptions
    //   // );
    // };
    const youAreAdmin = () => {
      // toast.success(<CustomToast message="you are admin" />, toastOptions);
      setMe((prevMe: Player) => ({ ...prevMe, admin: true }));
    };
    const gameStarted = (room: Room) => {
      //toast.success(<CustomToast message="game started" />, toastOptions); //this is somehow coausing an error
      setStarted(true);
      setRoom(room);
      const myProfile = room.players.find((p) => p.socketId === me?.socketId);
      if (myProfile) {
        setMe(myProfile);
      }
    };
    const turnEnded = (room: Room) => {
      setRoom(room);
      const myProfile = room.players.find((p) => p.socketId === me?.socketId);
      if (myProfile) {
        setMe(myProfile);
      }
    };

    // socket.on(EVENTS.PLAYER_JOINED, playerJoined);
    // socket.on(EVENTS.PLAYER_LEFT, playerLeft);
    socket.on(EVENTS.YOU_ARE_ADMIN, youAreAdmin);
    socket.on(EVENTS.GAME_STARTED, gameStarted);
    socket.on(EVENTS.TURN_ENDED, turnEnded);

    return () => {
      // socket.off(EVENTS.PLAYER_JOINED, playerJoined);
      // socket.off(EVENTS.PLAYER_LEFT, playerLeft);
      socket.off(EVENTS.YOU_ARE_ADMIN, youAreAdmin);
      socket.off(EVENTS.GAME_STARTED, gameStarted);
      socket.off(EVENTS.TURN_ENDED, turnEnded);
    };
  }, []);

  const handleStart = () => {
    socket.emit(EVENTS.START_GAME);
  };

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="flex flex-col w-full mx-6">
        <div className="font-roboto text-white ml-auto mr-1">{`room id - ${roomId}`}</div>
        <Header />
        {/* w-full in the below div */}
        <div className="flex flex-row justify-center mt-2">
          <PlayerList className="flex-1" />
          {me?.admin ? (
            started ? (
              <Canvas className="flex-3" />
            ) : (
              <Button
                className="flex-3 border-0 bg-myGreen text-white text-md h-10 w-14 px-0 py-0 ml-1"
                onClick={handleStart}
              >
                Start
              </Button>
            )
          ) : (
            <Canvas className="flex-3" />
          )}
          <ChatArea className="flex-1" />
        </div>
      </div>
    </>
  );
};
