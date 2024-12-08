import { useState, useEffect, useCallback } from "react";
import { EVENTS, Player } from "../../types";
import { socket } from "../../socket";

interface ChatTemplate {
  username: string;
  guess: string | null;
  isCorrect: boolean;
}

export const ChatArea = (): JSX.Element => {
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
    <div>
      <div>
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
      <div>
        <input type="text" />
        <button>send</button>
      </div>
    </div>
  );
};
