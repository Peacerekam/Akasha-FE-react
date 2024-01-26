import React, {
  SetStateAction,
  createContext,
  useCallback,
  useState,
} from "react";
import {
  allRvFilters,
  getDefaultRvFilters,
} from "../../components/RollList/defaultFilters";

import { getSummedArtifactRolls } from "../../utils/helpers";

export type Metric = "RV" | "CV";

type SettingsProviderContextType = {
  metric: Metric;
  topDecimals: number;
  customRvFilter: Record<string, string[]>;
  setMetric: (metric: Metric) => void;
  setTopDecimals: React.Dispatch<SetStateAction<number>>;
  setCustomRvFilter: (characterName: string, filter: string[]) => void;
  getArtifactMetricValue: (
    characterName: string,
    artifact: any,
    overrideMetric?: "CV" | "RV"
  ) => number;
  getTopRanking: (ranking: number, outOf: number) => number;
};

const defaultValue = {
  metric: "RV",
  topDecimals: 0,
  customRvFilter: {},
  setMetric: () => {},
  setTopDecimals: () => 0,
  setCustomRvFilter: () => {},
  getArtifactMetricValue: () => 0,
  getTopRanking: () => 100,
} as SettingsProviderContextType;

const SettingsContext = createContext(defaultValue);

const SettingsContextProvider: React.FC<{ children: any }> = ({ children }) => {
  const [metric, setMetric] = useState<Metric>("RV"); // localStorage instead?
  const [topDecimals, setTopDecimals] = useState<number>(0); // localStorage instead?

  const [customRvFilter, _setCustomRvFilter] =
    useState<Record<string, string[]>>(allRvFilters);

  const setCustomRvFilter = useCallback(
    (characterName: string, filter: string[]) => {
      _setCustomRvFilter((prev) => ({
        ...prev,
        [characterName]: filter,
      }));
    },
    []
  );

  const getArtifactMetricValue = useCallback(
    (characterName: string, artifact: any, overrideMetric?: "CV" | "RV") => {
      const _metric = overrideMetric || metric;

      if (_metric === "CV") {
        const _CV = +artifact.critValue.toFixed(1);
        return _CV;
      }

      const summedArtifactRolls = getSummedArtifactRolls(artifact);
      const characterRvStats =
        customRvFilter[characterName] || getDefaultRvFilters(characterName);

      const _RV = characterRvStats.reduce((accumulator, key) => {
        const _rv = summedArtifactRolls[key]?.rv || 0;
        return (accumulator += _rv);
      }, 0);

      return _RV;
    },
    [metric, customRvFilter]
  );

  const getTopRanking = useCallback(
    (ranking: number, outOf: number) => {
      const _pow = Math.pow(10, topDecimals);
      const _percentage =
        topDecimals === 0
          ? Math.min(100, Math.ceil((ranking / outOf) * 100))
          : Math.ceil((ranking / outOf) * _pow * 100) / _pow;

      return _percentage;
    },
    [topDecimals]
  );

  const value = {
    metric,
    topDecimals,
    customRvFilter,
    setMetric,
    setTopDecimals,
    setCustomRvFilter,
    getArtifactMetricValue,
    getTopRanking,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsContextProvider };
