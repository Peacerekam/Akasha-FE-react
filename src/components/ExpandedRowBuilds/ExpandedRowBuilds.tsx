import React, { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

import { ArtifactListCompact } from "../ArtifactListCompact";
import { CalculationList } from "../CalculationList";
import { CharacterCard } from "../CharacterCard";
import { DamageDistrubution } from "../DamageDistrubution";
import { Spinner } from "../Spinner";
import { SubstatPriorityTable } from "../SubstatPriorityTable";
import { cssJoin } from "../../utils/helpers";
import { useParams } from "react-router-dom";

type ExpandedRowBuildsProps = {
  row: any;
  isProfile: boolean;
};

export const ExpandedRowBuilds: React.FC<ExpandedRowBuildsProps> = ({
  row,
  isProfile,
}) => {
  const [isFetching, setIsFetching] = useState(true);
  const [disableAnimations, setDisableAnimations] = useState(false);
  const [iterator, setIterator] = useState(1);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [_calculations, setCalculations] = useState<{
    calculations: any;
    chartsData: any;
  }>({
    calculations: {},
    chartsData: {},
  });

  const { calculationId, variant } = useParams();
  const calculationIdFromUrl = calculationId
    ? `${calculationId}${variant || ""}`
    : "";

  const [selectedCalculationId, setSelectedCalculationId] =
    useState<string>(calculationIdFromUrl);

  const getArtifacts = async () => {
    if (!row.md5) return;
    const _uid = encodeURIComponent(row.uid);
    const _md5 = encodeURIComponent(row.md5);
    const artDetailsURL = `/api/artifacts/${_uid}/${_md5}`;
    const { data } = await axios.get(artDetailsURL);
    setArtifacts(data.data);
  };

  const getCalculations = async () => {
    if (!row.md5) return;
    const _uid = encodeURIComponent(row.uid);
    const _md5 = encodeURIComponent(row.md5);
    const calcDetailsURL = `/api/leaderboards/${_uid}/${_md5}`;
    const opts: AxiosRequestConfig<any> = {
      params: {
        variant: isProfile ? "profilePage" : "",
      },
    };
    const { data } = await axios.get(calcDetailsURL, opts);
    setCalculations(data.data);
  };

  const getArtifactsAndCalculations = async () => {
    const tasks = [getCalculations, getArtifacts];
    const allPromises = tasks.map((task: any) => {
      return new Promise(async (resolve) => {
        try {
          await task();
        } catch (err) {
          console.log(err);
        }
        resolve(true);
      });
    });

    setIsFetching(true);
    await Promise.all(allPromises);
    setIsFetching(false);
  };

  useEffect(() => {
    getArtifactsAndCalculations();
  }, []);

  const errorCallback = async () => {
    setDisableAnimations(true);
    setIterator((prev) => prev + 1);

    // setIsFetching(true);
    // await delay(1);
    // setIsFetching(false);
  };

  // const hasLeaderboards = Object.keys(_calculations.calculations).length > 0;

  const content = (
    <>
      {isProfile ? (
        <CharacterCard
          row={row}
          artifacts={artifacts}
          _calculations={_calculations}
          setSelectedCalculationId={setSelectedCalculationId}
          errorCallback={errorCallback}
        />
      ) : (
        <ArtifactListCompact row={row} artifacts={artifacts} />
      )}
      <div>
        {selectedCalculationId && (
          <>
            <DamageDistrubution
              row={row}
              selectedCalculationId={selectedCalculationId}
            />
            <SubstatPriorityTable
              row={row}
              selectedCalculationId={selectedCalculationId}
            />
          </>
        )}
        <CalculationList
          row={row}
          calculations={_calculations.calculations}
          selectedCalculationId={selectedCalculationId}
        />
      </div>
    </>
  );

  return (
    <div
      key={iterator}
      className={cssJoin([
        "flex expanded-row",
        disableAnimations ? "disable-anim" : "",
      ])}
    >
      {isFetching ? <Spinner /> : content}
    </div>
  );
};
