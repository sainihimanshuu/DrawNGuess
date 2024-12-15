import { useState, useEffect, useCallback } from "react";
import { EVENTS, Player } from "../../types";
import { socket } from "../../socket";
import { Button } from "../common/Button";
//import "react-toastify/dist/ReactToastify.css";
// import { CustomToast } from "../common/CustomToast";
// import { toastOptions } from "../../types";
import { useRoom } from "../../context/roomContext";

interface ChatTemplate {
  username: string;
  guess: string | null;
  isCorrect: boolean;
}

export const ChatArea = ({ className }: { className: string }): JSX.Element => {
  const { me } = useRoom();
  const [chats, setChats] = useState<ChatTemplate[]>([]);
  const [myGuess, setMyGuess] = useState<string>("");

  const correctGuess = useCallback((player: Player) => {
    setChats((prevChats) => [
      ...prevChats,
      {
        username: player.username,
        guess: null,
        isCorrect: true,
      },
    ]);
  }, []);

  const wrongGuess = useCallback((guess: string, player: Player) => {
    setChats((prevChats) => [
      ...prevChats,
      {
        username: player.username,
        guess: guess,
        isCorrect: false,
      },
    ]);
  }, []);

  useEffect(() => {
    socket.on(EVENTS.CORRECT_GUESS, correctGuess);
    socket.on(EVENTS.WRONG_GUESS, wrongGuess);

    return () => {
      socket.off(EVENTS.CORRECT_GUESS);
      socket.off(EVENTS.WRONG_GUESS);
    };
  }, [correctGuess, wrongGuess]);

  const handleSend = () => {
    if (myGuess === "") {
      // toast.error(<CustomToast message="enter a guess" />, toastOptions);
      return;
    }
    socket.emit(EVENTS.GUESS, myGuess);
    setMyGuess("");
  };
  return (
    <>
      {/* <ToastContainer /> */}
      <div className={`${className}`}>
        <div className="flex flex-col h-full font-roboto">
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) =>
              chat.isCorrect ? (
                <div className="font-semibold bg-lightMyGreen text-ansGreen mb-1 rounded-md mx-2 px-2 py-1">
                  <h3 className="text">{`${chat.username} has guessed the word`}</h3>
                </div>
              ) : (
                <div className="flex flex-row bg-white mb-1 rounded-md mx-2 px-2 py-1">
                  <h2 className="font-semibold">{`${chat.username}:`}</h2>
                  <h4 className="ml-1">{chat.guess}</h4>
                </div>
              )
            )}
          </div>
          {/* <div className="flex-none"> */}
          <div className=" flex-none flex flex-row mx-2">
            <input
              type="text"
              placeholder="type you guess here"
              className="rounded-md p-1"
              onChange={(e) => setMyGuess(e.target.value)}
              value={myGuess}
              disabled={me?.drawing}
            />
            <Button
              className="border-0 bg-myGreen text-white text-md h-8 w-14 px-0 py-0 ml-1"
              onClick={handleSend}
              disabled={me?.drawing}
            >
              {`->`}
            </Button>
          </div>
          {/* </div> */}
        </div>
      </div>
    </>
  );
};
