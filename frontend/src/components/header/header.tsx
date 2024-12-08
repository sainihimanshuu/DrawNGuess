import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { EVENTS, Room } from "../../types";

export const Header = (): JSX.Element => {
  const [word, setWord] = useState<string>("");
  const [roundNo, setRoundNo] = useState<number>(0);
  const [timer, setTimer] = useState<number>(60);
  const intervalRef = useRef<number | undefined>(undefined);

  const turnEnded = useCallback((room: Room) => {
    //update round no, word and reset timer
    setWord("");
    setRoundNo((prevRoundNo) => prevRoundNo + 1);
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const wordGiven = useCallback((word: string) => {
    //start set word and start timer
    //diplay word assigned msg
    setWord(word);
    setTimer(60);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
  }, []);

  useEffect(() => {
    socket.on(EVENTS.TURN_ENDED, turnEnded);
    socket.on(EVENTS.WORD_GIVEN, wordGiven);

    return () => {
      socket.off(EVENTS.TURN_ENDED, turnEnded);
      socket.off(EVENTS.WORD_GIVEN, wordGiven);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [turnEnded, wordGiven]);

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
