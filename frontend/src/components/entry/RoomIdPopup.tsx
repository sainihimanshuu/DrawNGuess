import React, { useEffect, useRef, useState } from "react";
import { Button } from "../common/Button";
// import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { CustomToast } from "../common/CustomToast";
// import { EVENTS, toastOptions } from "../../types";
import { EVENTS } from "../../types";
import { socket } from "../../socket";

export const RoomIdPopup = ({
  username,
  outsideClick,
}: {
  username: string;
  outsideClick: () => void;
}): JSX.Element => {
  const [enteredRoomId, setEnteredRoomId] = useState<string>("");
  const modalRef = useRef(null);

  useEffect(() => {
    console.log("hello from useEffect");
    const roomNotExist = () => {
      // toast.error(<CustomToast message="room does not exist" />, toastOptions);
    };
    const roomFull = () => {
      // toast.error(<CustomToast message="room is full" />, toastOptions);
    };
    socket.on(EVENTS.ROOM_DOES_NOT_EXIST, roomNotExist);
    socket.on(EVENTS.ROOM_IS_FULL, roomFull);

    return () => {
      console.log("hello from return");
      socket.off(EVENTS.ROOM_DOES_NOT_EXIST, roomNotExist);
      socket.off(EVENTS.ROOM_IS_FULL, roomFull);
    };
  }, []);

  //figure out the type for event
  const closeModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current === e.target) {
      outsideClick();
    }
  };

  const joinRoom = (roomId: string) => {
    if (roomId === "") {
      // toast.error(<CustomToast message="enter a roomId" />, toastOptions);
      return;
    }
    socket.emit(EVENTS.JOIN_A_ROOM, username, "", roomId);
  };
  return (
    <>
      {/* <ToastContainer /> */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center"
        ref={modalRef}
        onClick={closeModal}
      >
        <div className="flex flex-col p-3 rounded-md bg-borderBlue w-96">
          <input
            type="text"
            className="p-2 rounded-md mt-3 mb-5 w-full font-roboto font-semibold"
            placeholder="enter room id"
            onChange={(e) => setEnteredRoomId(e.target.value)}
          />
          <Button
            className="border-0 py-2 bg-myGreen text-white font-roboto text-lg flex-1 mb-2"
            onClick={() => joinRoom(enteredRoomId)}
          >
            join
          </Button>
        </div>
      </div>
    </>
  );
};

//future-handle if join clicked when no id is entered
