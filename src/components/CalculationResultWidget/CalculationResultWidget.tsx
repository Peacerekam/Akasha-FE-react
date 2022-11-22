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
        for (const calc of Object.values(build.calculations)) {
          const _calc = calc as any;
          const { calculationId, variant } = _calc;
          const calcKey = `${calculationId}${variant?.name || ""}`;
          if (!build.calculations[calcKey]?.ranking) continue;
          calcArray.push({
            ...(build.calculations[calcKey] as {}),
            id: calculationId,
            characterName: build.name,
            characterIcon: build.icon,
          });
        }
      }
      const sorted = calcArray.sort((a: any, b: any) =>
        // (a.ranking > b.ranking ? 1 : -1)
        {
          const leaveOnlyNumbersRegex = /\D+/g;
          const _rankingA = +(a.ranking + "")?.replace(
            leaveOnlyNumbersRegex,
            ""
          );
          const _rankingB = +(b.ranking + "")?.replace(
            leaveOnlyNumbersRegex,
            ""
          );

          return _rankingA / a.outOf > _rankingB / b.outOf ? 1 : -1;
        }
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
        const { name, ranking, outOf, weapon, short, id, variant } = calc;
        const shortName = variant?.displayName || short || "---";
        const leaveOnlyNumbersRegex = /\D+/g;
        const _ranking = +(ranking + "")?.replace(leaveOnlyNumbersRegex, "");

        return (
          <div key={`${name}-${weapon.name}`}>
            <a
              title={`${calc.name} - ${weapon.name} R${
                weapon?.refinement || 1
              }`}
              className="highlight-tile"
              onClick={(event) => {
                event.preventDefault();
                navigate(`/leaderboards/${id}/${variant?.name || ""}`);
              }}
              href={`${BASENAME}/leaderboards/${id}/${variant?.name || ""}`}
            >
              <div className="highlight-tile-pill">{shortName}</div>
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
                {ranking ? `top ${Math.ceil((_ranking / outOf) * 100)}%` : ""}
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
