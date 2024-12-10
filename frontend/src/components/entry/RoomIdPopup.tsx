import { useRef, useState } from "react";

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
  const closeModal = (e) => {
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
      <div className="flex flex-col items-stretch">
        <input
          type="text"
          placeholder="enter room id"
          onChange={(e) => setEnteredRoomId(e.target.value)}
        />
        <button onClick={() => joinRoom(enteredRoomId)}>join</button>
      </div>
    </div>
  );
};

//future-handle if join clicked when no id is entered
