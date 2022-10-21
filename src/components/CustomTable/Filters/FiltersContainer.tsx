import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FiltersModal } from "./FiltersModal";
import {
  abortSignalCatcher,
  filtersQueryToArray,
} from "../../../utils/helpers";
import { CustomQueryBuilder } from "./CustomQueryBuilder";
import "./style.scss";
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

export const getRelativeCoords = (event: React.MouseEvent<HTMLElement>) => {
  const { innerWidth, innerHeight } = window;
  const offsetX = event.clientX - innerWidth / 2;
  const offsetY = event.clientY - innerHeight / 2;
  return { offsetY, offsetX };
};

export const applyModalBodyStyle = ({ offsetX, offsetY }: any) => {
  const _body = document.querySelector("body");
  if (!_body) return;
  _body.style.setProperty("--modal-offset-x", `${offsetX}px`);
  _body.style.setProperty("--modal-offset-y", `${offsetY}px`);
  _body?.classList.add("overflow-hidden");
};

export const FiltersContainer = ({
  onFiltersChange,
  fetchURL,
  projectParamsToPath,
}: FiltersContainerProps) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filterSelectFocus, setFilterSelectFocus] = useState<number>();
  const [optionGroups, setOptionGroups] = useState<OptionsResponse>([]);
  const [filtersArray, setFiltersArray] = useState<FilterOption[]>([
    { name: "", value: "" },
  ]);

  const location = useLocation();

  const fetchFilters = async (
    fetchURL: string,
    abortController: AbortController
  ) => {
    const opts = {
      signal: abortController?.signal,
    };

    const getSetData = async () => {
      const { data } = await axios.get(fetchURL, opts);
      setOptionGroups(data.data);
    };

    await abortSignalCatcher(getSetData);
  };

  const fillPillsFromURL = () => {
    if (!location.search) return;

    const searchQuery = location.search;
    const query = new URLSearchParams(searchQuery);

    const tmp: any[] = [];

    query.forEach((value, key) => {
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

  const handleToggleModal = (event: React.MouseEvent<HTMLElement>) => {
    setShowFiltersModal((prev) => !prev);

    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const handleOpenFilters = (
    event: React.MouseEvent<HTMLElement>,
    index?: number
  ) => {
    if (event.target !== event.currentTarget) return;

    setFilterSelectFocus(index);
    setShowFiltersModal(true);

    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const handleRemoveFilter = (filter: FilterOption) => {
    console.log("removed filter", filter);

    setFiltersArray((prev) => {
      const arr = [...prev];
      const index = arr.findIndex((a) => a.value === filter.value);
      if (index > -1) {
        arr.splice(index, 1);
      }
      return arr;
    });
  };

  const handleAddFilter = (filter: FilterOption) => {
    console.log("added filter", filter);

    setFiltersArray((prev) => {
      const arr = [...prev];
      arr.push(filter);
      return arr;
    });
  };

  const handleModifyFilter = (index: number, filter: any) => {
    console.log("modified filter", index, filter);

    setFiltersArray((prev) => {
      const arr = [...prev];
      if (arr[index]) {
        arr[index] = {
          ...arr[index],
          ...filter,
        };

        const isValueSelected = filter.value !== "";
        const isLastField = index === prev.length - 1;

        if (isValueSelected && isLastField) {
          arr.push({
            name: "",
            value: "",
          });
        }
      }
      return arr;
    });
  };

  const handleReplaceFilter = (filters: FilterOption[]) => {
    console.log("repalced filters", filters);
    setFiltersArray(filters);
  };

  const formatPillName = (pill: FilterOption) => {
    const equipTypeMap = {
      EQUIP_BRACER: "Flower",
      EQUIP_NECKLACE: "Feather",
      EQUIP_SHOES: "Sands",
      EQUIP_RING: "Goblet",
      EQUIP_DRESS: "Circlet",
    } as any;
    return (
      {
        equipType: equipTypeMap[pill.value],
        stars: `${pill.value}*`,
        constellation: `C${pill.value}`,
        "weapon.weaponInfo.refinementLevel.value": `R${+pill.value + 1}`,
        "artifactSets.$1": `1p ${pill.value}`,
        "artifactSets.$2": `2p ${pill.value}`,
        "artifactSets.$4": `4p ${pill.value}`,
      }[pill.name] ?? pill.value
    );
  };

  // const pills = useMemo(
  //   () => filtersArray.filter((f) => f.value !== ""),
  //   [filtersArray]
  // );

  const pills = useMemo(
    () => filtersArray.filter((f) => f.value !== ""),
    [JSON.stringify(filtersArray)]
  );

  return (
    <>
      <FiltersModal
        isOpen={showFiltersModal}
        toggleModal={handleToggleModal}
        optionGroups={optionGroups}
        filtersArray={filtersArray}
        setFilterSelectFocus={setFilterSelectFocus}
        filterSelectFocus={filterSelectFocus}
        handleRemoveFilter={handleRemoveFilter}
        handleAddFilter={handleAddFilter}
        handleModifyFilter={handleModifyFilter}
      />
      {/* @TODO: perfect scroll here?  */}
      <div className="filters-container">
        <div className="pills-container">
          <CustomQueryBuilder
            optionGroups={optionGroups}
            handleReplaceFilter={handleReplaceFilter}
            pills={pills}
          />
        </div>
        <div className="filter-icon" onClick={handleToggleModal}>
          <FontAwesomeIcon icon={faList} size="1x" />
        </div>
      </div>
    </>
  );
};
