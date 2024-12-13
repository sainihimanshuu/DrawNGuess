import { useState } from "react";
import { socket } from "../../socket";
import { EVENTS } from "../../types";
import { RoomIdPopup } from "./RoomIdPopup";
import { Button } from "../common/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomToast } from "../common/CustomToast";
import { toastOptions } from "../../types";

export const Entry = (): JSX.Element => {
  const [username, setUsername] = useState<string>("");
  const [roomIdPopup, setRoomIdPopup] = useState<boolean>(false);

  const createRoom = () => {
    if (username === "") {
      toast.error(<CustomToast message="enter a username" />, toastOptions);
      return;
    }
    socket.emit(EVENTS.CREATE_A_NEW_ROOM, username, "");
  };

  const handleJoinRoom = () => {
    if (username === "") {
      toast.error(<CustomToast message="enter a username" />, toastOptions);
      return;
    }
    setRoomIdPopup(true);
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col p-3 rounded-md bg-borderBlue w-96">
        <h1 className="font-bold font-roboto text-white text-6xl">
          draw n guess
        </h1>
        <div>
          <input
            className="p-2 rounded-md my-5 w-full font-roboto font-semibold"
            type="text"
            placeholder="name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex flex-row justify-center">
            <Button
              className="border-0 py-2 bg-myGreen text-white font-roboto text-lg flex-1 mr-1"
              onClick={createRoom}
            >
              create room
            </Button>
            <Button
              className="border-0 bg-myGreen text-white font-roboto text-lg flex-1 ml-1"
              onClick={handleJoinRoom}
            >
              join room
            </Button>
          </div>
        </div>
        {roomIdPopup && (
          <RoomIdPopup
            username={username}
            outsideClick={() => setRoomIdPopup(false)}
          />
        )}
      </div>
    </>
  );
};
