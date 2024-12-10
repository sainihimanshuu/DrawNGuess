//add join a random room

import { useCallback, useEffect, useState } from "react";
import { socket } from "../../socket";
import { EVENTS } from "../../types";
import { RoomIdPopup } from "./RoomIdPopup";
import { useNavigate } from "react-router-dom";

export const Entry = (): JSX.Element => {
  const [username, setUsername] = useState<string>("");
  const [roomIdPopup, setRoomIdPopup] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on(EVENTS.JOINED_ROOM, joinedRoom);

    return () => {
      socket.off(EVENTS.JOINED_ROOM, joinedRoom);
    };
  }, []);

  const joinedRoom = useCallback((roomId: string) => {
    joinRoom(roomId);
    navigate(`/${roomId}`);
  }, []);

  const createRoom = () => {
    socket.emit(EVENTS.JOIN_A_ROOM, username);
  };

  const joinRoom = (roomId: string): void => {
    socket.emit(EVENTS.JOIN_A_ROOM, username, "", roomId);
  };

  return (
    <div>
      <h1>DrawNGuess</h1>
      <div>
        <input
          type="text"
          placeholder="name"
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="flex flex-row justify-stretch">
          <button onClick={createRoom}>create room</button>
          <button onClick={() => setRoomIdPopup(true)}>join room</button>
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
