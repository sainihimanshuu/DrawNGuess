import { useState } from "react";
import { socket } from "../../socket";
import { EVENTS } from "../../types";
import { RoomIdPopup } from "./RoomIdPopup";
import { Button } from "../inputs/Button";

export const Entry = (): JSX.Element => {
  const [username, setUsername] = useState<string>("");
  const [roomIdPopup, setRoomIdPopup] = useState<boolean>(false);

  const joinRoom = (roomId: string) => {
    socket.emit(EVENTS.JOIN_A_ROOM, username, "", roomId);
  };

  const createRoom = () => {
    console.log(EVENTS.CREATE_A_NEW_ROOM);
    socket.emit(EVENTS.CREATE_A_NEW_ROOM, username, "");
  };

  return (
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
            className="border-0 bg-myGreen text-white font-roboto text-lg flex-1 mr-1"
            onClick={createRoom}
          >
            create room
          </Button>
          <Button
            className="border-0 bg-myGreen text-white font-roboto text-lg flex-1 ml-1"
            onClick={() => setRoomIdPopup(true)}
          >
            join room
          </Button>
        </div>
      </div>
      {roomIdPopup && (
        <RoomIdPopup
          joinRoom={joinRoom}
          outsideClick={() => setRoomIdPopup(false)}
        />
      )}
    </div>
  );
};
