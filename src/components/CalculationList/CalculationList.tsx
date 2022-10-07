import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "../../utils/helpers";
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

type CalculationListProps = {
  row: any;
};

export const CalculationList: React.FC<CalculationListProps> = ({ row }) => {
  const [calculations, setCalculations] = useState<any[]>([]);

  const getCalculations = async () => {
    const calcDetailsURL = `${BACKEND_URL}/api/leaderboards/${row.uid}/${row.characterId}/${row.type}`;
    const { data } = await axios.get(calcDetailsURL);
    setCalculations(data.data);
  };

  useEffect(() => {
    getCalculations();
  }, []);

  const calculationIds = useMemo(
    () =>
      Object.keys(calculations ?? []).sort((a: any, b: any) =>
        calculations[a].ranking < calculations[b].ranking ? -1 : 1
      ),
    [JSON.stringify(calculations)]
  );

  const compactList = useMemo(
    () =>
      calculationIds.map((id: any, index) => {
        const calc: CalculationResponse = calculations[id];
        const { name, ranking, outOf, details, weapon, result, stats } = calc;
        return (
          <tr key={id}>
            <td>
              {ranking ?? (
                // @TODO: something cooler than this tho
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
                icon={weapon?.icon}
                refinement={weapon?.refinement || 1}
              />
            </td>
            <td>{weapon?.name}</td>
            <td>{name}</td>
            <td>{calc.result.toFixed(0)}</td>
          </tr>
        );
      }),
    [JSON.stringify(calculationIds)]
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
