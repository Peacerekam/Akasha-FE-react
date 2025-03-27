import { useEffect, useRef, useState } from "react";

export type ArtifactBgOnCanvasProps = {
  backgroundImage: string;
  adaptiveBgColor?: boolean;
  namecardBg?: boolean;
  adaptiveColors?: [string[], string[]];
  hardcodedScale?: number;
  offsetIndex?: number;
};

export const ArtifactBackgroundOnCanvas: React.FC<ArtifactBgOnCanvasProps> = ({
  backgroundImage,
  adaptiveBgColor,
  namecardBg,
  adaptiveColors,
  hardcodedScale = 1,
  offsetIndex = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialized, setInitialized] = useState(false);

  const canvasWidth = 420 * hardcodedScale;
  const canvasHeight = 280 * hardcodedScale;

  // canvas pixel density
  useEffect(() => {
    if (!canvasRef.current) return;
    if (initialized) return;

    const scaleFactor = namecardBg ? 2 : 1;

    const ctx = canvasRef.current.getContext("2d");
    ctx!.scale(scaleFactor, scaleFactor);

    setInitialized(true);
  }, [canvasRef, initialized, namecardBg]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImage;

    img.onload = () => {
      if (!canvasRef.current) return;

      // clear canvas
      ctx!.globalCompositeOperation = "source-out";
      ctx!.clearRect(0, 0, canvasWidth, canvasHeight);

      // doesnt work on safari iOS?
      // ctx!.filter = `brightness(${adaptiveBgColor ? 50 : 65}%)`;
      ctx!.filter = namecardBg ? `blur(2px) brightness(0.75)` : "";

      ctx!.globalCompositeOperation = "source-over";

      const conditionalScale = namecardBg ? 0.65 : 0.41;
      const offset = offsetIndex * -55;

      ctx!.drawImage(
        img,
        (namecardBg ? 0 : -128) + offset,
        namecardBg ? -125 : -23,
        (namecardBg ? canvasWidth : img.width) * conditionalScale,
        (namecardBg ? canvasHeight : img.height) * conditionalScale
      );

      const gradientCoords = [0, 0, 0, canvasHeight] as const;

      if (adaptiveBgColor && adaptiveColors) {
        const adaptiveGradientSolid = ctx!.createLinearGradient(
          ...gradientCoords
        );
        const adaptiveGradient = ctx!.createLinearGradient(...gradientCoords);

        const fillColorSolid = adaptiveColors[0];
        adaptiveGradientSolid.addColorStop(0, fillColorSolid[0]);
        adaptiveGradientSolid.addColorStop(
          0.5,
          fillColorSolid[fillColorSolid.length - 2]
        );

        const fillColor = adaptiveColors[1];
        adaptiveGradient.addColorStop(0, fillColor[0]);
        adaptiveGradient.addColorStop(0.5, fillColor[fillColor.length - 2]);

        ctx!.globalCompositeOperation = "color";
        ctx!.fillStyle = adaptiveGradientSolid;
        ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

        // ctx!.globalCompositeOperation = "hard-light";
        // ctx!.fillStyle = adaptiveGradient;
        // ctx!.filter = "contrast(150%)"; // 1.2 ? 120% ?
        // ctx!.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // brightness hack for safari iOS
      const brightnessMask = ctx!.createLinearGradient(...gradientCoords);
      brightnessMask.addColorStop(0, `#000000${adaptiveBgColor ? "75" : "58"}`);

      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = brightnessMask;
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);
    };
  }, [canvasRef, adaptiveBgColor, namecardBg, backgroundImage, adaptiveColors]);

  return (
    <canvas
      className="compact-artifact-bg-canvas"
      width={"100%"}
      height={"100%"}
      style={{
        width: "100%",
        height: "100%",
      }}
      ref={canvasRef}
    />
  );
};
