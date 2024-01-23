import React, { createContext, useCallback, useState } from "react";
import {
  allRvFilters,
  getDefaultRvFilters,
} from "../../components/RollList/defaultFilters";

import { getSummedArtifactRolls } from "../../utils/helpers";

type Metric = "RV" | "CV";

type MetricProviderContextType = {
  setCustomRvFilter: (characterName: string, filter: string[]) => void;
  getArtifactMetricValue: (characterName: string, artifact: any) => number;
  setMetric: (metric: Metric) => void;
  metric: Metric;
  customRvFilter: Record<string, string[]>;
};

const defaultValue = {
  setCustomRvFilter: () => {},
  getArtifactMetricValue: () => 0,
  setMetric: () => {},
  metric: "RV",
  customRvFilter: {},
} as MetricProviderContextType;

const MetricContext = createContext(defaultValue);

const MetricContextProvider: React.FC<{ children: any }> = ({ children }) => {
  const [metric, setMetric] = useState<Metric>("RV");

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
    (characterName: string, artifact: any) => {
      if (metric === "CV") {
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

  const value = {
    setCustomRvFilter,
    getArtifactMetricValue,
    setMetric,
    metric,
    customRvFilter,
  };

  return (
    <MetricContext.Provider value={value}>{children}</MetricContext.Provider>
  );
};

export { MetricContext, MetricContextProvider };
