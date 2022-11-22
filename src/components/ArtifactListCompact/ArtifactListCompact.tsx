import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

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
import { Spinner } from "../Spinner";
import { StatIcon } from "../StatIcon";
import "./style.scss";

type ArtifactListCompactProps = {
  row: any;
};

export const ArtifactListCompact: React.FC<ArtifactListCompactProps> = ({
  row,
}) => {
  const [isFetching, setIsFetching] = useState(true);
  const [artifacts, setArtifacts] = useState<any[]>([]);

  const getArtifacts = async () => {
    setIsFetching(true);
    const _uid = encodeURIComponent(row.uid);
    const _type = encodeURIComponent(row.type);
    const artDetailsURL = `/api/artifacts/${_uid}/${row.characterId}/${_type}`;
    const { data } = await axios.get(artDetailsURL);
    setArtifacts(data.data);
    setIsFetching(false);
  };

  useEffect(() => {
    getArtifacts();
  }, []);

  const reordered = useMemo(
    () => getArtifactsInOrder(artifacts),
    [JSON.stringify(artifacts)]
  );

  const compactList = useMemo(() => {
    return (
      <>
        {reordered.map((artifact: any) => {
          const substatKeys = Object.keys(artifact.substats);
          const className = getArtifactCvClassName(artifact.critValue);

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

  const content = reordered.length > 0 ? compactList : "no artifacts equipped";

  return (
    <div className="flex expanded-row">
      {isFetching ? <Spinner /> : content}
    </div>
  );
};
