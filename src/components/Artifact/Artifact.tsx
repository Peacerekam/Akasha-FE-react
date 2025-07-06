import "./style.scss";

import React, { useContext } from "react";
import {
  cssJoin,
  getArtifactCvClassName,
  getCharacterCvColor,
  getInGameSubstatValue,
  getSubstatPercentageEfficiency,
  getSummedArtifactRolls,
  isPercent,
  normalizeText,
} from "../../utils/helpers";

import ArtifactBackground from "../../assets/images/artifact-5star-bg.png";
import { AssetFallback } from "../AssetFallback";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoArtifact from "../../assets/images/no-artifact.png";
import RarityStar from "../../assets/images/star.png";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
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
  const { translate } = useContext(TranslationContext);

  const artifactBg =
    {
      5: ArtifactBackground,
      // @TODO: add more background to artifacts
      // 4: ArtifactBackground,
      // 3: ArtifactBackground,
      // 2: ArtifactBackground,
      // 1: ArtifactBackground,
      4: NoArtifact,
      3: NoArtifact,
      2: NoArtifact,
      1: NoArtifact,
    }[artifact?.stars] || NoArtifact;

  // const artifactHue = {
  //   5: '0deg',
  //   4: '-120deg',
  //   3: '-200deg',
  //   2: '0deg',
  //   1: '0deg',
  // }[artifact?.stars]

  const style = {
    "--artifact-bg": `url(${artifactBg})`,
    "--artifact-width": `${width}px`,
    // "filter": `hue-rotate(${artifactHue})`
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

  return (
    <div
      style={style}
      className={`profile-page-artifact ${getArtifactCvClassName(artifact)}`}
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
      ) : (
        ""
      )}
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
          const rollsNum = showRollsNum ? summedArtifactRolls[key].count : "·";

          return (
            <div
              data-rolls-num={rollsNum}
              style={{ opacity }}
              key={normSubName}
              className={cssJoin([
                "substat",
                normSubName,
                isCV ? "critvalue" : "",
                showRollsNum ? "show-rolls-num" : ""
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
      <div className="artifact-set-name">{translate(artifact.setName)}</div>
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
