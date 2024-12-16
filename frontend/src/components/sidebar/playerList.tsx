import { useState, useEffect, useCallback } from "react";
import { Player, Room } from "../../types";
import { socket } from "../../socket";
import { EVENTS } from "../../types";
import { useRoom } from "../../context/roomContext";
import pencil from "../../assets/pencil.png";

export const PlayerList = ({
  className,
}: {
  className: string;
}): JSX.Element => {
  const { players } = useRoom();
  const [list, setList] = useState<Player[]>(players);

  const addPlayer = useCallback((player: Player) => {
    setList((prevList) => [...prevList, player]);
  }, []);

  const removePlayer = useCallback((player: Player) => {
    setList((prevList) =>
      prevList.filter((p) => p.socketId !== player.socketId)
    );
  }, []);

  const updateScores = useCallback((room: Room) => {
    setList((prevList) =>
      prevList.map((p) => {
        const playerInRoom = room.players.find(
          (roomPlayer) => roomPlayer.socketId === p.socketId
        );
        return playerInRoom ? { ...p, score: playerInRoom.score } : p;
      })
    );
  }, []);

  const turnEnded = useCallback((room: Room) => {
    setList(room.players);
  }, []);

  const gameStarted = useCallback((room: Room) => {
    setList(room.players);
  }, []);

  useEffect(() => {
    socket.on(EVENTS.PLAYER_JOINED, addPlayer);
    socket.on(EVENTS.PLAYER_LEFT, removePlayer);
    socket.on(EVENTS.TURN_ENDED, turnEnded);
    socket.on(EVENTS.GAME_STARTED, gameStarted);
    socket.on(EVENTS.TURN_ENDED, updateScores);

    return () => {
      socket.off(EVENTS.PLAYER_JOINED, addPlayer);
      socket.off(EVENTS.PLAYER_LEFT, removePlayer);
      socket.off(EVENTS.TURN_ENDED, turnEnded);
      socket.off(EVENTS.GAME_STARTED, gameStarted);
      socket.off(EVENTS.TURN_ENDED, updateScores);
    };
  }, [addPlayer, removePlayer, updateScores]);

  return (
    <div className={`${className} overflow-y-auto`}>
      {list.map((player) => (
        <div
          key={player.username}
          className="bg-white mx-2 flex flex-row justify-between items-center font-semibold font-roboto h-10 p-3 rounded-md mb-1"
        >
          {/* <img src={player.avatar} /> */}
          <h1>{player.username || "jlk"}</h1>
          <div className="flex flex-row">
            {player.drawing && <img src={pencil} className="mr-1 size-6" />}
            <h3>{`${player.score} points`}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};
