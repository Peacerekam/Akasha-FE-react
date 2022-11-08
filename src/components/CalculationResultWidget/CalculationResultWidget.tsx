import axios from "axios";
import React, { useMemo, useState, useEffect } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useNavigate } from "react-router-dom";
import { BASENAME } from "../../App";
import { abortSignalCatcher } from "../../utils/helpers";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import "./style.scss";

type CalculationResultWidgetProps = {
  uid?: string;
};

export const CalculationResultWidget: React.FC<
  CalculationResultWidgetProps
> = ({ uid }) => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();
  const pathname = window.location.pathname;

  const fetchCalcData = async (
    uid: string,
    abortController: AbortController
  ) => {
    const _uid = encodeURIComponent(uid);
    const fetchURL = `/api/leaderboards/calculations/${_uid}`;
    const opts = {
      signal: abortController.signal,
    } as any;

    const getSetData = async () => {
      const response = await axios.get(fetchURL, opts);
      const { data } = response.data;
      setData(data);
    };

    await abortSignalCatcher(getSetData);
  };

  useEffect(() => {
    if (uid) {
      const abortController = new AbortController();
      fetchCalcData(uid, abortController);
      return () => {
        abortController.abort();
      };
    }
  }, [uid]);

  const resultsArray = useMemo(() => {
    if (data.length > 0 && data[0].characterId) {
      const filtered = data.filter(
        (r) => Object.keys(r.calculations).length > 0
      );

      const calcArray = [];
      for (const build of filtered) {
        for (const calcID of Object.keys(build.calculations)) {
          calcArray.push({
            ...(build.calculations[calcID] as {}),
            id: calcID,
            characterName: build.name,
            characterIcon: build.icon,
          });
        }
      }
      const sorted = calcArray.sort((a: any, b: any) =>
        a.ranking > b.ranking ? 1 : -1
      );

      // group by character name instead
      // on hover show other results
      const finalArr = [];
      const tmpIncludeCheck: any[] = [];
      for (const calc of sorted) {
        if (tmpIncludeCheck.includes(calc.characterName)) continue;
        tmpIncludeCheck.push(calc.characterName);
        finalArr.push(calc);
      }

      return finalArr;
    }
    return [];
  }, [data]);

  const tilesList = useMemo(
    () =>
      resultsArray.map((calc: any, index: number) => {
        const { name, ranking, outOf, weapon, short, id } = calc;
        return (
          <div key={`${name}-${weapon.name}`}>
            <a
              title={`${calc.name} - ${weapon.name} R${
                weapon?.refinement || 1
              }`}
              className="highlight-tile"
              onClick={(event) => {
                event.preventDefault();
                navigate(`/leaderboards/${id}`);
              }}
              href={`${BASENAME}/leaderboards/${id}`}
            >
              <div className="highlight-tile-pill">{short ? short : "---"}</div>
              <div className="flex">
                <img
                  alt="Icon"
                  className="table-icon"
                  src={calc.characterIcon}
                />
                <WeaponMiniDisplay
                  icon={weapon.icon}
                  refinement={weapon?.refinement || 1}
                />
              </div>
              <div>
                {ranking ? `top ${Math.ceil((ranking / outOf) * 100)}%` : ""}
              </div>
              <span>
                {ranking ?? "---"}
                <span className="opacity-5">/{outOf ?? "---"}</span>
              </span>
            </a>
          </div>
        );
      }),
    [resultsArray]
  );

  return (
    <div>
      {tilesList.length > 0 ? (
        <PerfectScrollbar>
          <div
            className="highlight-tile-container"
            style={{ position: "relative" }}
          >
            {tilesList}
          </div>
        </PerfectScrollbar>
      ) : null}
    </div>
  );
};
