import "./style.scss";

import {
  FETCH_ACCOUNTS_URL,
  FETCH_CATEGORIES_URL_V2,
  FETCH_COLLECTION_SIZE_URL,
  FETCH_SEARCH_USERS_URL,
  FETCH_STYGIAN_LB_URL,
  abortSignalCatcher,
  arrayPushOrSplice,
  cssJoin,
  getSessionIdFromCookie,
  monthDayYear_shortNumNum,
  normalizeText,
  uidsToQuery,
} from "../../utils/helpers";
import {
  FETCH_ARTIFACTS_URL,
  FETCH_BUILDS_URL,
  FETCH_LEADERBOARDS_URL,
} from "../../utils/helpers";
import { FilterOption, FiltersContainer } from "./Filters";
import {
  GenshinUserCard,
  Pagination,
  Spinner,
  StatIcon,
  TeammatesCompact,
  WeaponMiniDisplay,
} from "../../components";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios, { AxiosRequestConfig } from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { ArtifactDetails } from "../ArtifactDetails";
import { ExpandedRowBuilds } from "../ExpandedRowBuilds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import PerfectScrollbar from "react-perfect-scrollbar";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";

type CustomTableProps = {
  columns: any[];
  filtersURL?: string;
  fetchURL?: string;
  fetchParams?: any;
  defaultSort?: string;
  // calculationColumn?: string;
  strikethrough?: boolean;
  expandableRows?: boolean;
  hidePagination?: boolean;
  projectParamsToPath?: boolean;
  ignoreEmptyUidsArray?: boolean;
  alwaysShowIndexColumn?: boolean;
  growContentOnExpandedRow?: boolean;
  warningMessage?: any;
};

export type FetchParams = {
  sort: string;
  order: number;
  size: number;
  page: number;
  filter?: string;
  uids?: string;
  p?: string;
  fromId?: string;
  li?: number | string;
};

const getFixedSortKey = (key: string, fetchURL?: string | null) => {
  if (!fetchURL) return key;

  const collectionName = getCollectionName(fetchURL);
  if (!collectionName) return key;

  const collectionPrefix =
    {
      characters: "Character",
      artifacts: "Artifact",
      leaderboards: "Leaderboard",
    }[collectionName] || "";

  const fixKeyMap: { [key: string]: string } = {
    critValue: "Crit Value",
    critRate: "Crit Rate",
    critDamage: "Crit DMG",
    critDMG: "Crit DMG",
    maxHp: "Max HP",
    atk: "ATK",
    def: "DEF",
    elementalMastery: "Elemental Mastery",
    energyRecharge: "Energy Recharge",
    hydroDamageBonus: "Hydro DMG Bonus",
    geoDamageBonus: "Geo DMG Bonus",
    pyroDamageBonus: "Pyro DMG Bonus",
    cryoDamageBonus: "Cryo DMG Bonus",
    electroDamageBonus: "Electro DMG Bonus",
    anemoDamageBonus: "Anemo DMG Bonus",
    dendroDamageBonus: "Dendro DMG Bonus",
    physicalDamageBonus: "Physical DMG Bonus",
    healingBonus: "Healing Bonus",
    name: `${collectionPrefix} Name`.trim(),
    sortableType: "Build Name",
    lastBuildUpdate: "Last Build Update",
    lastArtifactUpdate: "Last Artifact Update",
    characterName: "Character Name",
    element: "Character Element",
    c6: "C6",
  };

  return fixKeyMap[key] || key;
};

const getCollectionName = (fetchURL: string = "") => {
  if (fetchURL?.startsWith(FETCH_SEARCH_USERS_URL)) {
    return "accounts";
  }

  const collectionName = {
    [FETCH_ARTIFACTS_URL]: "artifacts",
    [FETCH_STYGIAN_LB_URL]: "stygianLb",
    [FETCH_LEADERBOARDS_URL]: "charactersLb",
    [FETCH_BUILDS_URL]: "characters",
    [FETCH_ACCOUNTS_URL]: "accounts",
    [FETCH_CATEGORIES_URL_V2]: "leaderboards",
  }[fetchURL];

  return collectionName;
};

