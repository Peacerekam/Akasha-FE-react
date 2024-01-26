import "./style.scss";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { abortSignalCatcher, toShortThousands } from "../../utils/helpers";

import PerfectScrollbar from "react-perfect-scrollbar";
import { SettingsContext } from "../../context/SettingsProvider/SettingsProvider";
import { Spinner } from "../Spinner";
// import { Timer } from "../Timer";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type CalculationResultWidgetProps = {
  uid?: string;
  noLinks?: boolean;
};

export const CalculationResultWidget: React.FC<
  CalculationResultWidgetProps
> = ({ uid, noLinks = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  // const [retryTimer, setRetryTimer] = useState<number | null>(null);
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

  const { getTopRanking } = useContext(SettingsContext);

  const fetchCalcData = async (
    uid: string,
    abortController?: AbortController
  ) => {
    const _uid = encodeURIComponent(uid);
    const fetchURL = `/api/getCalculationsForUser/${_uid}`;
    const opts = {
      signal: abortController?.signal,
    } as any;

    const getSetData = async () => {
      setIsLoading(true);
      const response = await axios.get(fetchURL, opts);
      const { data } = response.data;
      setData(data);
      setIsLoading(false);

      if (!abortController) return;

      // "does it have any valid rankings in it?"
      for (const build of data) {
        if (
          build.calculations?.fit?.ranking ||
          build.calculations?.best?.ranking
        ) {
          return;
        }
      }

      // if no valid rankings at all then retry in 60s
      // const getTime = new Date().getTime();
      // const thenTTL = getTime + 59000;
      // setRetryTimer(thenTTL);
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
    if (data.length > 0) {
      const calcArray = [];
      for (const build of data) {
        const calcsArr = [
          build.calculations.fit,
          // build.calculations.best
        ];

        for (const calc of calcsArr) {
          const _calc = calc as any;
          const {
            calculationId,
            // variant
          } = _calc;
          // const calcKey = `${calculationId}${variant?.name || ""}`;
          if (!calc?.ranking) continue;

          calcArray.push({
            ...calc,
            id: calculationId,
            characterName: build.name,
            characterIcon: build.icon,
            priority: calc?.priority,
          });
        }
      }

      const sortFn = (a: any, b: any) =>
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

          const topA_ = _rankingA / a.outOf;
          const topB_ = _rankingB / b.outOf;

          const isTop1_a = Math.min(100, Math.ceil(topA_ * 100)) === 1;
          const isTop1_b = Math.min(100, Math.ceil(topB_ * 100)) === 1;

          if (isTop1_a && isTop1_b) {
            return _rankingA - _rankingB;
          }

          return topA_ > topB_ ? 1 : -1;

          // return isTop1_a && isTop1_b
          //   ? _rankingA - _rankingB
          //   : topA_ > topB_
          //   ? 1
          //   : -1;

          // return _rankingA > _rankingB ? 1 : -1;
        };

      const sorted = calcArray.sort(sortFn);

      // group by character name instead
      // on hover show other results
      const finalArr: any[] = [];
      const tmpIncludeCheck: { [key: string]: number } = {};

      for (let i = 0; i < sorted.length; i++) {
        const calc = sorted[i];
        const index = finalArr.findIndex(
          (c) => c.characterName === calc.characterName
        );

        if (index > -1) {
          if (calc.priority <= tmpIncludeCheck[calc.characterName]) continue;
          finalArr[index] = calc;
        } else {
          finalArr.push(calc);
        }

        tmpIncludeCheck[calc.characterName] = calc.priority;
      }

      return finalArr.sort(sortFn);
    }
    return [];
  }, [data]);

  const tilesList = useMemo(
    () =>
      resultsArray
        .filter((c) => !!c.outOf)
        .map((calc: any, index: number) => {
          const { name, ranking, outOf, weapon, short, id, variant, priority } =
            calc;
          const shortName = variant?.displayName || short || "---";
          const leaveOnlyNumbersRegex = /\D+/g;
          const _ranking = +(ranking + "")?.replace(leaveOnlyNumbersRegex, "");

          let weaponMatchClass = "";
          let weaponMatchString = "";

          switch (priority) {
            case 2:
              weaponMatchClass = "matching-weapon";
              weaponMatchString = "Leaderboard weapon matches equipped weapon";
              break;
            case 1:
              weaponMatchClass = "almost-matching-weapon";
              weaponMatchString =
                "Leaderboard weapon has the same substat as equipped weapon";
              break;
            case 0:
              weaponMatchClass = "mismatching-weapon";
              weaponMatchString =
                "Leaderboard weapon does not match equipped weapon";
              break;
          }

          const _percentage = getTopRanking(_ranking, outOf);
          const _top = ranking ? `top ${_percentage || "?"}%` : "";

          return (
            <div key={`${name}-${weapon.name}`} className={weaponMatchClass}>
              <a
                title={`${weaponMatchString}\n${calc.name} - ${weapon.name} R${
                  weapon?.refinement || 1
                }`}
                className={`highlight-tile ${
                  noLinks ? "pointer-events-none" : ""
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/leaderboards/${id}/${variant?.name || ""}`);
                }}
                href={`/leaderboards/${id}/${variant?.name || ""}`}
              >
                {/* <div className="highlight-tile-pill">{shortName}</div> */}
                {variant?.displayName ? (
                  <div className="highlight-tile-pill stacked">
                    <div className="stacked-top">{short}</div>
                    <div className="stacked-bottom">{variant?.displayName}</div>
                  </div>
                ) : (
                  <div className="highlight-tile-pill">{shortName}</div>
                )}
                <div className="flex">
                  <img
                    alt="Icon"
                    className="table-icon"
                    src={calc.characterIcon}
                  />
                  <WeaponMiniDisplay
                    icon={weapon.icon}
                    refinement={weapon?.refinement || 1}
                    // style={{ boxShadow: `0 0 0px 2px ${weaponColor}20` }}
                  />
                </div>
                <div>{_top}</div>
                <span>
                  {ranking ?? "---"}
                  <span className="opacity-5">
                    /{toShortThousands(outOf) ?? "---"}
                  </span>
                </span>
              </a>
            </div>
          );
        }),
    [resultsArray, getTopRanking]
  );

  if (isLoading) {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Spinner />
        </div>
      </>
    );
  }

  // const handleFinishTimer = async () => {
  //   if (uid) await fetchCalcData(uid);
  //   setRetryTimer(0);
  // };

  return (
    <>
      {tilesList.length > 0 ? (
        <PerfectScrollbar>
          <div
            className="highlight-tile-container"
            style={{ position: "relative" }}
          >
            {tilesList}
          </div>
        </PerfectScrollbar>
      ) : (
        <div className="retrying-timer">
          <div className="retrying-timer-label">no highlights available</div>
        </div>
      )}

      {/* {retryTimer ? (
        <div className="retrying-timer">
          <div className="retrying-timer-label">Reloading highlights in:</div>
          <Timer until={retryTimer} onFinish={handleFinishTimer} />
        </div>
      ) : tilesList.length === 0 && retryTimer === 0 ? (
        <div className="retrying-timer">
          <div className="retrying-timer-label">no highlights available</div>
        </div>
      ) : null} */}
    </>
  );
};
