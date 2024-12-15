import { useEffect, useRef, MouseEvent } from "react";
import { EVENTS } from "../../types";
import { socket } from "../../socket";
import { useRoom } from "../../context/roomContext";

//future - throttling or debouncing for mouse movements

export const Canvas = ({ className }: { className: string }): JSX.Element => {
  const { me } = useRoom();
  const isDrawingRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null | undefined>(null);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      let imageData;
      if (ctx) {
        imageData = ctx.getImageData(0, 0, canvas?.width, canvas?.height);
      }
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const devicePixelRatio = window.devicePixelRatio || 1;

        // Update internal resolution
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;

        // Maintain visual size
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Scale the drawing context
        if (ctx) {
          ctx.scale(devicePixelRatio, devicePixelRatio);
          if (imageData) {
            ctx.putImageData(imageData, 0, 0);
          }
        }
      }
    };
    const turnEnded = () => {
      ctxRef.current?.beginPath();
      ctxRef.current?.clearRect(
        0,
        0,
        canvasRef.current?.width,
        canvasRef.current?.height
      );
    };
    resizeCanvas();
    ctxRef.current = canvasRef.current?.getContext("2d");
    socket.on(EVENTS.PLAYER_COORDINATES, startsDrawing);
    socket.on(EVENTS.STOPPED_DRAWING, stoppedDrawing);
    socket.on(EVENTS.TURN_ENDED, turnEnded);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      socket.off(EVENTS.PLAYER_COORDINATES, startsDrawing);
      socket.off(EVENTS.STOPPED_DRAWING, stoppedDrawing);
      window.removeEventListener("resize", resizeCanvas);
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
    if (!isDrawingRef.current || !ctxRef.current || me?.drawing === false) {
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
    <canvas
      className={`bg-white rounded-md ${className}`}
      ref={canvasRef}
      onMouseDown={() => {
        isDrawingRef.current = true;
      }}
      onMouseUp={() => meStoppedDrawing()}
      onMouseMove={(event) => meDraw(event)}
    />
  );
};
