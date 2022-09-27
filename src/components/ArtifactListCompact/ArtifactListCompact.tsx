import axios from "axios";
import React, { useMemo } from "react";

import {
  getArtifactsInOrder,
  normalizeText,
  getArtifactCvClassName,
  isPercent,
  getInGameSubstatValue,
} from "../../utils/helpers";
import { StatIcon } from "../StatIcon";
import "./style.scss";

export const ArtifactListCompact = ({ row }: any) => {
  const reordered = useMemo(
    () => getArtifactsInOrder(row.artifactObjects),
    [row]
  );

  const compactList = useMemo(
    () =>
      reordered.map((artifact: any) => {
        const substatKeys = Object.keys(artifact.substats);
        const className = getArtifactCvClassName(artifact.critValue);

        return (
          <div
            key={artifact._id}
            className={`flex compact-artifact ${className}`}
          >
            <div className="compact-artifact-icon-container">
              <img className="compact-artifact-icon" src={artifact.icon} />
              <span className="compact-artifact-crit-value">
                <span>{Math.round(artifact.critValue * 10) / 10} cv</span>
              </span>
              <span className="compact-artifact-main-stat">
                <StatIcon name={artifact.mainStatKey} />
                {artifact.mainStatValue}
                {isPercent(artifact.mainStatKey) ? "%" : ""}
              </span>
            </div>
            <div className="compact-artifact-subs">
              {substatKeys.map((key: any) => {
                if (!key) return <></>;

                const substatValue = getInGameSubstatValue(artifact.substats[key], key);
                const isCV = key.includes("Crit");

                return (
                  <div
                    
                    key={normalizeText(key)}
                    className={`substat flex nowrap ${normalizeText(
                      key.replace("substats", "")
                    )} ${isCV ? "critvalue" : ""}`}
                  >
                    <span style={{ marginRight: "5px" }}>
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
      }),
    [row]
  );

  // @KM: @TODO: remove later or rework
  // if (!data.artifactsObjects) {
  //   return <ArtifactDetails artifactId={data._id} />;
  // }

  return (
    <div className="flex expanded-row">
      {reordered.length > 0 ? compactList : "no artifacts equipped"}
    </div>
  );
};