import "./style.scss";

import React, { useContext } from "react";
import {
  artifactIdFromIcon,
  cssJoin,
  equipTypeOrder,
  getArtifactCvClassName,
  getCharacterCvColor,
  getInGameSubstatValue,
  getSubstatPercentageEfficiency,
  getSummedArtifactRolls,
  isPercent,
  normalizeText,
} from "../../utils/helpers";

import { AssetFallback } from "../AssetFallback";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoArtifact from "../../assets/images/no-artifact.png";
import RarityStar from "../../assets/images/star.png";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import bgRarity1 from "../../assets/images/artifact-1star-bg.png";
import bgRarity2 from "../../assets/images/artifact-2star-bg.png";
import bgRarity3 from "../../assets/images/artifact-3star-bg.png";
import bgRarity4 from "../../assets/images/artifact-4star-bg.png";
import bgRarity5 from "../../assets/images/artifact-5star-bg.png";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { fixCritValue } from "../../utils/substats";

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
  const { translate, language } = useContext(TranslationContext);

  const artifactBg =
    {
      5: bgRarity5,
      4: bgRarity4,
      3: bgRarity3,
      2: bgRarity2,
      1: bgRarity1,
    }[artifact?.stars] || NoArtifact;

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
    ["Energy Recharge", "Crit RATE", "Crit DMG"].includes(artifact.mainStatKey);

  const summedArtifactRolls = getSummedArtifactRolls(artifact);

  const mainStatValue = isPercenrage
    ? Math.round(artifact.mainStatValue * 10) / 10
    : Math.round(artifact.mainStatValue);

  const critValue = fixCritValue(artifact);

  const artifactTooltip = {
    "data-gi-type": "artifact",
    "data-gi-id": artifactIdFromIcon(artifact.icon),
    "data-gi-index": equipTypeOrder.indexOf(artifact.equipType), // 0 = Flower
    "data-gi-lang": language,
  };

  return (
    <div
      style={style}
      className={`profile-page-artifact ${getArtifactCvClassName(artifact)}`}
      translate="no"
    >
      <div className="artifact-name">{translate(artifact.name)}</div>
      <div className="artifact-crit-value">
        {critValue > 0 ? `${critValue} cv` : ""}
      </div>
      {artifact.rerollNum ? (
        <div className="artifact-reroll-num">
          <FontAwesomeIcon icon={faRotateRight} />{" "}
          <span className="reroll-text">×{artifact.rerollNum}</span>
        </div>
      ) : null}
      <div className="artifact-stat-name">{translate(mainStatKey)}</div>
      <div className="artifact-stat-value">
        {mainStatValue}
        {isPercenrage ? "%" : ""}
      </div>
      <div className="artifact-level">+{artifact.level - 1}</div>
      <div className="artifact-rarity">
        {[...Array(artifact.stars)].map((e, i) => (
          <img alt="*" key={`star-${i}`} src={RarityStar} />
        ))}
      </div>
      <AssetFallback
        className="artifact-icon"
        src={artifact.icon}
        key={artifact.icon}
        {...artifactTooltip}
        isArtifact
      />
      <div className="substats">
        {Object.keys(artifact.substats).map((key: any) => {
          const substatName = key.replace("%", "").replace("RATE", "Rate");
          const substatValue = getInGameSubstatValue(
            artifact.substats[key],
            key
          );
          const isCV = key.includes("Crit");
          const normSubName = normalizeText(key);
          const opacity = getSubstatPercentageEfficiency(
            normSubName,
            artifact.substats[key]
          );

          const showRollsNum = summedArtifactRolls[key].count > 1;
          const rollsNum = showRollsNum
            ? summedArtifactRolls[key].count - 1
            : "·";

          return (
            <div
              data-rolls-num={rollsNum}
              style={{ opacity }}
              key={normSubName}
              className={cssJoin([
                "substat",
                normSubName,
                isCV ? "critvalue" : "",
                showRollsNum ? "show-rolls-num" : "",
              ])}
            >
              <span className="substat-name">
                {translate(substatName.replace("Flat ", ""))}
              </span>
              <span className="substat-value">
                +{substatValue}
                {isPercent(key) ? "%" : ""}
              </span>
              <span className="rv-display">{summedArtifactRolls[key].rv}%</span>
            </div>
          );
        })}
      </div>
      <div className="artifact-set-name" {...artifactTooltip}>
        {translate(artifact.setName)}
      </div>
      {equipped && equipped.length > 0 && (
        <div className="artifact-equipped-char">
          {equipped.map((build: any, index: number) => {
            const cv = build?.critValue || 0;

            let borderColor = getCharacterCvColor(cv);
            if (borderColor === "rainbow") borderColor = "red";

            const style = {
              backgroundImage: `url(${build.nameCardLink})`,
              boxShadow: `0 0 0 2px ${borderColor}`,
              backgroundPosition: "center",
            } as React.CSSProperties;

            return (
              <AssetFallback
                alt=""
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
