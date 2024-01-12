import "./style.scss";

import React, { useContext, useMemo } from "react";
import {
  faAnglesLeft,
  faAnglesRight,
  faBackwardStep,
  faChevronLeft,
  faChevronRight,
  faForwardStep,
} from "@fortawesome/free-solid-svg-icons";

import { ConfirmInput } from "../ConfirmInput";
import { FetchParams } from "../CustomTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";

// import { Spinner } from "../Spinner";

type PaginationProps = {
  totalRows?: number;
  pageSize?: number;
  pageNumber?: number;
  setParams?: React.Dispatch<React.SetStateAction<FetchParams>> | null;
  isFetchingPagination?: boolean;
  isDataLoading?: boolean;
  rows?: any[];
  sort?: string;
  order?: number;
  showPageNumbers?: boolean;
  unknownPage?: boolean;
  setHideIndexColumn?: React.Dispatch<React.SetStateAction<boolean>> | null;
  setUnknownPage?: React.Dispatch<React.SetStateAction<boolean>> | null;
  calculationShortName?: string;
  alwaysShowIndexColumn?: boolean;
};

const accessFieldByString = (item: any, sort: string | null) => {
  if (!sort) sort = "critValue";
  if (!item) return "";

  let _output = item;
  let _tmpSortField = sort.split(".");

  while (_tmpSortField.length > 0) {
    _output = _output[_tmpSortField[0]];
    _tmpSortField.shift();
  }
  return _output as number | string;
};

