import React, { createContext, useCallback, useEffect, useState } from "react";
import {
  allRvFilters,
  getDefaultRvFilters,
} from "../../components/RollList/defaultFilters";

import { UseState } from "../../hooks/";
import { fixCritValue } from "../../utils/substats";
import { getSummedArtifactRolls } from "../../utils/helpers";

export type Metric = "RV" | "CV";

type SettingsProviderContextType = {
  metric?: Metric;
  topDecimals?: number;
  showcaseState?: boolean;
  customRvFilter: Record<string, string[]>;
  setMetric: UseState<Metric>;
  setTopDecimals: UseState<number>;
  setShowcaseState: UseState<boolean>;
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
  setTopDecimals: () => {},
  setShowcaseState: () => {},
  setCustomRvFilter: () => {},
  getArtifactMetricValue: () => 0,
  getTopRanking: () => 100,
} as SettingsProviderContextType;

const SettingsContext = createContext(defaultValue);

const SettingsContextProvider: React.FC<{ children: any }> = ({ children }) => {
  // state for local-storage
  const [metric, setMetric] = useState<Metric>();
  const [topDecimals, setTopDecimals] = useState<number>();
  const [showcaseState, setShowcaseState] = useState<boolean>();

  // state outside of local-storage
  const [customRvFilter, _setCustomRvFilter] =
    useState<Record<string, string[]>>(allRvFilters);

  const lsKey = "generalSettings";

  // load from local storage
  useEffect(() => {
    const savedObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");

    const setIfDifferent = (
      setFunc: any,
      key: string,
      value: any,
      defaultValue: any = false
    ) => {
      setFunc(savedObj[key] || value || defaultValue);
    };

    setIfDifferent(setMetric, "metric", metric, "RV");
    setIfDifferent(setTopDecimals, "topDecimals", topDecimals, 0);
    setIfDifferent(setShowcaseState, "showcaseState", showcaseState, false);

    console.log("\nGeneral settings from Local Storage:");
    console.table(savedObj);
  }, [localStorage]);

  // save to local storage
  useEffect(() => {
    const oldObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
    let dirty = false;

    const assignIfDiffAndNotUndefined = (key: string, value: any) => {
      if (oldObj[key] !== value && value !== undefined) {
        console.log(`${key}: ${oldObj[key]} -> ${value}`);
        oldObj[key] = value;
        dirty = true;
      }
    };

    assignIfDiffAndNotUndefined("metric", metric);
    assignIfDiffAndNotUndefined("topDecimals", topDecimals);
    assignIfDiffAndNotUndefined("showcaseState", showcaseState);

    if (!dirty) return;

    const newObj = { ...oldObj };
    localStorage.setItem(lsKey, JSON.stringify(newObj));
  }, [metric, topDecimals, showcaseState]);

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
        const critValue = fixCritValue(artifact);
        return critValue;
      }

      const summedArtifactRolls = getSummedArtifactRolls(artifact);
      const characterRvStats =
        customRvFilter[characterName] || getDefaultRvFilters(characterName);

      const rollValue = characterRvStats.reduce((accumulator, key) => {
        const _rv = summedArtifactRolls[key]?.rv || 0;
        return (accumulator += _rv);
      }, 0);

      return rollValue;
    },
    [metric, customRvFilter]
  );

  const getTopRanking = useCallback(
    (ranking: number, outOf: number) => {
      if (topDecimals === 0) {
        return Math.min(100, Math.ceil((ranking / outOf) * 100));
      }

      const _pow = Math.pow(10, topDecimals || 0);
      return Math.ceil((ranking / outOf) * _pow * 100) / _pow;
    },
    [topDecimals]
  );

  const value = {
    metric,
    topDecimals,
    showcaseState,
    customRvFilter,
    setMetric,
    setTopDecimals,
    setShowcaseState,
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
