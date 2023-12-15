import {
  REAL_SUBSTAT_VALUES,
  STAT_NAMES,
  getSubstatEfficiency,
} from "../../utils/substats";
import React, { useCallback, useMemo, useState } from "react";
import {
  allSubstatsInOrder,
  getInGameSubstatValue,
  isPercent,
} from "../../utils/helpers";

import { StatIcon } from "../StatIcon";
import { getDefaultRvFilters } from "./defaultFilters";

type RollListProps = {
  artifacts: any[];
  character: string;
};

export const RollList: React.FC<RollListProps> = ({ artifacts, character }) => {
  const [filter, setFilter] = useState<string[]>(
    getDefaultRvFilters(character)
  );

  const summedTotalArtifactRolls: {
    [key: string]: { count: number; sum: number; rv: number };
  } = artifacts?.reduce((acc: any, artifact: any) => {
    for (const id of artifact.substatsIdList) {
      const { value, type } = REAL_SUBSTAT_VALUES[id];
      const realStatName = STAT_NAMES[type];

      acc[realStatName] = {
        count: (acc[realStatName]?.count ?? 0) + 1,
        sum: (acc[realStatName]?.sum ?? 0) + value,
        rv: (acc[realStatName]?.rv ?? 0) + 123,
      };
    }
    return acc;
  }, {});

  const highestCount = useMemo(() => {
    const _arr = Object.values(summedTotalArtifactRolls);
    if (_arr.length === 0) return null;
    return Math.max(
      ...Object.values(summedTotalArtifactRolls).map((o) => o.count)
    );
  }, [summedTotalArtifactRolls]);

  const displayRolls = useMemo(
    () =>
      allSubstatsInOrder
        .filter((key) => Object.keys(summedTotalArtifactRolls).includes(key))
        .map((key) => {
          if (!highestCount) return null;

          const readableValue = getInGameSubstatValue(
            summedTotalArtifactRolls[key].sum,
            key
          );
          const count = summedTotalArtifactRolls[key].count;
          const opacity = Math.min(
            Math.max(count / (highestCount - 5), 0.35),
            1
          );

          const toggleFilter = (key: string) => {
            setFilter((prev) => {
              const arr = [...prev];
              const index = arr.indexOf(key);
              if (index > -1) {
                arr.splice(index, 1);
              } else {
                arr.push(key);
              }
              return arr;
            });
          };

          const className = [
            "roll-list-member x-prefix",
            filter.includes(key) ? "active-rv" : "",
          ]
            .join(" ")
            .trim();

          return (
            <div
              key={key}
              className={className}
              onClick={() => toggleFilter(key)}
            >
              <span>
                <span>{count}</span>
                <span style={{ opacity }}>
                  <StatIcon name={key} />
                  <span>
                    {readableValue}
                    {isPercent(key) ? "%" : ""}
                  </span>
                </span>
              </span>
            </div>
          );
        }),
    [highestCount, summedTotalArtifactRolls, filter]
  );

  const getTotalRV = useCallback(() => {
    const accumulator = filter.reduce((accumulator, key) => {
      const sum = summedTotalArtifactRolls[key]?.sum || 0;
      const eff = getSubstatEfficiency(sum, key);
      return (accumulator += eff);
    }, 0);

    return accumulator;
  }, [filter]);

  const getTotalSubsCount = useCallback(() => {
    const accumulator = filter.reduce((accumulator, key) => {
      const count = summedTotalArtifactRolls[key]?.count || 0;
      return (accumulator += count);
    }, 0);

    return accumulator;
  }, [filter]);

  return (
    <div className="total-roll-list-wrapper">
      <div className="total-roll-list">
        {displayRolls}
        {highestCount !== null && (
          <div className="roll-list-member total-roll-rv">
            <span>
              <span>×{getTotalSubsCount()}</span>
            </span>
            <span style={{ marginRight: 5 }}>•</span>
            <span>
              <span>RV</span>
              <span>{getTotalRV()}%</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
