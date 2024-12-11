import { useState, useEffect, useCallback } from "react";
import { Player, Room } from "../../types";
import { socket } from "../../socket";
import { EVENTS } from "../../types";
import { useRoom } from "../../context/roomContext";

//future- display playername joined, left etc

export const PlayerList = (): JSX.Element => {
  const { players } = useRoom();
  const [list, setList] = useState<Player[]>(players);

  const addPlayer = useCallback((player: Player) => {
    setList([...list, player]);
  }, []);

  const removePlayer = useCallback((player: Player) => {
    setList((prevList) => prevList.filter((p) => p !== player));
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

  useEffect(() => {
    socket.on(EVENTS.PLAYER_JOINED, addPlayer);
    socket.on(EVENTS.PLAYER_LEFT, removePlayer);
    socket.on(EVENTS.TURN_ENDED, updateScores);

    return () => {
      socket.off(EVENTS.PLAYER_JOINED, addPlayer);
      socket.off(EVENTS.PLAYER_LEFT, removePlayer);
      socket.off(EVENTS.TURN_ENDED, updateScores);
    };
  }, [addPlayer, removePlayer, updateScores]);

  return (
    <div>
      {list.map((player: Player) => (
        <div>
          <img src={player.avatar} />
          <div>
            <h1>{player.username}</h1>
            <h3>{player.score}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};
