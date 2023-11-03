import { faCheck, faX, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import ReactSelect from "react-select";
import { FilterOption, OptionsResponse } from "./FiltersContainer";
import { reactSelectDarkTheme } from "../../../utils/reactSelectDarkTheme";
import { isIcon } from "../../StatIcon";
import { StatIcon } from "../../StatIcon/StatIcon";

type FiltersModalProps = {
  filtersArray: FilterOption[];
  isOpen: boolean;
  optionGroups: OptionsResponse;
  filterSelectFocus: number | undefined;
  toggleModal: (event: React.MouseEvent<HTMLElement>) => void;
  setFilterSelectFocus: (value: number | undefined) => void;
  handleRemoveFilter: (value: FilterOption) => void;
  handleAddFilter: (value: FilterOption) => void;
  handleModifyFilter: (index: number, value: any) => void;
};

export const FiltersModal = ({
  filtersArray,
  isOpen,
  optionGroups,
  filterSelectFocus,
  toggleModal,
  setFilterSelectFocus,
  handleRemoveFilter,
  handleAddFilter,
  handleModifyFilter,
}: FiltersModalProps) => {
  const handleCloseFilters = (
    event: React.MouseEvent<HTMLElement>,
    allowChildren = false
  ) => {
    if (!allowChildren && event.target !== event.currentTarget) return;
    setFilterSelectFocus(undefined);
    toggleModal(event);
    const _body = document.querySelector("body");
    _body?.classList.remove("overflow-hidden");
  };

  const [modalContainerRef, setModalContainerRef] = useState<HTMLDivElement>();

  const modalHeader = (
    <div className="modal-header">
      <span className="modal-title">Manage table filters</span>
      <button
        className="close-btn"
        onClick={(event) => handleCloseFilters(event, true)}
      >
        <FontAwesomeIcon className="filter-icon" icon={faX} size="1x" />
      </button>
    </div>
  );

  const modalContent = useMemo(() => {
    const fieldKeyOptions = optionGroups.map((o, i) => ({
      index: i,
      label: o.fieldName,
      value: o.fieldKey,
    }));
    return (
      <div>
        {filtersArray.map((pill, index) => {
          const autofocus = filterSelectFocus === index;
          const fieldValuesOptions = optionGroups
            ?.find((g) => g.fieldKey === pill.name)
            ?.options.map((o) => {
              const isStatIcon = isIcon(o.name);
              return {
                label:
                  o.icon || isStatIcon ? (
                    <span className="react-select-custom-option">
                      {isStatIcon ? (
                        <StatIcon name={o.name ?? ""} />
                      ) : (
                        <img alt="" src={o.icon} />
                      )}
                      {o.name}
                    </span>
                  ) : (
                    o.name
                  ),
                rawLabel: o.name,
                value: o.value,
              };
            });

          const defaultGroup = fieldKeyOptions.find((f: any) => {
            const toStringA = "" + f.value;
            const toStringB = "" + pill.name;
            return toStringA === toStringB;
          });

          const defaultOption = fieldValuesOptions?.find((f: any) => {
            const toStringA = "" + f.value;
            const toStringB = "" + pill.value;
            return toStringA === toStringB;
          });

          const isDisabled = !fieldValuesOptions?.length;

          return (
            <div
              key={`${pill.name}-${pill.value}-${index}`}
              className="flex gap-10 nowrap"
            >
              <ReactSelect
                styles={reactSelectDarkTheme}
                className="w-100 filter-select"
                menuPortalTarget={modalContainerRef}
                defaultValue={defaultGroup}
                options={fieldKeyOptions}
                maxMenuHeight={400}
                menuPlacement="auto"
                onChange={(option) => {
                  if (!option) return;
                  handleModifyFilter(index, {
                    name: option.value,
                    value: "",
                  });
                }}
              />
              <ReactSelect
                styles={reactSelectDarkTheme}
                className={`w-100 filter-select ${
                  isDisabled ? "opacity-5" : ""
                }`}
                menuPortalTarget={modalContainerRef}
                openMenuOnFocus
                autoFocus={autofocus}
                menuIsOpen={true}
                defaultValue={defaultOption}
                options={fieldValuesOptions}
                isDisabled={isDisabled}
                getOptionValue={(option) => option.rawLabel}
                maxMenuHeight={450}
                // menuPlacement="auto"
                onChange={(option, b) => {
                  if (!option) return;
                  handleModifyFilter(index, {
                    name: defaultGroup?.value ?? "",
                    value: option.value,
                  });
                }}
              />
              <button
                className="remove-btn"
                onClick={() => handleRemoveFilter(pill)}
              >
                <FontAwesomeIcon
                  className="trash-icon"
                  icon={faTrashAlt}
                  size="1x"
                />
              </button>
            </div>
          );
        })}
        <div
          className="add-new-filter"
          onClick={() => {
            handleAddFilter({
              value: "",
              name: "",
            });
          }}
        >
          add new filter
        </div>
      </div>
    );
  }, [
    modalContainerRef,
    filterSelectFocus,
    JSON.stringify(filtersArray),
    optionGroups,
  ]);

  const modalButtons = (
    <div className="modal-buttons">
      <button
        className="apply-btn"
        onClick={(event) => handleCloseFilters(event, true)}
      >
        <FontAwesomeIcon className="filter-icon" icon={faCheck} size="1x" />
        OK
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="react-select-menu-container"
        ref={(newRef) => setModalContainerRef(newRef || undefined)}
      />
      <div className="modal-wrapper" onClick={handleCloseFilters}>
        <div className="modal">
          {modalHeader}
          <div className="modal-content">
            {modalContent}
            {modalButtons}
          </div>
        </div>
      </div>
    </>
  );
};
