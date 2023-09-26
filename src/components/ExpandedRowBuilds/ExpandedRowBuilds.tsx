import axios from "axios";
import React, { useEffect, useState } from "react";

import { CharacterCard } from "../CharacterCard";
import { CalculationList } from "../CalculationList";
import { ArtifactListCompact } from "../ArtifactListCompact";
import { Spinner } from "../Spinner";
import { SubstatPriorityTable } from "../SubstatPriorityTable";

type ExpandedRowBuildsProps = {
  row: any;
  isProfile: boolean;
};

export const ExpandedRowBuilds: React.FC<ExpandedRowBuildsProps> = ({
  row,
  isProfile,
}) => {
  const [isFetching, setIsFetching] = useState(true);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [_calculations, setCalculations] = useState<{
    calculations: any[];
    chartsData: any;
  }>({
    calculations: [],
    chartsData: {},
  });
  const [selectedCalculationId, setSelectedCalculationId] = useState<string>();

  const getArtifacts = async () => {
    setIsFetching(true);
    const _uid = encodeURIComponent(row.uid);
    const artDetailsURL = `/api/artifacts/${_uid}/${row.characterId}`;
    const opts = {
      params: { type: row.type },
    };
    const { data } = await axios.get(artDetailsURL, opts);
    setArtifacts(data.data);
    setIsFetching(false);
  };

  const getCalculations = async () => {
    const _uid = encodeURIComponent(row.uid);
    const calcDetailsURL = `/api/leaderboards/${_uid}/${row.characterId}`;
    const opts = {
      params: {
        type: row.type,
        variant: isProfile ? "profilePage" : "",
      },
    };
    const { data } = await axios.get(calcDetailsURL, opts);
    setCalculations(data.data);
  };

  useEffect(() => {
    getCalculations();
    getArtifacts();
  }, []);

  const content = (
    <>
      {isProfile ? (
        <>
          <CharacterCard
            row={row}
            artifacts={artifacts}
            _calculations={_calculations}
            setSelectedCalculationId={setSelectedCalculationId}
          />
          <div>
            <SubstatPriorityTable
              row={row}
              selectedCalculationId={selectedCalculationId}
            />
            <CalculationList
              row={row}
              calculations={_calculations.calculations}
            />
          </div>
        </>
      ) : (
        <>
          <ArtifactListCompact row={row} artifacts={artifacts} />
          <CalculationList
            row={row}
            calculations={_calculations.calculations}
          />
        </>
      )}
    </>
  );

  return (
    <div className="flex expanded-row">
      {isFetching ? <Spinner /> : content}
    </div>
  );
};
