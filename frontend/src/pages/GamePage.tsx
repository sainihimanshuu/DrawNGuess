import { Canvas } from "../components/canvas/canvas";
import { ChatArea } from "../components/chatArea/chatArea";
import { Header } from "../components/header/header";
import { PlayerList } from "../components/sidebar/playerList";

export const GamePage = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full mx-6">
      <Header />
      {/* w-full in the below div */}
      <div className="flex flex-row justify-center mt-2">
        <PlayerList className="flex-1" />
        <Canvas className="flex-3" />
        <ChatArea className="flex-1" />
      </div>
    </div>
  );
};
