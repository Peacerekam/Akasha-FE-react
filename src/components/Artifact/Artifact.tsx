import React from "react";
import {
  getArtifactCvClassName,
  getCharacterCvColor,
  getInGameSubstatValue,
  isPercent,
  normalizeText,
} from "../../utils/helpers";

// img assets
import ArtifactBackground from "../../assets/images/artifact-5star-bg.png";
import NoArtifact from "../../assets/images/no-artifact.png";
import RarityStar from "../../assets/images/star.png";

import "./style.scss";

type ArtifactProps = {
  artifact: {
    [key: string]: any;
    stars: number;
  };
  width?: any;
  equipped?: any;
};

export const Artifact: React.FC<ArtifactProps> = ({
  artifact,
  width = 270,
  equipped,
}) => {
  const artifactBg = {
    5: ArtifactBackground,
    // @KM: @TODO: add more background to artifacts
    4: NoArtifact,
    3: NoArtifact,
    2: NoArtifact,
    1: NoArtifact,
  }[artifact?.stars];

  const style = {
    "--artifact-bg": `url(${artifactBg})`,
    "--artifact-width": `${width}px`,
  } as React.CSSProperties;

  const mainStatKey = artifact.mainStatKey
    ?.replace("Flat ", "")
    ?.replace("%", "");

  const isPercenrage =
    artifact.mainStatKey?.endsWith("%") ||
    artifact.mainStatKey?.endsWith("Bonus") ||
    ["Energy Recharge"].includes(artifact.mainStatKey);

  return (
    <div
      style={style}
      className={`profile-page-artifact ${getArtifactCvClassName(
        artifact.critValue
      )}`}
    >
      <div className="artifact-name">{artifact.name}</div>
      <div className="artifact-crit-value">
        {artifact.critValue > 0 ? `${artifact.critValue.toFixed(1)} cv` : ""}
      </div>
      <div className="artifact-stat-name">{mainStatKey}</div>
      <div className="artifact-stat-value">
        {artifact.mainStatValue}
        {isPercenrage ? "%" : ""}
      </div>
      <div className="artifact-level">+{artifact.level - 1}</div>
      <div className="artifact-rarity">
        {[...Array(artifact.stars)].map((e, i) => (
          <img key={`star-${i}`} src={RarityStar} />
        ))}
      </div>
      <img className="artifact-icon" src={artifact.icon} />
      <div className="substats">
        {Object.keys(artifact.substats).map((key: any) => {
          const substatName = key.replace("%", "").replace("RATE", "Rate");
          const substatValue = getInGameSubstatValue(
            artifact.substats[key],
            key
          );
          const isCV = key.includes("Crit");
          return (
            <div
              key={normalizeText(key)}
              className={`substat ${normalizeText(key)} ${
                isCV ? "critvalue" : ""
              }`}
            >
              {substatName.replace("Flat ", "")}+{substatValue}
              {isPercent(key) ? "%" : ""}
            </div>
          );
        })}
      </div>
      <div className="artifact-set-name">{artifact.setName}</div>
      {equipped && equipped.length > 0 && (
        <div className="artifact-equipped-char">
          {equipped.map((build: any, index: number) => {
            const cv = build?.critValue || 0;
            const borderColor = getCharacterCvColor(cv);
            const style = {
              backgroundImage: `url(${build.nameCardLink})`,
              boxShadow: `0 0 0 2px ${borderColor}`,
              backgroundPosition: "center",
            } as React.CSSProperties;

            return (
              <img
                key={`${build.characterId}-${index}`}
                src={build.icon}
                style={style}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
