import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { EVENTS } from "../../types";

export const Header = (): JSX.Element => {
  const [word, setWord] = useState<string>("");
  const [roundNo, setRoundNo] = useState<number>(0);
  const [timer, setTime] = useState<number>(0);

  const turnEnded = () => {};
  const wordGiven = () => {};

  useEffect(() => {
    socket.on(EVENTS.TURN_ENDED, turnEnded);
    socket.on(EVENTS.WORD_GIVEN, wordGiven);

    return () => {
      socket.off(EVENTS.TURN_ENDED, turnEnded);
      socket.off(EVENTS.WORD_GIVEN, wordGiven);
    };
  }, []);

  return (
    <div>
      <div>
        <h1>{timer}</h1>
        <h2>{`Round ${roundNo}`}</h2>
      </div>
      <div>{word.length === 0 ? <h1></h1> : <h1>{word}</h1>}</div>
      /*insert drawnguess logo here*/
    </div>
  );
};
