import { useEffect, useRef, MouseEvent } from "react";
import { EVENTS } from "../../types";
import { socket } from "../../socket";

//future - throttling or debouncing for mouse movements

export const Canvas = (): JSX.Element => {
  const isDrawingRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null | undefined>(null);

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext("2d");
    socket.on(EVENTS.PLAYER_COORDINATES, startsDrawing);
    socket.on(EVENTS.STOPPED_DRAWING, stoppedDrawing);

    return () => {
      socket.off(EVENTS.PLAYER_COORDINATES, startsDrawing);
      socket.off(EVENTS.STOPPED_DRAWING, stoppedDrawing);
    };
  }, []);

  const getOffset = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const offsetX = rect ? rect.left : 0;
    const offsetY = rect ? rect.top : 0;
    return { offsetX, offsetY };
  };

  //when others draw
  const startsDrawing = (clientX: number, clientY: number) => {
    if (!ctxRef.current) {
      return;
    }
    const { offsetX, offsetY } = getOffset();
    ctxRef.current.lineTo(clientX - offsetX, clientY - offsetY);
    ctxRef.current.stroke();
  };
  const stoppedDrawing = () => {
    ctxRef.current?.beginPath();
  };

  const meDraw = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !ctxRef.current) {
      return;
    }
    const { offsetX, offsetY } = getOffset();
    socket.emit(EVENTS.STARTS_DRAWING, event.clientX, event.clientY);
    ctxRef.current.lineTo(event.clientX - offsetX, event.clientY - offsetY);
    ctxRef.current.stroke();
  };

  const meStoppedDrawing = () => {
    isDrawingRef.current = false;
    socket.emit(EVENTS.STOPS_DRAWING);
    ctxRef.current?.beginPath();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={() => {
          isDrawingRef.current = true;
        }}
        onMouseUp={() => meStoppedDrawing()}
        onMouseMove={(event) => meDraw(event)}
      />
    </div>
  );
};
