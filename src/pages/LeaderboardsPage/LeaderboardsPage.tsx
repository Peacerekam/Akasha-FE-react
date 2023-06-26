import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { debounce } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";

import { BuildsColumns } from "../BuildsPage";
import {
  CritRatio,
  StatIcon,
  DisplaySets,
  CustomTable,
  WeaponMiniDisplay,
  StylizedContentBlock,
  RegionBadge,
  TeammatesCompact,
  CalculationTeammate,
} from "../../components";
import {
  FETCH_CHARACTER_FILTERS_URL,
  uidsToQuery,
  FETCH_LEADERBOARDS_URL,
  FETCH_CATEGORIES_URL_V2,
  iconUrlToNamecardUrl,
} from "../../utils/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faPeopleGroup,
  faSkull,
} from "@fortawesome/free-solid-svg-icons";
import { TableColumn } from "../../types/TableColumn";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { getIconElement } from "../../components/HelpBox/helpContentBuilds";
import "./style.scss";
import { AdsComponentManager } from "../../components/AdsComponentManager";

ChartJS.register(...registerables);

type CategoryWeaponInfo = {
  calculationId: string;
  defaultVariant?: string;
  icon: string;
  name: string;
  rarity: string;
  refinement: number;
  substat: string;
  type: string;
  details: string;
  teammates: CalculationTeammate[];
  filters?: {
    displayName: string;
    name: string;
    query: any;
  }[];
};

type CalculationInfoResponse = {
  name: string;
  short: string;
  details: string;
  addDate: number;
  element: string;
  c6: "c6" | "";
  rarity: number;
  count: number;
  characterId: number;
  characterName: string;
  characterIcon: string;
  weaponsCount: number;
  weapons: CategoryWeaponInfo[];
};

