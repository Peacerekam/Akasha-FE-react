import React, { useMemo, useRef, useEffect } from "react";

import {
  getArtifactsInOrder,
  normalizeText,
  getArtifactCvClassName,
  isPercent,
  getInGameSubstatValue,
  getSubstatPercentageEfficiency,
} from "../../utils/helpers";
import { REAL_SUBSTAT_VALUES, STAT_NAMES } from "../../utils/substats";
import { RollList } from "../RollList";
import { StatIcon } from "../StatIcon";
import "./style.scss";

type ArtifactListCompactProps = {
  row: any;
  artifacts: any[];
};

export const ArtifactOnCanvas: React.FC<{ icon: string }> = ({ icon }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasWidth = 180;
  const canvasHeight = 180;
  const canvasPixelDensity = 2;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx!.scale(canvasPixelDensity, canvasPixelDensity);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = icon;

    img.onload = () => {
      if (!canvasRef.current) return;

      // Once the image is loaded, we will get the width & height of the image
      // let loadedImageWidth = img.width;
      // let loadedImageHeight = img.height;

      // get the scale
      // it is the min of the 2 ratios
      const scaleFactor = Math.max(
        canvasWidth / img.width,
        canvasHeight / img.height
      );

      // Finding the new width and height based on the scale factor
      const newWidth = img.width * scaleFactor;
      const newHeight = img.height * scaleFactor;

      // get the top left position of the image
      // in order to center the image within the canvas
      const x = canvasWidth / 2 - newWidth / 2;
      const y = canvasHeight / 2 - newHeight / 2;

      // get canvas context
      const ctx = canvasRef.current.getContext("2d");

      // Create gradient
      const gradientMask = ctx!.createLinearGradient(
        canvasWidth - 100,
        0,
        canvasWidth - 40,
        0
      );
      gradientMask.addColorStop(0, "black");
      gradientMask.addColorStop(1, "transparent");

      // mask-image: linear-gradient(to right, black 45%, transparent 100%);

      // clear canvas
      ctx!.globalCompositeOperation = "source-out";
      ctx!.clearRect(0, 0, canvasWidth, canvasHeight);

      // Fill with gradient
      ctx!.fillStyle = gradientMask;
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx!.globalCompositeOperation = "source-in";
      ctx!.drawImage(img, x, y, newWidth, newHeight);
    };

  }, [canvasRef]);
  
  // return <img className="compact-artifact-icon" src={icon} />;

  return (
    <canvas
      className="compact-artifact-icon"
      height={canvasHeight * canvasPixelDensity}
      width={canvasWidth * canvasPixelDensity}
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}
      ref={canvasRef}
  />
  )
};

export const ArtifactListCompact: React.FC<ArtifactListCompactProps> = ({
  row,
  artifacts,
}) => {
  const reordered = useMemo(
    () => getArtifactsInOrder(artifacts),
    [JSON.stringify(artifacts)]
  );

  const compactList = useMemo(() => {
    return (
      <>
        {reordered.map((artifact: any) => {
          const substatKeys = Object.keys(artifact.substats);
          const className = getArtifactCvClassName(artifact);

          const summedArtifactRolls: {
            [key: string]: { count: number; sum: number };
          } = artifact.substatsIdList.reduce((acc: any, id: number) => {
            const { value, type } = REAL_SUBSTAT_VALUES[id];
            const realStatName = STAT_NAMES[type];
            return {
              ...acc,
              [realStatName]: {
                count: (acc[realStatName]?.count ?? 0) + 1,
                sum: (acc[realStatName]?.sum ?? 0) + value,
              },
            };
          }, {});

          const mainStatValue = isPercent(artifact.mainStatKey)
            ? Math.round(artifact.mainStatValue * 10) / 10
            : Math.round(artifact.mainStatValue);

          return (
            <div
              key={artifact._id}
              className={`flex compact-artifact ${className}`}
            >
              <div className="compact-artifact-icon-container">
                <ArtifactOnCanvas icon={artifact.icon} />
                <span className="compact-artifact-crit-value">
                  <span>{Math.round(artifact.critValue * 10) / 10} cv</span>
                </span>
                <span className="compact-artifact-main-stat">
                  <StatIcon name={artifact.mainStatKey} />
                  {mainStatValue}
                  {isPercent(artifact.mainStatKey) ? "%" : ""}
                </span>
              </div>
              <div className="compact-artifact-subs">
                {substatKeys.map((key: any) => {
                  if (!key) return <></>;

                  const substatValue = getInGameSubstatValue(
                    artifact.substats[key],
                    key
                  );
                  const isCV = key.includes("Crit");

                  const normSubName = normalizeText(
                    key.replace("substats", "")
                  );
                  const classNames = [
                    "substat flex nowrap gap-5",
                    normalizeText(normSubName),
                    isCV ? "critvalue" : "",
                  ]
                    .join(" ")
                    .trim();

                  const opacity = getSubstatPercentageEfficiency(
                    normSubName,
                    artifact.substats[key]
                  );

                  const rollDots = "•".repeat(summedArtifactRolls[key].count);

                  return (
                    <div
                      key={normalizeText(key)}
                      className={classNames}
                      style={{ opacity: opacity }}
                    >
                      <span className="roll-dots">{rollDots}</span>
                      <span>
                        <StatIcon name={key} />
                      </span>
                      {substatValue}
                      {isPercent(key) ? "%" : ""}
                    </div>
                  );
                })}
              </div>
              {/* <Artifact key={art._id} artifact={art} width={200} /> */}
            </div>
          );
        })}
        <RollList artifacts={reordered} character={row.name} />
      </>
    );
  }, [JSON.stringify(reordered)]);

  return (
    <div className="flex expanded-row">
      {reordered.length > 0 ? compactList : "no artifacts equipped"}
    </div>
  );
};