export const CustomTable: React.FC<CustomTableProps> = ({
  fetchURL = null,
  fetchParams = {},
  columns = [],
  filtersURL,
  defaultSort = null,
  // calculationColumn = "",
  strikethrough = false,
  expandableRows = false,
  hidePagination = false,
  projectParamsToPath = false,
  ignoreEmptyUidsArray = false,
  alwaysShowIndexColumn = false,
  growContentOnExpandedRow = false,
  warningMessage,
}) => {
  const [isFetchingPagination, setIsFetchingPagination] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [totalRowsHash, setTotalRowsHash] = useState<string>("");
  const [totalRowsCount, setTotalRowsCount] = useState<number>(0);
  const [hideIndexColumn, setHideIndexColumn] = useState(false);
  const [paramsProjection, setParamsProjection] = useState(false);
  const [unknownPage, setUnknownPage] = useState(false);
  const [warningText, setWarningText] = useState(warningMessage);

  const { updateTableHoverElement } = useContext(HoverElementContext);
  const { translate, language } = useContext(TranslationContext);
  const { lastProfiles } = useContext(LastProfilesContext);
  const { adProvider, setContentWidth, setPreventContentShrinking } =
    useContext(AdProviderContext);

  const location = useLocation();
  const navigate = useNavigate();

  const defaultParams = {
    sort: defaultSort || "",
    order: -1,
    size: 20,
    page: 1,
    filter: "",
    uids: "",
    p: "",
    fromId: "",
    li: "",
  };

  const [params, setParams] = useState<FetchParams>(defaultParams);
  const [seed, setSeed] = useState("");

  const invalidateCache = async (md5?: string) => {
    const q = Math.random().toString().slice(2);
    setSeed(q);

    if (!fetchURL) return;

    try {
      const opts: AxiosRequestConfig<any> = {
        params: {
          ...params,
          ...fetchParams,
          seed,
          md5,
        },
        headers: {
          Authorization: `Bearer ${getSessionIdFromCookie()}`,
        },
      };

      const response = await axios.get(fetchURL, opts);
      const { data } = response.data;

      const newRows = rows.map((row) => {
        const newDataIndex = data.findIndex(
          (x: any) => x._id === row._id && !x.isExpandRow
        );
        const newData = newDataIndex > -1 ? data[newDataIndex] : {};
        const isDeleted = !!(md5 === row.md5 && data.length === 0);
        const isExpandRow = !!row.isExpandRow;

        if (newData?.index) {
          delete newData.index;
        }

        return {
          isDeleted,
          ...row,
          ...newData,
          isExpandRow,
          ...(isDeleted ? { isDeleted: true } : {}),
        };
      });

      setRows(newRows);

      newRows.forEach((row, rowIndex) => {
        const closeExpandRow =
          row?.isExpandRow && newRows[rowIndex - 1]?.isDeleted;

        if (!closeExpandRow) return;
        setExpandedRows((prev) => arrayPushOrSplice(prev, row._id));
      });
    } catch (err) {
      console.log(err);
    }
  };

  // @TODO: react-query
  // @FIX react-query
  // const {
  //   data: _data,
  //   isLoading,
  //   isFetching,
  //   isPreviousData,
  // } = useFetchTableData(fetchURL, params);

  // const rows = _data?.data || []
  // const totalRowsHash = _data?.totalRowsHash || ''

  const noDataFound = useMemo(
    () => rows.length === 0 && !isLoading,
    [rows.length, isLoading]
  );

  const appendParamsToURL = () => {
    if (!paramsProjection) return;

    const build = location.search.startsWith("?build=");
    if (build) return; // do not append params if BuildPreview component is active

    const tmp: string[] = [];
    const ignoredParams = ["fromId", "page", "li", "build", "lastProfiles"]; // @TODO: test if this is ok
    for (const key of Object.keys(params)) {
      const value = (params as any)?.[key];

      // do not append if its ignored key
      if (ignoredParams.includes(key)) continue;

      // do not append if its a default value
      if ((defaultParams as any)[key] === value) continue;

      // do not append page pointers if it's the first page
      if (key === "p" && params.page === 1 && !unknownPage) continue;

      tmp.push(`${key}=${value}`);
    }

    // const toAppend = encodeURI(tmp.join("&"));
    const toAppend = tmp.join("&");
    const hash = location.hash || "";
    const suffix = `${toAppend}${hash}`;
    const newURL = suffix ? `?${suffix}` : "";
    navigate(newURL, { replace: true, state: location.state });
  };

  const readParamsFromURL = () => {
    if (!location.search) return;

    const searchQuery = location.search;
    const query = new URLSearchParams(searchQuery);

    const tmp: any = {};
    query.forEach((value, key) => {
      const actualValue = isNaN(+value) ? value : +value;
      if (key === "p") {
        const _arr = value.split("|");
        if (_arr.length !== 2) return;
        const invalidKey = !!(_arr[0] !== "lt" && _arr[0] !== "gt");
        const invalidValue = _arr[1] === "";
        if (invalidKey || invalidValue) return;
        if (!fetchParams.calculationId && !fetchParams.version) {
          setHideIndexColumn(true);
        }
        setUnknownPage(true);
      }
      if ((defaultParams as any)?.[key]?.toString() !== actualValue) {
        tmp[key] = actualValue;
      }
    });

    setParams((prev) => ({
      ...prev,
      ...tmp,
    }));
  };

  useEffect(() => {
    setWarningText(warningMessage);
  }, [warningMessage]);

  useEffect(() => {
    if (projectParamsToPath) {
      readParamsFromURL();
    }
  }, [projectParamsToPath]);

  useEffect(() => {
    if (projectParamsToPath) {
      appendParamsToURL();
      setParamsProjection(true);
    }

    if (fetchURL) {
      if (ignoreEmptyUidsArray && !fetchParams.uids && !fetchParams.uid) {
        setExpandedRows([]);
        setTotalRowsCount(0);
        setRows([]);
        return;
      }

      const abortController = new AbortController();
      handleFetch(abortController);
      return () => {
        abortController.abort();
      };
    }
  }, [
    JSON.stringify(params),
    JSON.stringify(fetchParams),
    fetchURL,
    projectParamsToPath,
    ignoreEmptyUidsArray,
  ]);

  const getSetTotalRows = async (
    totalRowsHash: string,
    abortController: AbortController
  ) => {
    if (!fetchURL) return;

    const collectionName = getCollectionName(fetchURL);
    if (!collectionName || collectionName === "leaderboards") return;

    setIsFetchingPagination(true);

    const totalRowsOpts: AxiosRequestConfig<any> = {
      signal: abortController?.signal,
      params: {
        variant: collectionName,
        hash: totalRowsHash,
      },
    };

    const response = await axios.get(FETCH_COLLECTION_SIZE_URL, totalRowsOpts);

    const { totalRows } = response.data;
    setTotalRowsCount(totalRows);
    setIsFetchingPagination(false);
  };

  useEffect(() => {
    if (!totalRowsHash) return;
    const abortController = new AbortController();
    getSetTotalRows(totalRowsHash, abortController);

    return () => {
      abortController.abort();
    };
  }, [totalRowsHash]);

  useEffect(() => {
    setRows((prev) => {
      const newRows = prev.filter((row) => !row.isExpandRow);
      for (const expandedRowId of expandedRows) {
        const index = newRows.findIndex((row) => row._id === expandedRowId);
        if (index === -1) continue;

        const newRow = {
          ...newRows[index],
          isExpandRow: true,
        };

        const cutoffIndex = index + 1;
        newRows.splice(cutoffIndex, 0, newRow);
      }
      return newRows;
    });

    const isFlexibleContent = growContentOnExpandedRow; // && adProvider === "playwire";

    if (isFlexibleContent) {
      const hasExpandedRows = expandedRows.length > 0;
      setPreventContentShrinking(
        "custom-table",
        hasExpandedRows ? "add" : "remove"
      );
    }

    return () => {
      if (isFlexibleContent) {
        setContentWidth(1100);
      }
    };
  }, [expandedRows.length, growContentOnExpandedRow, adProvider]);

  useEffect(() => {
    const isFlexibleContent = growContentOnExpandedRow; // && adProvider === "playwire";

    if (isFlexibleContent) {
      const hasExpandedRows = expandedRows.length > 0;
      const newContentWidth = hasExpandedRows ? 1280 : 1100;
      setContentWidth(newContentWidth);
    }
  }, [rows]);

  const handleFetch = async (abortController: AbortController) => {
    if (!fetchURL) return;

    setIsLoading(true);

    const opts: AxiosRequestConfig<any> = {
      signal: abortController.signal,
      headers: {
        Authorization: `Bearer ${getSessionIdFromCookie()}`,
      },
      params: {
        ...params,
        ...fetchParams,
      },
    };

    const getSetData = async () => {
      const response = await axios.get(fetchURL, opts);
      const { data, totalRowsHash } = response.data;

      setExpandedRows([]);
      setRows(data || []);
      setTotalRowsHash(totalRowsHash);
    };

    await abortSignalCatcher(getSetData);
    setIsLoading(false);

    if (params.page !== 1) {
      setWarningText(undefined);
    }
  };

  const tableClassNames = useMemo(
    () =>
      cssJoin([
        "custom-table",
        params.sort?.startsWith("substats") // || params.sort === "critValue"
          ? `highlight-${normalizeText(params.sort?.replace("substats", ""))}`
          : "",
        params.sort?.startsWith("stats") // || params.sort === "critValue"
          ? `highlight-${normalizeText(
              params.sort
                ?.replace("stats", "")
                .replace("value", "")
                .replace("max", "")
                .replace("Damage", "DMG")
            )}`
          : "",
      ]),
    [params.sort]
  );

  const renderHeaders = useMemo(() => {
    const handleSetSort = (sortField: string) => {
      setParams((prev) => ({
        ...prev,
        sort: sortField,
        order: sortField === prev.sort ? prev.order * -1 : -1,
        page: 1,
        p: "",
        li: "",
      }));
    };

    const handleClickHeader = (
      column: any,
      event: React.MouseEvent<HTMLTableCellElement, MouseEvent>
    ) => {
      const {
        sortable,
        sortField,
        // sortFields
      } = column;
      if (!sortable || !sortField) return;
      handleSetSort(sortField);
    };

    const displaySortIcon = (order: number = 1) => {
      const iconClassNames = cssJoin([
        "sort-direction-icon",
        order === -1 ? "rotate-180deg" : "",
      ]);

      return (
        <FontAwesomeIcon
          className={iconClassNames}
          // icon={params.order === -1 ? faChevronDown : faChevronUp}
          icon={faChevronUp}
          size="1x"
        />
      );
    };

    const renderSortField = (key: string, index: number) => {
      const displayKey = key.replace(".value", "").split(".").pop(); // get last
      if (!displayKey) return null;
      const isHighlighted = params.sort && key === params.sort;
      const classNames = cssJoin([
        "flex nowrap gap-5",
        isHighlighted ? "highlight-cell" : "",
      ]);

      const fixKey = getFixedSortKey(displayKey, fetchURL);

      return (
        <div
          key={key}
          className={classNames}
          onClick={() => handleSetSort(key)}
        >
          <StatIcon name={fixKey} />
          {translate(fixKey)}
          {isHighlighted ? displaySortIcon(params.order) : null}
        </div>
      );
    };

    return columns.map((column: any, index) => {
      const { name, sortable, sortField, sortFields, colSpan } = column;
      const isHighlighted =
        params.sort &&
        (sortField === params.sort || sortFields?.includes(params.sort));

      const classNames = cssJoin([
        "relative",
        isHighlighted ? "highlight-cell" : "",
        sortable ? "sortable-column" : "",
      ]);

      let columnName: string | JSX.Element =
        typeof name === "string" ? translate(name) : name;

      if (sortFields?.includes(params.sort)) {
        const key = params.sort.replace(".value", "").split(".").pop(); //
        if (!key) return null;

        const fixKey = getFixedSortKey(key, fetchURL);

        columnName = (
          <>
            <StatIcon name={fixKey} /> {translate(fixKey)}
          </>
        );
      }

      return (
        <th
          key={`${name}-${index}`}
          className={classNames}
          onClick={(event) => handleClickHeader(column, event)}
          colSpan={isHighlighted ? colSpan ?? 0 : 1}
          style={{
            width: column.width,
            display:
              (hideIndexColumn && name === "#") ||
              (isHighlighted && colSpan === 0)
                ? "none"
                : "",
          }}
        >
          <span className="header-wrapper">
            {columnName}
            {isHighlighted ? displaySortIcon(params.order) : null}
          </span>
          {sortFields && (
            <span className="sort-fields-picker-wrapper">
              {sortFields.map(renderSortField)}
            </span>
          )}
        </th>
      );
    });
  }, [columns, params.order, params.sort, hideIndexColumn, translate]);

  const renderExpandRow = useCallback(
    (row: any) => {
      const isProfileRow = !!row.achievements;

      if (isProfileRow) {
        return (
          <>
            <div className="flex expanded-row">
              <div style={{ overflow: "hidden" }}>
                <a
                  className="uid-result"
                  href={`/profile/${row.uid}`}
                  onClick={(event) => event.preventDefault()}
                >
                  <GenshinUserCard
                    accountData={{ account: row }}
                    isAccountOwner
                    showBackgroundImage
                    handleToggleModal={(event: any) => {
                      event.preventDefault();
                      navigate(`/profile/${row.uid}`);
                    }}
                    showcaseOverride={true}
                  />
                </a>
              </div>
            </div>
          </>
        );
      }

      const isCategoriesRow = !!row.weapons;

      if (isCategoriesRow) {
        const isNiche = row.label === "niche";
        return (
          <>
            <div className="flex expanded-row categories-exanded-row clickable-icons">
              <div style={{ overflow: "hidden" }}>
                {row.weapons.map((weapon: any) => {
                  const _variant = weapon.defaultVariant || "";
                  const leaderboardPath = `leaderboards/${weapon.calculationId}/${_variant}`;
                  const fullName = `${weapon?.name} R${weapon.refinement}`;
                  return (
                    <a
                      key={fullName}
                      title={fullName}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(`/${leaderboardPath}`);
                      }}
                      href={`/${leaderboardPath}`}
                    >
                      <div className="table-icon-text-pair">
                        <WeaponMiniDisplay
                          icon={weapon.icon}
                          refinement={weapon.refinement}
                        />
                        {translate(weapon.name)}
                      </div>
                    </a>
                  );
                })}
              </div>

              <div>
                <TeammatesCompact
                  teammates={row.weapons[0].teammates}
                  scale={3}
                />
                {isNiche && (
                  <div
                    style={{
                      width: 330,
                      marginTop: 20,
                      color: "gray",
                      textAlign: "center",
                      fontSize: 14,
                    }}
                  >
                    This leaderboard was marked as
                    <span
                      style={{ width: "auto", display: "inline" }}
                      className="c-badge-wrapper"
                      title="This leaderboard will not be prioritized on profile highlights"
                    >
                      <span
                        style={{
                          width: "auto",
                          fontSize: 11,
                          marginLeft: 5,
                          marginRight: 5,
                          display: "inline",
                          color: "white",
                        }}
                        className={`c-badge c-0-badge`}
                      >
                        {row.label?.toUpperCase()}
                      </span>
                    </span>
                    and will <b>not</b> be prioritized on profile highlights
                  </div>
                )}
              </div>
              {/* <div style={{ overflow: "hidden" }}>
              show top 1 build for each category?
            </div> */}
            </div>
          </>
        );
      }

      const isStygianRow = !!row.enemies;

      if (isStygianRow) {
        //  make a separate component for this?
        return (
          <div className="expanded-row">
            <div className="stygian-expanded-row">
              <div className="stygian-details-row">
                <div>
                  Stygian Onslaught {row.version}: "{row.name}"
                </div>
                <div>
                  {new Date(+(`${row?.start_time}000` || 0))?.toLocaleString(
                    language,
                    monthDayYear_shortNumNum
                  )}
                  {" - "}
                  {new Date(+(`${row?.end_time}000` || 0))?.toLocaleString(
                    language,
                    monthDayYear_shortNumNum
                  )}
                </div>
              </div>
              <div>
                {row.enemies &&
                  row.enemies.map((enemy: any) => {
                    const baseName = enemy.enemyName.split(":")[0];
                    const nameCont = enemy.enemyName.split(":")[1];
                    return (
                      <span
                        className="table-icon-text-pair"
                        key={enemy.enemyName}
                        style={{ alignItems: "center" }}
                      >
                        <img
                          style={{ height: 100, width: 100 }}
                          src={enemy.icon}
                          alt=" "
                        />
                        <div>
                          <div style={{ fontSize: 18 }}>
                            <b>{baseName}</b>
                          </div>
                          <div>{nameCont}</div>
                        </div>
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        );
      }

      const isArtifactRow = !!row.equipType;

      if (isArtifactRow) {
        return <ArtifactDetails uid={row.uid} artifactHash={row._id} />;
      }

      return (
        <ExpandedRowBuilds
          row={row}
          isProfile={!!fetchParams.uid && !fetchParams.calculationId}
          invalidateCache={invalidateCache}
        />
      );
    },
    [translate, rows]
  );

  const shouldHighlightRows = useMemo(
    () =>
      columns.findIndex((c) => c.name === "Owner") > -1 || // for Artifacts, Builds and Leaderboard pages
      columns.findIndex((c) => c.name === "Signature") > -1, // for Profiles page
    [columns]
  );

  const renderRows = useMemo(() => {
    const handleClickRow = (row: any) => {
      if (row?.isDeleted) return;
      if (!expandableRows) return;
      setExpandedRows((prev) => arrayPushOrSplice(prev, row._id));
    };

    return rows.map((row) => {
      const { isExpandRow } = row;
      if (isExpandRow) {
        return (
          <tr key={`${row._id}-expanded`} className="expanded-tr">
            <td colSpan={columns.length}>{renderExpandRow(row)}</td>
          </tr>
        );
      }

      // @TODO: patreon
      const patreonObj = row.owner?.patreon || row.patreon;

      const enkaOwner = row?.playerInfo?.enkaOwner || row?.owner?.enkaOwner;
      const isEnkaPatreon = (enkaOwner?.profile?.level || 0) !== 0;

      const rowClassNames = cssJoin([
        expandableRows && !row?.isDeleted ? "pointer" : "",
        shouldHighlightRows && (!!patreonObj?.active || isEnkaPatreon)
          ? "decorate-row"
          : "",
        shouldHighlightRows && !!patreonObj?.active
          ? `patreon-${patreonObj?.color || "cyan"}` // default to cyan
          : "",
        shouldHighlightRows && isEnkaPatreon ? "patreon-royalblue" : "",
        // {
        //   1: "decorate-row patreon-gold",
        //   2: "decorate-row patreon-white",
        //   3: "decorate-row patreon-brown",
        // }[row.index as number],
      ]);

      return (
        <tr
          key={`${row._id}-${params.sort}`}
          className={rowClassNames}
          onMouseEnter={() =>
            updateTableHoverElement({
              row,
              strikethrough,
              // currentCategory: calculationColumn
            })
          }
          onMouseLeave={() =>
            updateTableHoverElement({
              hide: true,
              strikethrough,
              // currentCategory: calculationColumn,
            })
          }
          onClick={() => handleClickRow(row)}
        >
          {columns.map((column, index) => {
            const { sortField, sortFields, getDynamicTdClassName } = column;
            const isHighlighted =
              params.sort &&
              (sortField === params.sort || sortFields?.includes(params.sort));

            const tdClassNames = cssJoin([
              isHighlighted ? "highlight-cell" : "",
              getDynamicTdClassName ? getDynamicTdClassName(row) : "",
              !hideIndexColumn && column.name === "#" ? "first-column" : "",
              hideIndexColumn && index === 1 ? "first-column" : "",
              row.isDeleted ? "strike-through" : "",
              row.isHidden ? "opacity-5" : "",
            ]);

            return (
              <td
                style={{
                  width: column.width,
                  display: hideIndexColumn && column.name === "#" ? "none" : "",
                }}
                className={tdClassNames}
                key={`${sortField}-${index}`}
              >
                {column.cell(row)}
              </td>
            );
          })}
        </tr>
      );
    });
  }, [
    // JSON.stringify(expandedRows),
    // params.sort,
    // JSON.stringify(rows),
    // calculationColumn,
    rows,
    columns.length,
    hideIndexColumn,
    translate,
  ]);

  const noDataRow = useMemo(
    () => (
      <tr>
        <td colSpan={columns.length}>
          <div className="no-data-row">
            {/* <img alt="Qiqi's Dead" src={QiqiFallen100} /> */}
            <div>No data found</div>
          </div>
        </td>
      </tr>
    ),
    [columns.length]
  );

  const wrapperClassNames = cssJoin([
    "custom-table-wrapper",
    isLoading ? "disable-table" : "",
  ]);

  const fillerRow = useMemo(() => {
    if (totalRowsCount < params.size) return null;
    const realRowsCount = rows.filter((r) => !r.isExpandRow).length;
    const numOfFillerRows = params.size - realRowsCount;
    const arr = Array(numOfFillerRows).fill(0);
    return arr.map((_, i) => (
      <tr key={i} style={{ pointerEvents: "none" }}>
        <td colSpan={columns.length}></td>
      </tr>
    ));
  }, [rows.length, columns.length, params.size, totalRowsCount]);

  const handleChangeFilters = (filters: FilterOption[]) => {
    let stringified = "";
    let uids = "";

    filters.forEach((f) => {
      if (f.name === "lastProfiles") {
        if (params.uids) {
          const searchQuery = location.search;
          const query = new URLSearchParams(searchQuery);
          uids = query.get("uids") || "";
        } else {
          uids = uidsToQuery(lastProfiles.map((x) => x.uid));
        }
      } else if (f.name !== "" && f.value !== "") {
        stringified += `[${f.name}]${f.value}`;
      }
    });

    if (params.filter === stringified && params.uids === uids) return;

    setParams((prev) => ({
      ...prev,
      uids,
      page: 1,
      p: "",
      filter: stringified,
    }));

    if (warningText) {
      setWarningText(undefined);
    }
  };

  // hardcoded last column
  // ignore all elements that are not strings
  const calculationShortName = useMemo(
    () =>
      columns[columns.length - 1]?.name?.props?.children
        ?.filter((x: any) => typeof x === "string")
        ?.join("")
        ?.trim(),
    [columns.length]
  );

  return (
    <div className={wrapperClassNames}>
      {filtersURL && (
        <FiltersContainer
          fetchURL={filtersURL}
          onFiltersChange={handleChangeFilters}
          projectParamsToPath={projectParamsToPath}
        />
      )}
      <PerfectScrollbar
        options={{
          suppressScrollY: true,
          // suppressScrollX: false,
        }}
      >
        <table className={tableClassNames} cellSpacing={0}>
          <thead>
            {warningText && (
              <tr
                className="warning-message"
                onClick={() => setWarningText(undefined)}
              >
                <td className="text">{warningMessage}</td>
                <td className="backdrop"></td>
              </tr>
            )}
            <tr>{renderHeaders}</tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="dark-overlay-table-only">
                <td>
                  <Spinner />
                </td>
              </tr>
            )}
            {rows.length > 0 && renderRows}
            {noDataFound && noDataRow}
            {!noDataFound && fillerRow}
          </tbody>
        </table>
      </PerfectScrollbar>
      {!hidePagination && (
        <Pagination
          isDataLoading={isLoading}
          isFetchingPagination={isFetchingPagination}
          pageSize={params.size}
          pageNumber={params.page}
          sort={params.sort}
          order={params.order}
          totalRows={totalRowsCount}
          setParams={setParams}
          rows={rows}
          unknownPage={unknownPage}
          setHideIndexColumn={setHideIndexColumn}
          setUnknownPage={setUnknownPage}
          calculationShortName={calculationShortName} // last column is always short calc name?
          alwaysShowIndexColumn={alwaysShowIndexColumn}
        />
      )}
    </div>
  );
};