export const LeaderboardsPage: React.FC = () => {
  // state
  const [calculationInfo, setCalculationInfo] =
    useState<CalculationInfoResponse[]>();
  const [inputUID, setInputUID] = useState<string>("");
  const [lookupUID, setLookupUID] = useState<string>("");

  // context
  const { lastProfiles } = useContext(LastProfilesContext);
  const { hoverElement, updateTableHoverElement } =
    useContext(HoverElementContext);

  // hooks
  const { calculationId, variant } = useParams();
  const characterId = calculationId?.slice(0, -2);
  const navigate = useNavigate();

  const currentCategory = calculationId ?? "";
  const calculationSortKey = currentCategory
    ? // ? `calculations.${currentCategory}.result`
      "calculation.result"
    : "";

  useEffect(() => {
    fetchCalculationInfo();
  }, [characterId]);

  useEffect(() => {
    fetchChartData();
  }, [calculationId, variant]);

  const debouncedSetLookupUID = useCallback(debounce(setLookupUID, 350), []);

  useEffect(() => {
    debouncedSetLookupUID(inputUID);
  }, [inputUID]);

  const thisCalc = calculationInfo?.find((c) =>
    c.weapons.find((w) => w.calculationId === calculationId)
  );

  const thisWeaponCalc = thisCalc?.weapons.find(
    (w) => w.calculationId === calculationId
  );

  const LEADERBOARDS_COLUMNS: TableColumn<BuildsColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <div>{row.index}</div>;
        },
      },
      {
        name: "Owner",
        // sortable: true,
        // sortField: "uid",
        // sortField: "owner.nickname",
        width: "180px",
        cell: (row) => {
          return (
            <a
              className="row-link-element"
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${row.uid}`);
              }}
              href={`/profile/${row.uid}`}
            >
              {/* <ARBadge adventureRank={row.owner?.adventureRank} /> */}
              <RegionBadge region={row.owner?.region} />
              {row.owner?.nickname}
            </a>
          );
        },
      },
      {
        name: "Build name",
        sortable: false,
        sortField: "type",
        cell: (row) => {
          return (
            <div className="table-icon-text-pair">
              {row.type !== "current" ? (
                row.type
              ) : (
                <span style={{ opacity: 0.25 }}>{row.name}</span>
              )}
            </div>
          );
        },
      },
      {
        name: "Sets",
        sortable: false,
        sortField: `calculations.${currentCategory}.stats.artifactSetsFlat`,
        width: "75px",
        cell: (row) => {
          return <DisplaySets artifactSets={row.artifactSets} />;
        },
      },
      {
        name: "Crit Ratio",
        sortable: true,
        // sortFields: ["stats.critValue", "stats.critRate", "stats.critDMG"].map(
        //   (x) => `calculations.${currentCategory}.${x}`
        // ),
        sortFields: [
          "critValue",
          "stats.critRate.value",
          "stats.critDamage.value",
        ],
        cell: (row) => {
          // const build = row.calculations[currentCategory]?.stats;
          // return build ? <CritRatio stats={build} /> : <></>;
          return <CritRatio stats={row.stats} overrideCV={row.critValue} />;
        },
      },
      {
        name: "Max HP",
        sortable: true,
        // sortField: `calculations.${currentCategory}.stats.maxHP`,
        sortField: "stats.maxHp.value",
        cell: (row) => {
          // const build = row.calculations[currentCategory]?.stats;
          // if (!build) return <></>;
          // const hp = build.maxHP.toFixed(0);
          const hp = row.stats.maxHp.value.toFixed(0);
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="HP" />
              {hp}
            </div>
          );
        },
      },
      {
        name: "ATK",
        sortable: true,
        // sortField: `calculations.${currentCategory}.stats.maxATK`,
        sortField: "stats.atk.value",
        cell: (row) => {
          // const build = row.calculations[currentCategory]?.stats;
          // if (!build) return <></>;
          // const atk = build.maxATK.toFixed(0);
          const atk = row.stats.atk.value.toFixed(0);
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="ATK" />
              {atk}
            </div>
          );
        },
      },
      {
        name: "DEF",
        sortable: true,
        // sortField: `calculations.${currentCategory}.stats.maxDEF`,
        sortField: "stats.def.value",
        cell: (row) => {
          // const build = row.calculations[currentCategory]?.stats;
          // if (!build) return <></>;
          // const def = build.maxDEF.toFixed(0);
          const def = row.stats.def.value.toFixed(0);
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="DEF" />
              {def}
            </div>
          );
        },
      },
      {
        name: "EM",
        sortable: true,
        // sortField: `calculations.${currentCategory}.stats.elementalMastery`,
        sortField: "stats.elementalMastery.value",
        cell: (row) => {
          // const build = row.calculations[currentCategory]?.stats;
          // if (!build) return <></>;
          // const em = build.elementalMastery.toFixed(0);
          const em = +row.stats.elementalMastery.value.toFixed(0) || 0;
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="Elemental Mastery" />
              {em}
            </div>
          );
        },
      },
      {
        name: "ER%",
        sortable: true,
        // sortField: `calculations.${currentCategory}.stats.energyRecharge`,
        sortField: "stats.energyRecharge.value",
        cell: (row) => {
          // const build = row.calculations[currentCategory]?.stats;
          // if (!build) return <></>;
          // const er = (100 + build.energyRecharge).toFixed(1);
          const er = (row.stats.energyRecharge.value * 100).toFixed(1);
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="Energy Recharge" />
              {er}%
            </div>
          );
        },
      },
      {
        name: thisCalc?.short || "???", // currentCategory.split(' - ')[1],
        // width: "100px",
        sortable: true,
        sortField: calculationSortKey,
        cell: (row: any) => {
          // const calcResult = row.calculations[currentCategory]?.result?.toFixed(0)
          const calcResult = row.calculation.result?.toFixed(0);
          return (
            <div style={{ color: "orange", fontWeight: 600 }}>{calcResult}</div>
          );
        },
      },
    ],
    [
      currentCategory,
      calculationInfo,
      thisCalc?.short,
      calculationSortKey,
      // FETCH_LEADERBOARDS_URL, @TODO: not needed?
    ]
  );

  const fetchCalculationInfo = async () => {
    if (!characterId) return;

    const response = await axios.get(
      `${FETCH_CATEGORIES_URL_V2}?characterId=${characterId}`
    );
    const { data } = response.data;

    setCalculationInfo(data);
  };

  const [chartData, setChartData] = useState<any[]>([]);

  const fetchChartData = async () => {
    let chartURL = `/api/charts/calculations/${calculationId}`;
    const response = await axios.get(chartURL, {
      params: {
        variant,
        uids: uidsToQuery(lastProfiles.map((a) => a.uid)),
      },
    });
    const { data } = response.data;

    setChartData(data);
  };

  const blockBackgroundImage = thisCalc?.characterIcon
    ? iconUrlToNamecardUrl(thisCalc?.characterIcon)
    : "";

  const displayVariantSelector =
    thisWeaponCalc?.filters && thisWeaponCalc?.filters?.length > 0 ? (
      <div className="variant-selection-wrapper">
        Available sub-categories:
        <div className="variant-selection">
          <a
            className={!variant ? "current-selection" : ""}
            onClick={(event) => {
              event.preventDefault();
              navigate(`/leaderboards/${calculationId}/`);
            }}
            href={`/leaderboards/${calculationId}/`}
          >
            NONE
          </a>
          {/* get this from API instead */}
          {thisWeaponCalc.filters?.map((val) => {
            const isActive = variant === val.name;
            return (
              <a
                key={val.name}
                className={isActive ? "current-selection" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/leaderboards/${calculationId}/${val.name}`);
                }}
                href={`/leaderboards/${calculationId}/${val.name}`}
              >
                {val.displayName}
              </a>
            );
          })}
        </div>
      </div>
    ) : null;

  const displayRelevantCategories = (
    <>
      <div className="other-calc-container">
        {calculationInfo?.map((_cat) => {
          const categoryName = _cat.name;
          return (
            <div key={_cat.name}>
              {categoryName}
              <div className="flex">
                {_cat.weapons.map((_weapon: any, index) => {
                  const weaponicon = _weapon.icon ?? "";
                  const weaponRefinement = _weapon.refinement ?? 0;
                  const isActive = _weapon.calculationId === calculationId;
                  const leaderboardPath = `leaderboards/${
                    _weapon.calculationId
                  }/${_weapon?.defaultVariant || ""}`;

                  return (
                    <a
                      className={isActive ? "current-selection" : ""}
                      key={_weapon.name}
                      title={`${_weapon.name} R${weaponRefinement}`}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(`/${leaderboardPath}`);
                      }}
                      href={`/${leaderboardPath}`}
                    >
                      <WeaponMiniDisplay
                        icon={weaponicon}
                        refinement={weaponRefinement}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {displayVariantSelector}
    </>
  );

  const options = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          title: function (a: any[]) {
            return a[0] ? `top ${a[0].label}%` : "";
          },
        },
      },
      legend: {
        display: false,
        // labels: {
        //   color: "#ebecee",
        // }
      },
    },
    type: "scatter",
    scales: {
      x: {
        grid: {
          color: "#acaeb333",
          borderDash: [2, 2],
        },
        ticks: {
          color: "#ebecee",
          callback: function (value: any) {
            return `top ${value}%`;
          },
        },
      },
      y: {
        grid: {
          color: "#acaeb333",
          borderDash: [2, 2],
        },
        ticks: {
          color: "#ebecee",
          callback: function (value: any) {
            return `${value}`; // ... avg dmg?
          },
        },
      },
    },
    interaction: {
      intersect: false,
    },
    animation: {
      duration: 0,
    },
  };

  const displayChart = useMemo(() => {
    const formattedData = chartData.map((el, i) => ({
      y: el.avg,
      x: i + 1,
    }));

    const datasets = [
      {
        data: formattedData,
      },
    ];

    // @TODO:
    // @FIX:

    // make context around Podium + Chart + Tables
    //
    // mainTable = provide data for podium if page = 0
    // miniTable = provide data for chart searched player points
    // podium = take data from mainTable if page = 0, otherwise ask for first 3 elements

    // @TODO:
    // @FIX:

    return (
      <div className="lb-chart-wrapper">
        <Line
          data={{
            labels: formattedData.map((_, i) => i + 1),
            datasets,
          }}
          options={options}
        />
      </div>
    );
  }, [chartData]);

  return (
    <div className="flex" key={calculationId}>
      {hoverElement}
      <div id="content-container" className=" w-100">
        <div
          key={currentCategory}
          className="content-block w-100"
          style={{ display: "inline-block" }}
        >
          <StylizedContentBlock
            variant="gradient"
            revealCondition={!!calculationInfo}
            overrideImage={blockBackgroundImage}
          />
          <div
            className="relative block-highlight"
            style={{
              whiteSpace: "break-spaces",
              margin: "10px",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <a
                className="pointer back-btn"
                href="/leaderboards"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/leaderboards");
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} size="1x" /> GO BACK
              </a>
            </div>
            <div className="flex">
              {displayChart}
              {/* {displayPodium} */}
              {thisCalc && (
                <div
                  style={{
                    width: "calc(100% - 500px)",
                    minWidth: 300,
                    flexGrow: 1,
                  }}
                >
                  <div style={{ margin: 10 }}>
                    <div
                      className="flex gap-10 flex-wrap-no-wrap"
                      style={{
                        fontSize: 30,
                        // borderBottom: "1px solid white",
                      }}
                    >
                      <img
                        style={{ width: 40, height: 40, marginBottom: 15 }}
                        src={thisCalc.characterIcon}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {thisCalc.characterName} - {thisCalc.name}
                      </div>
                    </div>
                    <div>{thisWeaponCalc?.details}</div>
                  </div>
                  <div style={{ margin: "20px 10px" }}>
                    <div>
                      <span
                        className="flex gap-10"
                        style={{ flexWrap: "inherit" }}
                      >
                        Weapon:
                        <WeaponMiniDisplay
                          icon={thisWeaponCalc?.icon || ""}
                          refinement={thisWeaponCalc?.refinement || 1}
                        />
                        {thisWeaponCalc?.name}
                      </span>
                    </div>
                  </div>
                  <div
                    className="lb-team-display-wrapper"
                    style={{ margin: "20px 10px" }}
                  >
                    <div>Team:</div>
                    <TeammatesCompact
                      teammates={thisWeaponCalc?.teammates}
                      scale={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <AdsComponentManager
            adType="LeaderboardBTF"
            dataAdSlot="6204085735"
            hybrid="mobile"
            hideOnDesktop
          />

          <div className="relative other-calculations-display block-highlight highlight-tile-container">
            {displayRelevantCategories}
          </div>
        </div>

        <div className="content-block w-100">
          <StylizedContentBlock
            revealCondition={!!thisCalc?.characterIcon}
            overrideImage={blockBackgroundImage}
          />
          <div className="relative search-input-wrapper">
            UID / nickname
            <div>
              <div className="search-input relative">
                <input
                  defaultValue={inputUID}
                  onChange={(event) => {
                    setInputUID(event.target.value);
                  }}
                />
                {!inputUID && (
                  <span className="fake-placeholder">type here...</span>
                )}
              </div>
            </div>
          </div>
          {calculationInfo && (
            <div key={`${currentCategory}${variant}`}>
              <CustomTable
                fetchURL={FETCH_LEADERBOARDS_URL}
                fetchParams={{
                  uids: uidsToQuery(lastProfiles.map((a) => a.uid)),
                  uid: lookupUID,
                  variant,
                  filter: "[all]1",
                  calculationId: currentCategory,
                }}
                columns={LEADERBOARDS_COLUMNS}
                defaultSort={calculationSortKey}
                // calculationColumn={currentCategory}
                strikethrough={true}
                expandableRows
                ignoreEmptyUidsArray
                alwaysShowIndexColumn
                // hidePagination
              />

              {/* spacer */}
              <div style={{ marginTop: "30px" }} />

              <CustomTable
                fetchURL={FETCH_LEADERBOARDS_URL}
                fetchParams={{ variant, calculationId: currentCategory }}
                filtersURL={`${FETCH_CHARACTER_FILTERS_URL}?type=leaderboards`}
                columns={LEADERBOARDS_COLUMNS}
                defaultSort={calculationSortKey}
                // calculationColumn={currentCategory}
                strikethrough={true}
                expandableRows
                projectParamsToPath
                alwaysShowIndexColumn
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
