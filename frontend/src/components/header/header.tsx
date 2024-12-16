import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import { EVENTS } from "../../types";
import { useRoom } from "../../context/roomContext";

export const Header = (): JSX.Element => {
  const { gameState } = useRoom();
  const [word, setWord] = useState<string>(gameState.currentWord);
  const [roundNo, setRoundNo] = useState<number>(gameState.currentRound);
  const [timer, setTimer] = useState<number>(60);
  const intervalRef = useRef<number | undefined>(undefined);
  const [ended, setEnded] = useState<boolean>(false);

  const turnEnded = useCallback(() => {
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

  const gameEnded = useCallback(() => {
    setEnded(true);
  }, []);

  useEffect(() => {
    socket.on(EVENTS.TURN_ENDED, turnEnded);
    socket.on(EVENTS.WORD_GIVEN, wordGiven);
    socket.on(EVENTS.GAME_ENDED, gameEnded);

    return () => {
      socket.off(EVENTS.TURN_ENDED, turnEnded);
      socket.off(EVENTS.WORD_GIVEN, wordGiven);
      socket.off(EVENTS.GAME_ENDED, gameEnded);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [turnEnded, wordGiven, gameEnded]);

  return (
    <div className="flex flex-row justify-between items-center bg-borderBlue font-roboto min-h-14 text-white rounded-md">
      <div className="flex flex-row text-2xl font-semibold">
        <h1 className="mx-4">{timer}</h1>
        <h2>{!ended ? `Round ${roundNo}` : "game ended"}</h2>
      </div>
      <div>{word.length === 0 ? <h1></h1> : <h1>{word}</h1>}</div>
      <h1 className="mr-4 text-4xl">draw n guess</h1>
    </div>
  );
};
