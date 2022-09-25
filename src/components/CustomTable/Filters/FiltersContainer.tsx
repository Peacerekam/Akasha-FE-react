import { useState, useEffect } from "react";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FiltersModal } from "./FiltersModal";
import axios from "axios";
import "./style.scss";

type FiltersContainerProps = {
  onFiltersChange: (filters: FilterOption[]) => void;
  fetchURL: string;
};

export type FilterOption = {
  name: string;
  value: string | number;
  icon?: string;
};

export type OptionsResponse = {
  fieldName: string;
  fieldKey: string;
  options: FilterOption[];
}[];

const getRelativeCoords = (event: React.MouseEvent<HTMLElement>) => {
  const { innerWidth, innerHeight } = window;
  const offsetX = event.clientX - innerWidth / 2;
  const offsetY = event.clientY - innerHeight / 2;
  return { offsetY, offsetX };
};

const applyModalBodyStyle = ({ offsetX, offsetY }: any) => {
  const _body = document.querySelector("body");
  if (!_body) return;

  // @KM: @TODO: when we got ref, apply this to ref instead of body
  _body.style.setProperty("--modal-offset-x", `${offsetX}px`);
  _body.style.setProperty("--modal-offset-y", `${offsetY}px`);
  _body?.classList.add("overflow-hidden");
};

export const FiltersContainer = ({
  onFiltersChange,
  fetchURL,
}: FiltersContainerProps) => {
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filterSelectFocus, setFilterSelectFocus] = useState<number>();
  const [optionGroups, setOptionGroups] = useState<OptionsResponse>([]);
  const [filtersArray, setFiltersArray] = useState<FilterOption[]>([
    { name: "", value: "" },
  ]);

  const fetchFilters = async (
    fetchURL: string,
    abortController: AbortController
  ) => {
    try {
      const opts = {
        signal: abortController?.signal,
      };

      const { data } = await axios.get(fetchURL, opts);
      // cancel or reject the promise or requestif theresnew fetch?
      setOptionGroups(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    const abortController = new AbortController();
    if (fetchURL) fetchFilters(fetchURL, abortController);

    return () => {
      abortController.abort();
    };
  }, [fetchURL]);

  useEffect(() => {
    onFiltersChange(filtersArray);
  }, [JSON.stringify(filtersArray)]);

  const handleToggleModal = () => {
    setShowFiltersModal((prev) => !prev);
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
      }
      return arr;
    });
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
        'weapon.weaponInfo.refinementLevel.value': `R${+pill.value+1}`
      }[pill.name] ?? pill.value
    );
  };

  return (
    <>
      <FiltersModal
        isOpen={showFiltersModal}
        toggleModal={handleToggleModal}
        optionGroups={optionGroups}
        pills={filtersArray}
        setFilterSelectFocus={setFilterSelectFocus}
        filterSelectFocus={filterSelectFocus}
        handleRemoveFilter={handleRemoveFilter}
        handleAddFilter={handleAddFilter}
        handleModifyFilter={handleModifyFilter}
      />
      {/* @KM: perfect scroll here?  */}
      <div className="filters-container" onClick={handleOpenFilters}>
        <div className="pills-container">
          {filtersArray.filter((f) => f.name).length > 0 ? (
            filtersArray
              .filter((f) => f.value)
              .map((pill, index) => (
                <span
                  key={`${pill.name}-${pill.value}-${index}`}
                  className="pill"
                >
                  <span
                    className="pill-label"
                    onClick={(event) => handleOpenFilters(event, index)}
                  >
                    {formatPillName(pill)}
                  </span>
                  <span
                    className="pill-close"
                    onClick={() => handleRemoveFilter(pill)}
                  >
                    ×
                  </span>
                </span>
              ))
          ) : (
            <div className="filter-bg-text flex nowrap">no filters</div>
          )}
        </div>
        <FontAwesomeIcon className="filter-icon" icon={faList} size="1x" />
      </div>
    </>
  );
};
