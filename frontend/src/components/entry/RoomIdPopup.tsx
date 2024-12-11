import React, { useRef, useState } from "react";
import { Button } from "../inputs/Button";

export const RoomIdPopup = ({
  joinRoom,
  outsideClick,
}: {
  joinRoom: (roomId: string) => void;
  outsideClick: () => void;
}): JSX.Element => {
  const [enteredRoomId, setEnteredRoomId] = useState<string>("");
  const modalRef = useRef(null);

  //figure out the type for event
  const closeModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current === e.target) {
      outsideClick();
    }
  };

  return (
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
          className="border-0 bg-myGreen text-white font-roboto text-lg flex-1 mb-2"
          onClick={() => joinRoom(enteredRoomId)}
        >
          join
        </Button>
      </div>
    </div>
  );
};

//future-handle if join clicked when no id is entered
