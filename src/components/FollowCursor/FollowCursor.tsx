import React, { useEffect, useState } from "react";

export const FollowCursor: React.FC<{
  children: any;
  data: {
    offsetX: number;
    offsetY: number;
  };
}> = ({ children, data: { offsetX, offsetY } }) => {
  const [coords, setCoords] = useState({
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
  });

  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent) => {
      setCoords({
        x: event.pageX,
        y: event.pageY,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    };
    window.addEventListener("mousemove", handleWindowMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
    };
  }, []);

  const isReady = Object.values(coords).every((val) => val !== 0);

  if (!isReady) {
    return <></>;
  }

  const left =
    window.innerWidth / 2 - coords.clientX > 0 ? offsetX + 10 : -(offsetX + 10);

  const top =
    window.innerHeight / 2 - coords.clientY > 0
      ? offsetY + 10
      : -(offsetY + 10);

  return (
    <div
      style={{
        zIndex: 10,
        pointerEvents: "none",
        position: "absolute",
        transition: "transform 0.25s",
        transform: `translate(${left}px, ${top}px)`,
        left: coords.x - offsetX,
        top: coords.y - offsetY,
        // opacity: 0.8,
      }}
    >
      {children}
    </div>
  );
};
