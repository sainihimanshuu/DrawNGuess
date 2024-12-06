export enum EVENTS {
  //CLIENT
  CONNECTED = "connected",
  JOIN_RANDOM_ROOM = "join-random-room",
  CREATE_A_NEW_ROOM = "create-a-new-room",
  JOIN_A_ROOM = "join-a-room",
  DISCONNECT = "disconnect",
  STARTS_DRAWING = "starts-drawing",
  STOPS_DRAWING = "stops-drawing",
  START_GAME = "start-game",
  GUESS = "guess",
  //SERVER
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "palyer-left",
  PLAYER_COORDINATES = "player-coordinates",
  STOPPED_DRAWING = "stopped-drawing",
  GAME_STARTED = "game-started",
  WORD_GIVEN = "word-given",
  GAME_ENDED = "game-ended",
  CORRECT_GUESS = "correct-guess",
  WRONG_GUESS = "wrong-guess",
  TURN_ENDED = "turn-ended",
}
