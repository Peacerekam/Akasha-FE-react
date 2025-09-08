import "./style.scss";

import {
  ArtifactBackgroundOnCanvas,
  ArtifactBgOnCanvasProps,
} from "./ArtifactBackgroundOnCanvas";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  cssJoin,
  getArtifactCvClassName,
  getArtifactRvClassName,
  getArtifactsInOrder,
  getInGameSubstatValue,
  getSubstatPercentageEfficiency,
  getSummedArtifactRolls,
  isPercent,
  normalizeText,
} from "../../utils/helpers";

import { ARBadge } from "../ARBadge";
import { AssetFallback } from "../AssetFallback";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RegionBadge } from "../RegionBadge";
import { RollList } from "../RollList";
import { SettingsContext } from "../../context/SettingsProvider/SettingsProvider";
import { StatIcon } from "../StatIcon";
import { TalentsDisplay } from "../TalentsDisplay";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { getDefaultRvFilters } from "../RollList/defaultFilters";
import { roundToFixed } from "../../utils/substats";
import { travelerIds } from "../CharacterCard/TalentDisplay";

type ArtifactListCompactProps = {
  row: any;
  artifacts: any[];
};

type CompactArtifactProps = {
  artifact: any;
  row: any;
  canvasBgProps?: ArtifactBgOnCanvasProps;
  overrideMetric?: "RV" | "CV";
};

export const CompactArtifact: React.FC<CompactArtifactProps> = ({
  artifact,
  row,
  overrideMetric,
  canvasBgProps = null,
}) => {
  const { metric, customRvFilter } = useContext(SettingsContext);

  const _metric = overrideMetric || metric;
  const substatKeys = Object.keys(artifact.substats);
  const className =
    _metric === "CV"
      ? getArtifactCvClassName(artifact)
      : getArtifactRvClassName(row.name, artifact, customRvFilter[row.name]);

  const summedArtifactRolls = getSummedArtifactRolls(artifact);

  const mainStatValue = isPercent(artifact.mainStatKey)
    ? Math.round(artifact.mainStatValue * 10) / 10
    : Math.round(artifact.mainStatValue);

  return (
    <div
      key={`${artifact._id}-${canvasBgProps?.adaptiveBgColor}-${canvasBgProps?.namecardBg}`}
      className={`compact-artifact ${className} metric-${_metric}`}
    >
      {!!canvasBgProps && <ArtifactBackgroundOnCanvas {...canvasBgProps} />}

      {artifact.icon !== null ? (
        <div className="compact-artifact-icon-container">
          <ArtifactOnCanvas icon={artifact.icon} />
          <span className="compact-artifact-main-stat">
            <StatIcon name={artifact.mainStatKey} />
            {mainStatValue}
            {isPercent(artifact.mainStatKey) ? "%" : ""}
          </span>
        </div>
      ) : (
        <div className="no-artifact">×</div>
      )}
      {artifact.icon !== null && (
        <ArtifactMetricDisplay
          row={row}
          artifact={artifact}
          overrideMetric={overrideMetric}
        />
      )}
      <div className="compact-artifact-subs">
        {substatKeys.map((key: any) => {
          if (!key) return <></>;

          const substatValue = getInGameSubstatValue(
            artifact.substats[key],
            key
          );
          const isCV = key.includes("Crit");

          const normSubName = normalizeText(key.replace("substats", ""));

          const isFactored =
            _metric === "CV" ? isCV : !!customRvFilter[row.name]?.includes(key);

          const classNames = cssJoin([
            "substat flex nowrap gap-5",
            normalizeText(normSubName),
            isCV ? "critvalue" : "",
            isFactored ? "rv-relevant" : "rv-not-relevant",
          ]);

          const opacity = getSubstatPercentageEfficiency(
            normSubName,
            artifact.substats[key]
          );

          const rollDots = "•".repeat(summedArtifactRolls[key].count);

          return (
            <div key={normalizeText(key)} className={classNames}>
              <span className="roll-dots" style={{ opacity: opacity }}>
                {rollDots}
              </span>
              <span style={{ opacity: opacity }}>
                <StatIcon name={key} />
              </span>
              <span style={{ opacity: opacity }}>
                {substatValue}
                {isPercent(key) ? "%" : ""}
              </span>
              {isFactored ? <span className="stat-highlight" /> : ""}
            </div>
          );
        })}
      </div>
      {/* <Artifact key={art._id} artifact={art} width={200} /> */}
    </div>
  );
};

