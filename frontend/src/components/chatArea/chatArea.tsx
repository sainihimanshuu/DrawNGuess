import { useState, useEffect, useCallback } from "react";
import { EVENTS, Player } from "../../types";
import { socket } from "../../socket";
import { Button } from "../inputs/Button";

interface ChatTemplate {
  username: string;
  guess: string | null;
  isCorrect: boolean;
}

export const ChatArea = ({ className }: { className: string }): JSX.Element => {
  const [chats, setChats] = useState<ChatTemplate[]>([]);

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

  return (
    <div className={`${className}`}>
      <div className={`flex flex-col h-full font-roboto`}>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) =>
            chat.isCorrect ? (
              <div>
                <h2>{chat.username}</h2>
                <h4>{chat.guess}</h4>
              </div>
            ) : (
              <div>
                <h3>{`${chat.username} has guessed the word`}</h3>
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
          />
          <Button className="border-0 bg-myGreen text-white text-md h-8 w-14 px-0 py-0 ml-1">
            {`->`}
          </Button>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
};
