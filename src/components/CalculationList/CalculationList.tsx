import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import { CalculationTeammate, TeammatesCompact } from "../TeammatesCompact";
import "./style.scss";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";

type CalculationResponse = {
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
};

export const CalculationList: React.FC<CalculationListProps> = ({
  row,
  calculations,
}) => {
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
            details,
            weapon,
            result,
            stats,
            variant,
            calculationId,
            teammates,
          } = calc;

          const _id = calculationId || id;
          const leaderboardPath = `leaderboards/${_id}/${variant?.name || ""}`;
          const leaveOnlyNumbersRegex = /\D+/g;
          const _ranking = +(ranking + "")?.replace(leaveOnlyNumbersRegex, "");

          return (
            <tr key={id}>
              <td>
                {ranking ?? (
                  // @TODO: something cooler than this tho
                  <span title="Rankings are cached. If you see this you need to refresh the page">
                    -
                  </span>
                )}
                <span className="opacity-5">/{outOf || "???"}</span>
              </td>
              <td>
                {ranking
                  ? `top ${
                      Math.min(100, Math.ceil((_ranking / outOf) * 100)) || "?"
                    }%`
                  : ""}
              </td>
              <td>
                <WeaponMiniDisplay
                  icon={weapon?.icon}
                  refinement={weapon?.refinement || 1}
                />
              </td>
              <td>{translate(weapon?.name)}</td>
              <td>
                <TeammatesCompact teammates={teammates} simplify />
              </td>
              <td>{variant?.displayName}</td>
              <td>
                <a
                  href={`/${leaderboardPath}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(`/${leaderboardPath}`);
                  }}
                >
                  {name}
                </a>
              </td>
              <td>{result?.toFixed(0)}</td>
            </tr>
          );
        }),
    [JSON.stringify(calculationIds), translate]
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
