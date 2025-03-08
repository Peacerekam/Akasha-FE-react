import "./style.scss";

import {
  abortSignalCatcher,
  filtersQueryToArray,
} from "../../../utils/helpers";
import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useMemo, useState } from "react";

import { CustomQueryBuilder } from "./CustomQueryBuilder";
import { useLocation } from "react-router-dom";

type FiltersContainerProps = {
  onFiltersChange: (filters: FilterOption[]) => void;
  fetchURL: string;
  projectParamsToPath?: boolean;
};

export type FilterOption = {
  name: string;
  value: string | number;
  icon?: string;
  fieldKey?: string;
};

export type OptionsResponse = {
  fieldName: string;
  fieldKey: string;
  options: FilterOption[];
}[];

export const FiltersContainer = ({
  onFiltersChange,
  fetchURL,
  projectParamsToPath,
}: FiltersContainerProps) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [optionGroups, setOptionGroups] = useState<OptionsResponse>([]);
  const [filtersArray, setFiltersArray] = useState<FilterOption[]>([
    { name: "", value: "" },
  ]);

  const location = useLocation();

  const fetchFilters = async (
    fetchURL: string,
    abortController: AbortController
  ) => {
    const lsKeyFilters = "table-filters";
    const filtersLS = JSON.parse(localStorage.getItem(lsKeyFilters) ?? "{}");

    if (filtersLS[fetchURL]) {
      setOptionGroups(filtersLS[fetchURL]);
      return;
    }

    const opts: AxiosRequestConfig<any> = {
      signal: abortController?.signal,
    };

    const getSetData = async () => {
      const { data } = await axios.get(fetchURL, opts);
      setOptionGroups(data.data);

      filtersLS[fetchURL] = data.data;
      localStorage.setItem(lsKeyFilters, JSON.stringify(filtersLS));
    };

    await abortSignalCatcher(getSetData);
  };

  const fillPillsFromURL = () => {
    if (!location.search) return;

    const searchQuery = location.search;
    const query = new URLSearchParams(searchQuery);

    const tmp: any[] = [];

    query.forEach((value, key) => {
      if (key === "uids") {
        tmp.push({
          name: "lastProfiles",
          value: "1",
        });
      }
      if (key !== "filter") return;
      const arr = filtersQueryToArray(value);
      tmp.push(...arr);
    });

    setFiltersArray(tmp);
  };

  useEffect(() => {
    if (projectParamsToPath) {
      fillPillsFromURL();
    }
    setInitialLoad(false);
  }, [projectParamsToPath]);

  useEffect(() => {
    const abortController = new AbortController();
    if (fetchURL) fetchFilters(fetchURL, abortController);

    return () => {
      abortController.abort();
    };
  }, [fetchURL]);

  useEffect(() => {
    if (!initialLoad) {
      onFiltersChange(filtersArray);
    }
  }, [JSON.stringify(filtersArray), initialLoad]);

  const handleReplaceFilter = (filters: FilterOption[]) => {
    setFiltersArray(filters);
  };

  const pills = useMemo(
    () => filtersArray.filter((f) => f.value !== ""),
    [JSON.stringify(filtersArray)]
  );

  return (
    <>
      <div className="filters-container">
        <div className="pills-container">
          <CustomQueryBuilder
            optionGroups={optionGroups}
            handleReplaceFilter={handleReplaceFilter}
            pills={pills}
          />
        </div>
      </div>
    </>
  );
};
