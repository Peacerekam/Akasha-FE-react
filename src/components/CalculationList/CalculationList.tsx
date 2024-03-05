import "./style.scss";

import { CalculationTeammate, TeammatesCompact } from "../TeammatesCompact";
import React, { useContext, useMemo, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingsContext } from "../../context/SettingsProvider/SettingsProvider";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { toShortThousands } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";

type CalculationResponse = {
  label?: string;
  calculationId: number;
  result: number;
  ranking: number | string;
  outOf: number;
  name: string;
  details: string;
  short: string;
  icon: string;
  variant?: {
    name: string;
    displayName: string;
  };
  weapon: { name: string; icon: string; refinement?: number };
  stats: any;
  teammates: CalculationTeammate[];
};

type CalculationListProps = {
  row: any;
  calculations: any[];
  selectedCalculationId?: string;
};

export const CalculationList: React.FC<CalculationListProps> = ({
  row,
  calculations,
  selectedCalculationId,
}) => {
  const { getTopRanking } = useContext(SettingsContext);
  const { translate } = useContext(TranslationContext);
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  const calculationIds = useMemo(
    () =>
      Object.keys(calculations ?? []).sort((a: any, b: any) => {
        const _a = ("" + calculations[a].ranking)?.replace("~", "");
        const _b = ("" + calculations[b].ranking)?.replace("~", "");

        const valA = _a.startsWith("(") ? _a.slice(1, _a.length - 1) : _a;
        const valB = _b.startsWith("(") ? _b.slice(1, _b.length - 1) : _b;

        return +valA < +valB ? -1 : 1;
      }),
    [JSON.stringify(calculations)]
  );

  const compactList = useMemo(
    () =>
      calculationIds
        // .filter((id: any) => calculations[id]?.ranking)
        .map((id: any, index) => {
          const calc: CalculationResponse = calculations[id];
          const {
            name,
            ranking,
            outOf,
            weapon,
            result,
            variant,
            calculationId,
            teammates,
            // details,
            // stats,
            // short,
          } = calc;

          const _id = calculationId || id;
          const _variant = variant?.name || "";
          const leaderboardPath = `leaderboards/${_id}/${_variant}`;
          const leaveOnlyNumbersRegex = /\D+/g;
          const _ranking = +(ranking + "")?.replace(leaveOnlyNumbersRegex, "");
          const isNiche = calc?.label === "niche";

          const _percentage = getTopRanking(_ranking, outOf);
          const _top = ranking ? `top ${_percentage || "?"}%` : "";

          const fullCalcId = `${_id}${_variant}`;
          const trClassName =
            fullCalcId === selectedCalculationId
              ? "decorate-row patreon-cyan"
              : "";

          return (
            <tr key={id} className={trClassName}>
              <td title={`${ranking ?? "-"}/${outOf}`}>
                {ranking ?? (
                  <span title="Rankings are cached. If you see this you need to refresh the page">
                    -
                  </span>
                )}
                <span className="opacity-5">
                  /{toShortThousands(outOf) || "???"}
                </span>
              </td>
              <td>{_top}</td>
              <td className="pr-0">
                <WeaponMiniDisplay
                  icon={weapon?.icon}
                  refinement={weapon?.refinement || 1}
                />
              </td>
              <td
                className="max-width-130-ellipsis"
                title={`${translate(weapon?.name)} R${weapon?.refinement}`}
              >
                {translate(weapon?.name)}
              </td>
              <td>
                <TeammatesCompact teammates={teammates} simplify />
              </td>
              <td className="white-space-nowrap">
                {/* <div className="stacked">
                    <div className="stacked-top">{short}</div>
                    <div className="stacked-bottom">{variant?.displayName}</div>
                  </div> */}
                {variant?.displayName}
              </td>
              <td>
                <a
                  className="white-space-nowrap"
                  href={`/${leaderboardPath}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(`/${leaderboardPath}`);
                  }}
                >
                  {isNiche && (
                    <span
                      style={{ width: "auto", display: "inline-block" }}
                      className="c-badge-wrapper"
                      title="This leaderboard will not be prioritized on profile highlights"
                    >
                      <span
                        style={{ width: "auto", fontSize: 11, marginRight: 5 }}
                        className={`c-badge c-0-badge`}
                      >
                        {calc?.label?.toUpperCase()}
                      </span>
                    </span>
                  )}
                  {name}
                </a>
              </td>
              <td>{result?.toFixed(0)}</td>
            </tr>
          );
        }),
    [
      JSON.stringify(calculationIds),
      translate,
      getTopRanking,
      selectedCalculationId,
    ]
  );

  // const tilesList = useMemo(
  //   () =>
  //     calculationIds.map((id: any, index) => {
  //       const calc: CalculationResponse = calculations[id];
  //       const { name, ranking, outOf, weapon, short } = calc;
  //       return (
  //         <div key={`${name}-${weapon.name}`}>
  //           <a
  //             title={`${calc.name} - ${weapon.name} R${
  //               weapon?.refinement || 1
  //             }`}
  //             className="highlight-tile"
  //             onClick={(event) => {
  //               event.preventDefault();
  //               // navigate(`/leaderboards/${id}`);
  //             }}
  //             // href={`/leaderboards/${id}`}
  //           >
  //             <div className="highlight-tile-pill">{short ? short : "---"}</div>
  //             <div className="flex">
  //               <img
  //                 alt="Icon"
  //                 className="table-icon"
  //                 src={calc.icon}
  //               />
  //               <WeaponMiniDisplay
  //                 icon={weapon.icon}
  //                 refinement={weapon?.refinement || 1}
  //               />
  //             </div>
  //             <div>
  //               {ranking ? `top ${Math.ceil((+ranking / outOf) * 100)}%` : ""}
  //             </div>
  //             <span>
  //               {ranking ?? "---"}
  //               <span className="opacity-5">/{outOf}</span>
  //             </span>
  //           </a>
  //         </div>
  //       );
  //     }),
  //   [calculationIds]
  // );

  const iconClassNames = ["sort-direction-icon", !show ? "rotate-180deg" : ""]
    .join(" ")
    .trim();

  return calculationIds.length > 0 ? (
    <div className="expanded-row flex">
      <div className="calculation-list-wrapper">
        <div className="clickable" onClick={() => setShow((prev) => !prev)}>
          {show ? "Hide" : "Show"} leaderboards
          <FontAwesomeIcon
            className={iconClassNames}
            // icon={params.order === -1 ? faChevronDown : faChevronUp}
            icon={faChevronUp}
            size="1x"
          />
        </div>
        {/* <div className="highlight-tile-container">{tilesList}</div> */}
        {show && (
          <table cellSpacing={0} className="calculation-list">
            <tbody>{compactList}</tbody>
          </table>
        )}
      </div>
    </div>
  ) : null;
};