export const ArtifactMetricDisplay: React.FC<{
  row: any;
  artifact: any;
  overrideMetric?: "RV" | "CV";
}> = ({ row, artifact, overrideMetric }) => {
  const [displayFormula, setDisplayFormula] = useState<boolean>(false);
  const { metric, setMetric, getArtifactMetricValue, customRvFilter } =
    useContext(SettingsContext);

  const _metric = overrideMetric || metric;

  const substatKeys = Object.keys(artifact.substats);
  const metricValue = getArtifactMetricValue(
    row.name,
    artifact,
    overrideMetric
  );

  const summedArtifactRolls = getSummedArtifactRolls(artifact);
  const characterRvStats =
    customRvFilter[row.name] || getDefaultRvFilters(row.name);

  const critRate = roundToFixed(artifact.substats?.["Crit RATE"] || 0, 1);
  const critDmg = roundToFixed(artifact.substats?.["Crit DMG"] || 0, 1);
  const iconSize = 16;

  const metricMathDisplay = (
    <span className="metric-formula">
      {_metric === "RV" ? (
        substatKeys
          .filter((substatName) => characterRvStats.includes(substatName))
          .map((substatName, index) => {
            const sub = summedArtifactRolls[substatName];
            return (
              <span key={substatName}>
                {index !== 0 ? <span> + </span> : ""}
                <span className="white-space-nowrap">
                  <StatIcon sizeOverride={iconSize} name={substatName} />{" "}
                  {sub.rv} <span className="smol-percentage">%</span>
                </span>
              </span>
            );
          })
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <span className="white-space-nowrap">
            {critRate ? (
              <>
                <StatIcon sizeOverride={iconSize} name={"Crit RATE"} />{" "}
                {critRate} × 2
              </>
            ) : (
              ""
            )}
            {critRate && critDmg ? <span> + </span> : ""}
          </span>
          {critDmg ? (
            <span className="white-space-nowrap">
              <StatIcon sizeOverride={iconSize} name={"Crit DMG"} /> {critDmg}
            </span>
          ) : (
            ""
          )}
        </div>
      )}
    </span>
  );

  const suffix =
    _metric === "CV" ? (
      "cv"
    ) : (
      <>
        <span className="smol-percentage">%</span> RV
      </>
    );

  return (
    <div
      className="compact-artifact-metric-container"
      onMouseEnter={() => setDisplayFormula(true)}
      onMouseLeave={() => setDisplayFormula(false)}
    >
      <span
        className={cssJoin([
          "compact-artifact-crit-value",
          overrideMetric ? "" : "pointer",
        ])}
        onClick={() =>
          !overrideMetric && setMetric(_metric === "CV" ? "RV" : "CV")
        }
        title="Click to toggle between CV and RV"
      >
        {displayFormula ? metricMathDisplay : ""}
        <span>
          <span className="metric-text">
            {metricValue} {suffix}
          </span>
        </span>
        {artifact.rerollNum > 0 && (
          <span>
            <div className="reroll-indicator">
              <span className="metric-text">
                <FontAwesomeIcon icon={faRotateRight} />{" "}
                <span className="reroll-text">×{artifact.rerollNum}</span>
              </span>
            </div>
          </span>
        )}
      </span>
    </div>
  );
};

export const ArtifactOnCanvas: React.FC<{
  icon: string;
  hardcodedScale?: number;
}> = ({ icon, hardcodedScale = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasWidth = 180 * hardcodedScale;
  const canvasHeight = 180 * hardcodedScale;
  const canvasPixelDensity = 2; // doesnt look like 2x is needed at all for artifacts

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

      // Create gradient
      const gradientMask = ctx!.createLinearGradient(
        canvasWidth - 100 * hardcodedScale,
        0,
        canvasWidth - 40 * hardcodedScale,
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
  );
};

export const ArtifactListCompact: React.FC<ArtifactListCompactProps> = ({
  row,
  artifacts,
}) => {
  const { translate, language } = useContext(TranslationContext);
  const { metric, customRvFilter } = useContext(SettingsContext);

  const reordered = useMemo(
    () => getArtifactsInOrder(artifacts, true),
    [JSON.stringify(artifacts)]
  );

  const compactList = useMemo(() => {
    return (
      <>
        <div className="artifacts-row">
          {reordered.map((artifact: any, i: number) => {
            return (
              <CompactArtifact
                key={artifact._id}
                artifact={artifact}
                row={row}
              />
            );
          })}
        </div>
        <RollList artifacts={reordered} character={row.name} />
      </>
    );
  }, [JSON.stringify(reordered), metric, customRvFilter[row.name]?.length]);

  const isTraveler = row.characterId
    ? travelerIds.includes("" + row.characterId)
    : false;

  const element = row?.characterMetadata?.element;
  const suffix = isTraveler
    ? `-${element === "None" ? "Anemo" : element}`.toLowerCase()
    : "";

  const characterId = `${row.characterId}${suffix}`;

  return (
    <div className="flex expanded-row">
      <div className="character-preview">
        <div className="character-type-preview">
          <AssetFallback
            alt=""
            className="table-icon"
            src={row.icon}
            title={row?.name}
          />
          {translate("Lv.")} {row?.propMap?.level?.val || "??"}
          {" - "}
          {row.type === "current" ? translate(row.name) : row.type}
        </div>
        <TalentsDisplay
          row={row}
          strikethrough={false}
          characterId={characterId}
          language={language}
        />
        <div className="character-owner-preview">
          {row.owner.nickname}
          <ARBadge adventureRank={row.owner.adventureRank} />
          <RegionBadge region={row.owner.region} />
        </div>
      </div>
      {reordered.length > 0 ? compactList : "no artifacts equipped"}
    </div>
  );
};
