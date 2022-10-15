import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

import {
  getArtifactsInOrder,
  normalizeText,
  getArtifactCvClassName,
  isPercent,
  getInGameSubstatValue,
  BACKEND_URL,
  getSubstatEfficiency,
} from "../../utils/helpers";
import { StatIcon } from "../StatIcon";
import "./style.scss";

type ArtifactListCompactProps = {
  row: any;
};

export const ArtifactListCompact: React.FC<ArtifactListCompactProps> = ({
  row,
}) => {
  const [artifacts, setArtifacts] = useState<any[]>([]);

  const getArtifacts = async () => {
    const _uid = encodeURIComponent(row.uid);
    const _type = encodeURIComponent(row.type);
    const artDetailsURL = `${BACKEND_URL}/api/artifacts/${_uid}/${row.characterId}/${_type}`;
    const { data } = await axios.get(artDetailsURL);
    setArtifacts(data.data);
  };

  useEffect(() => {
    getArtifacts();
  }, []);

  const reordered = useMemo(
    () => getArtifactsInOrder(artifacts),
    [JSON.stringify(artifacts)]
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

                const substatValue = getInGameSubstatValue(
                  artifact.substats[key],
                  key
                );
                const isCV = key.includes("Crit");

                const normSubName = normalizeText(key.replace("substats", ""));
                const classNames = [
                  "substat flex nowrap gap-5",
                  normalizeText(normSubName),
                  isCV ? "critvalue" : "",
                ]
                  .join(" ")
                  .trim();

                const opacity = getSubstatEfficiency(
                  normSubName,
                  artifact.substats[key]
                );

                return (
                  <div
                    key={normalizeText(key)}
                    className={classNames}
                    style={{ opacity: opacity }}
                  >
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
      }),
    [JSON.stringify(reordered)]
  );

  return (
    <div className="flex expanded-row">
      {reordered.length > 0 ? compactList : "no artifacts equipped"}
    </div>
  );
};