export const Pagination: React.FC<PaginationProps> = ({
  totalRows = 0,
  pageSize = 0,
  pageNumber = 0,
  setParams = null,
  isFetchingPagination = false,
  isDataLoading = false,
  rows = [],
  sort = null,
  order = null,
  showPageNumbers = false,
  unknownPage = false,
  setHideIndexColumn = null,
  setUnknownPage = null,
  calculationShortName = null,
  alwaysShowIndexColumn = false,
}) => {
  const { translate } = useContext(TranslationContext);
  const lastPage = Math.ceil(totalRows / pageSize) || 1;
  const disableNext = unknownPage ? false : pageNumber === lastPage;
  const disablePrevious = unknownPage ? false : pageNumber === 1;

  const firstItem = rows.length > 0 ? rows[0] : null;
  const lastItem = rows.length > 0 ? rows[rows.length - 1] : null;

  const handleNextPage = () => {
    if (!setParams || isDataLoading) return;

    const nextValue = accessFieldByString(lastItem, sort);
    // const smallerNextValue = isNaN(+nextValue) ? nextValue : (+nextValue).toFixed(2);

    const prefix = order === -1 ? "lt" : "gt";
    const p = nextValue !== "" ? `${prefix}|${nextValue || 0}` : "";

    if (!p && setHideIndexColumn && setUnknownPage) {
      setHideIndexColumn(false);
      setUnknownPage(false);
    }

    setParams((prev: FetchParams) => ({
      ...prev,
      page: p ? prev.page + 1 : 1,
      p,
      fromId: lastItem?._id,
    }));
  };

  const handlePreviousPage = () => {
    if (!setParams || isDataLoading) return;

    const nextValue = accessFieldByString(firstItem, sort);
    // const smallerNextValue = isNaN(+nextValue) ? nextValue : (+nextValue).toFixed(2);

    const prefix = order === -1 ? "gt" : "lt";
    const p = nextValue !== "" ? `${prefix}|${nextValue}` : "";

    if (!p && setHideIndexColumn && setUnknownPage) {
      setHideIndexColumn(false);
      setUnknownPage(false);
    }

    setParams((prev: FetchParams) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
      p,
      fromId: firstItem?._id,
    }));
  };

  const handleFirstPage = () => {
    if (!setParams) return;

    if (setHideIndexColumn && setUnknownPage) {
      setHideIndexColumn(false);
      setUnknownPage(false);
    }

    setParams((prev: FetchParams) => ({
      ...prev,
      page: 1,
      p: "",
      fromId: "",
    }));
  };

  const handleLastPage = () => {
    if (!setParams) return;

    if (setHideIndexColumn && setUnknownPage) {
      setHideIndexColumn(false);
      setUnknownPage(lastPage === 0);
    }

    const prefix = order === -1 ? "gt|-" : "lt|";
    const p = `${prefix}${100_000_000}`;

    setParams((prev: FetchParams) => ({
      ...prev,
      page: lastPage,
      p,
      fromId: "",
    }));
  };

  const handleSetPage = (n: number) => {
    if (!setParams) return;
    setParams((prev: FetchParams) => ({
      ...prev,
      page: n,
    }));
  };

  const getVisiblePages = useMemo(() => {
    const arr = [];
    const range = 3;
    const endOffset = range * 2 + 2;

    const isCloseToEnd = pageNumber + range + 1 > lastPage;
    const isCloseToStart = pageNumber - range < 1;

    let nStart = isCloseToStart ? 1 : pageNumber - range;
    let nEnd = pageNumber + endOffset;

    if (isCloseToEnd) {
      nEnd = lastPage;
      nStart = lastPage - endOffset + 1;
      if (nStart < 1) nStart = 1;
    }

    if (nStart !== 1) arr.push(1);

    for (let i = nStart; i < nEnd; i++) {
      if (i <= 0) continue;
      if (i >= lastPage) break;
      if (arr.length >= endOffset) break;
      arr.push(i);
    }

    arr.push(lastPage);

    return arr;
  }, [pageNumber, lastPage]);

  const displayPageRange = useMemo(
    () =>
      getVisiblePages.map((page: number, index) => {
        const classNames = [
          "relative button-wrapper",
          page === pageNumber ? "highlight-button" : "",
        ]
          .join(" ")
          .trim();

        const displayFirstLabel = (
          <span onClick={() => handleSetPage(1)} className="button-label">
            first
          </span>
        );

        const displayLastLabel = (
          <span
            onClick={() => handleSetPage(lastPage)}
            className="button-label"
          >
            last
          </span>
        );

        return (
          <span key={`num-btn-${page}-${index}`} className={classNames}>
            <button onClick={() => handleSetPage(page)}>{page}</button>
            {/* dont show labels if theres only 1 page total */}
            {lastPage !== 1 && (
              <>
                {page === 1 ? displayFirstLabel : ""}
                {page === lastPage ? displayLastLabel : ""}
              </>
            )}
          </span>
        );
      }),
    [pageNumber, lastPage, getVisiblePages]
  );

  // if (totalRows === 0) return null;

  const to = Math.min(pageNumber * pageSize, totalRows);
  const from = Math.max(to - pageSize + 1, 1);

  // const classNames = ["pagination", isLoading ? "is-loading" : ""]
  //   .join(" ")
  //   .trim();

  const handleSkipToValue = (value: number, dir?: "<" | ">") => {
    if (!setParams || !setHideIndexColumn || !setUnknownPage) return;

    const p =
      dir === "<"
        ? `${order === -1 ? "lt" : "gt"}|${value}`
        : `${order === -1 ? "gt" : "lt"}|${value}`;

    setHideIndexColumn(!alwaysShowIndexColumn);
    setUnknownPage(true);
    setParams((prev: FetchParams) => ({
      ...prev,
      page: 0,
      p,
    }));
  };

  const sortToText: { [key: string]: string } = {
    // character columns
    critValue: "Crit Value",
    "stats.critRate.value": "Crit RATE",
    "stats.critDamage.value": "Crit DMG",
    "stats.maxHp.value": "Max HP",
    "stats.atk.value": "ATK",
    "stats.def.value": "DEF",
    "stats.elementalMastery.value": "EM",
    "stats.energyRecharge.value": "ER%",
    "stats.hydroDamageBonus.value": "Hydro DMG Bonus",
    "stats.geoDamageBonus.value": "Geo DMG Bonus",
    "stats.pyroDamageBonus.value": "Pyro DMG Bonus",
    "stats.cryoDamageBonus.value": "Cryo DMG Bonus",
    "stats.electroDamageBonus.value": "Electro DMG Bonus",
    "stats.anemoDamageBonus.value": "Anemo DMG Bonus",
    "stats.dendroDamageBonus.value": "Dendro DMG Bonus",
    "stats.physicalDamageBonus.value": "Physical DMG Bonus",
    "stats.healingBonus.value": "Healing Bonus",
    // artifact columns
    "substats.Crit RATE": "Crit RATE",
    "substats.Crit DMG": "Crit DMG",
    "substats.ATK%": "ATK%",
    "substats.HP%": "HP%",
    "substats.DEF%": "DEF%",
    "substats.Elemental Mastery": "EM",
    "substats.Energy Recharge": "ER%",
    "substats.Flat ATK": "Flat ATK",
    "substats.Flat HP": "Flat HP",
    "substats.Flat DEF": "Flat DEF",
    // leaderboard columns
    "calculation.result": [calculationShortName, "result"].join(" "),
    // accounts columns
    "playerInfo.finishAchievementNum": "Achievements",
    "playerInfo.level": "Adventure Rank",
    lastProfileUpdate: "Last profile update",
    constellation: "Constellation",
    _id: "_id",
    // crappy columns
    // "weapon.name": false,
    // constellation: "Constellation",
    // name: false,
    // "owner.nickname": false,
  };

  const disableSkip = !!sort && !sortToText[sort];
  const highlightedSort = (
    <span style={{ color: "orange", fontWeight: 600 }}>
      {sort && sortToText[sort] ? translate(sortToText[sort]) || "?" : "?"}
    </span>
  );

  return (
    <div className="pagination-wrapper">
      {/* {isLoading ? (
        <div className="pagination-spinner-wrapper">
          <Spinner />
        </div>
      ) : null} */}
      <div className="pagination">
        {(disableNext && disablePrevious) || rows.length === 0 ? (
          ""
        ) : (
          <div className="pagination-buttons">
            <span className="relative button-wrapper">
              <button
                disabled={disablePrevious || disableSkip}
                onClick={handleFirstPage}
              >
                <FontAwesomeIcon icon={faBackwardStep} size="1x" />
              </button>
              <span onClick={handleFirstPage} className="button-label">
                first
              </span>
            </span>
            <ConfirmInput
              sort={sort}
              defaultValue=""
              text={
                <>
                  Skip to {highlightedSort} values{" "}
                  {order === 1 ? "lower" : "greater"} than:
                </>
              } // if on leaderboards page then shortcut values from context
              onConfirm={(value: number) => handleSkipToValue(value, ">")}
              className={`relative button-wrapper ${
                disablePrevious || disableSkip ? "pointer-events-none" : ""
              }`}
            >
              <>
                <button disabled={disablePrevious || disableSkip}>
                  <FontAwesomeIcon icon={faAnglesLeft} size="1x" />
                </button>
                <span className="button-label">skip</span>
              </>
            </ConfirmInput>
            <span className="relative button-wrapper">
              <button disabled={disablePrevious} onClick={handlePreviousPage}>
                <FontAwesomeIcon icon={faChevronLeft} size="1x" />
              </button>
              <span onClick={handlePreviousPage} className="button-label">
                back
              </span>
            </span>

            {showPageNumbers ? (
              displayPageRange
            ) : (
              <span className="relative button-wrapper default-cursor">
                <button>{unknownPage ? "??" : pageNumber}</button>
              </span>
            )}

            <span className="relative button-wrapper">
              <button disabled={disableNext} onClick={handleNextPage}>
                <FontAwesomeIcon icon={faChevronRight} size="1x" />
              </button>
              <span onClick={handleNextPage} className="button-label">
                next
              </span>
            </span>

            <ConfirmInput
              sort={sort}
              defaultValue=""
              text={
                <>
                  Skip to {highlightedSort} values{" "}
                  {order === -1 ? "lower" : "greater"} than:
                </>
              } // if on leaderboards page then shortcut values from context
              onConfirm={(value: number) => handleSkipToValue(value, "<")}
              className={`relative button-wrapper ${
                disableNext || disableSkip ? "pointer-events-none" : ""
              }`}
            >
              <>
                <button disabled={disableNext || disableSkip}>
                  <FontAwesomeIcon icon={faAnglesRight} size="1x" />
                </button>
                <span className="button-label">skip</span>
              </>
            </ConfirmInput>
            <span className="relative button-wrapper">
              <button
                disabled={disableNext || disableSkip}
                onClick={handleLastPage}
              >
                <FontAwesomeIcon icon={faForwardStep} size="1x" />
              </button>
              <span onClick={handleLastPage} className="button-label">
                last
              </span>
            </span>
          </div>
        )}
        {to !== 0 && (
          <div className="pagination-details">
            {unknownPage ? `unknown page` : `${from}-${to}`} of{" "}
            {isFetchingPagination ? "---" : totalRows}
          </div>
        )}
      </div>
    </div>
  );
};
