import React, { useCallback, useMemo, useState } from "react";
import {
  allSubstatsInOrder,
  getInGameSubstatValue,
  isPercent,
} from "../../utils/helpers";
import {
  getSubstatEfficiency,
  REAL_SUBSTAT_VALUES,
  STAT_NAMES,
} from "../../utils/substats";
import { StatIcon } from "../StatIcon";
import "./style.scss";

type RollListProps = {
  artifacts: any[];
  character: string;
};

const getDefaultRvFilters = (character: string) => {
  return (
    {
      "Hu Tao": ["Crit RATE", "Crit DMG", "HP%", "Elemental Mastery"],
      Diluc: ["Crit RATE", "Crit DMG", "ATK%", "Elemental Mastery"],
      Xiao: ["Crit RATE", "Crit DMG", "ATK%", "Energy Recharge"],
      Jean: [
        "Crit RATE",
        "Crit DMG",
        "ATK%",
        "Energy Recharge",
        "Elemental Mastery",
      ],
      Noelle: ["Crit RATE", "Crit DMG", "DEF%", "ATK%"],
      Albedo: ["Crit RATE", "Crit DMG", "DEF%"],
      Keqing: ["Crit RATE", "Crit DMG", "ATK%"],
      Razor: ["Crit RATE", "Crit DMG", "ATK%"],
      Klee: ["Crit RATE", "Crit DMG", "ATK%"],
      Zhongli: ["Crit RATE", "Crit DMG", "ATK%", "HP%"],
      Yoimiya: ["Crit RATE", "Crit DMG", "ATK%", "Elemental Mastery"],
      Yelan: ["Crit RATE", "Crit DMG", "HP%", "Energy Recharge"],
      "Kamisato Ayaka": ["Crit RATE", "Crit DMG", "Energy Recharge", "ATK%"],
      "Kamisato Ayato": ["Crit RATE", "Crit DMG", "ATK%"],
      "Arataki Itto": ["Crit RATE", "Crit DMG", "DEF%", "ATK%"],
      Eula: ["Crit RATE", "Crit DMG", "Energy Recharge", "ATK%"],
      Mona: [
        "Crit RATE",
        "Crit DMG",
        "Energy Recharge",
        "Elemental Mastery",
        "ATK%",
      ],
      Ganyu: ["Crit RATE", "Crit DMG", "ATK%", "Elemental Mastery"],
      "Raiden Shogun": ["Crit RATE", "Crit DMG", "ATK%", "Energy Recharge"],
      Xingqiu: ["Crit RATE", "Crit DMG", "ATK%", "Energy Recharge"],
      Xiangling: [
        "Crit RATE",
        "Crit DMG",
        "ATK%",
        "Elemental Mastery",
        "Energy Recharge",
      ],
      Diona: ["HP%", "Energy Recharge"],
      Nilou: ["Crit RATE", "Crit DMG", "HP%", "Flat HP"],
      Tartaglia: ["Crit RATE", "Crit DMG", "ATK%", "Elemental Mastery"],
      Venti: ["Elemental Mastery"],
      "Kaedehara Kazuha": ["Elemental Mastery"],
      Sayu: ["Elemental Mastery%"],
      Bennett: ["Energy Recharge", "HP%", "Crit RATE", "Crit DMG"],
      Beidou: ["Energy Recharge", "ATK%", "Crit RATE", "Crit DMG"],
      Fischl: ["ATK%", "Crit RATE", "Crit DMG"],
      "Yae Miko": [
        "Energy Recharge",
        "ATK%",
        "Crit RATE",
        "Crit DMG",
        "Elemental Mastery",
      ],
      Nahida: ["Crit RATE", "Crit DMG", "ATK%", "Elemental Mastery"],
      "Sangonomiya Kokomi": ["Flat HP", "HP%", "Energy Recharge"],
    }[character] || ["Crit RATE", "Crit DMG"]
  );
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

  const highestCount = useMemo(
    () =>
      Math.max(...Object.values(summedTotalArtifactRolls).map((o) => o.count)),
    [summedTotalArtifactRolls]
  );

  const displayRolls = useMemo(
    () =>
      allSubstatsInOrder
        .filter((key) => Object.keys(summedTotalArtifactRolls).includes(key))
        .map((key) => {
          const readableValue = getInGameSubstatValue(
            summedTotalArtifactRolls[key].sum,
            key
          );
          const _count = summedTotalArtifactRolls[key].count;
          const opacity = Math.min(
            Math.max(_count / (highestCount - 5), 0.35),
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
                <span>{_count}</span>
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
    let accumulator = 0;
    for (const key of filter) {
      if (summedTotalArtifactRolls[key]) {
        accumulator += getSubstatEfficiency(
          summedTotalArtifactRolls[key].sum,
          key
        );
      }
    }
    return accumulator;
  }, [filter]);

  return (
    <div className="total-roll-list">
      {displayRolls}
      <div className="roll-list-member total-roll-rv">
        <span>
          <span>RV</span>
          <span>{getTotalRV()}%</span>
        </span>
      </div>
    </div>
  );
};
