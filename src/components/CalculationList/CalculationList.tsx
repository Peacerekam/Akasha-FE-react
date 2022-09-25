import React, { useMemo } from "react";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import "./style.scss";

type CalculationResponse = {
  result: number;
  ranking: number;
  outOf: number;
  name: string;
  details: string;
  weapon: { name: string; icon: string; refinement?: number };
  stats: any;
};

export const CalculationList = ({ row }: any) => {
  const calculationIds = useMemo(
    () =>
      Object.keys(row.calculations).sort((a: any, b: any) =>
        row.calculations[a].ranking < row.calculations[b].ranking ? -1 : 1
      ),
    [row]
  );

  const compactList = useMemo(
    () =>
      calculationIds.map((id: any, index) => {
        const calc: CalculationResponse = row.calculations[id];
        const { name, ranking, outOf, details, weapon, result, stats } = calc;
        return (
          <tr key={id}>
            <td>
              {ranking ?? (
                // @KM: @TODO: something cooler than this tho
                <span title="Rankings are cached. If you see this you need to refresh the page">
                  -
                </span>
              )}
              <span className="opacity-5">/{outOf}</span>
            </td>
            <td>
              {ranking ? `top ${Math.ceil((ranking / outOf) * 100)}%` : "-"}
            </td>
            <td>
              <WeaponMiniDisplay
                icon={weapon.icon}
                refinement={weapon?.refinement || 1}
              />
            </td>
            <td>{weapon.name}</td>
            <td>{name}</td>
            <td>{calc.result.toFixed(0)}</td>
          </tr>
        );
      }),
    [row]
  );

  return (
    <div className="expanded-row flex">
      {calculationIds.length > 0 ? (
        <table cellSpacing={0} className="calculation-list">
          <tbody>{compactList}</tbody>
        </table>
      ) : (
        "no calculations found"
      )}
    </div>
  );
};
