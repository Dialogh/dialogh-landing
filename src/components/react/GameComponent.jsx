import React, { useState, useEffect, useRef } from "react";

const PingPong = () => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [ball, setBall] = useState({ x: 50, y: 50, dx: 2, dy: 2, radius: 5 });
  const [paddle, setPaddle] = useState({ x: 0, y: 90, width: 30, height: 5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    setContext(canvas.getContext("2d"));
    const interval = setInterval(() => {
      updateGameArea();
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const updateGameArea = () => {
    if (context) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      drawBall();
      drawPaddle();
      moveBall();
    }
  };

  const drawBall = () => {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = "red";
    context.fill();
    context.closePath();
  };

  const drawPaddle = () => {
    context.fillStyle = "blue";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  };

  const moveBall = () => {
    setBall((prev) => {
      let { x, y, dx, dy } = prev;
      x += dx;
      y += dy;

      if (x + dx > 100 - ball.radius || x + dx < ball.radius) {
        dx = -dx;
      }
      if (
        y + dy < ball.radius ||
        (y + dy > 100 - ball.radius &&
          x > paddle.x &&
          x < paddle.x + paddle.width)
      ) {
        dy = -dy;
      }

      return { ...prev, x, y, dx, dy };
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={100}
      style={{ border: "1px solid black", width: "100%", height: "100%" }}
    />
  );
};

export default PingPong;
