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
import { BuildsColumns } from "../BuildsPage";
import {
  CritRatio,
  StatIcon,
  DisplaySets,
  CustomTable,
  Spinner,
  WeaponMiniDisplay,
  StylizedContentBlock,
} from "../../components";
import {
  FETCH_CATEGORIES_URL,
  FETCH_LEADERBOARDS_URL,
  getCharacterCvColor,
  FETCH_CHARACTER_FILTERS_URL,
  uidsToQuery,
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
import { BASENAME } from "../../App";
import "./style.scss";
import { getIconElement } from "../../components/HelpBox/helpContentBuilds";

type CategoriesById = {
  [key: string]: {
    character: {
      name: string;
      icon: string;
    };
    calculation: {
      id: string;
      name: string;
      details: string;
      short: string;
      order: number;
      variants?: any[];
      defaultVariant?: string;
    };
    weapon?: {
      name: string;
      icon: string;
      refinement: number;
    };
  };
};

type Category = {
  label: string;
  icon: string;
  options: {
    label: string;
    value: {
      calculationId: string;
      characterId: number;
      details: string;
      short: string;
      order: number;
      filters: any[];
      defaultFilter?: string;
      weapon?: {
        icon: string;
        name: string;
        refinement: number;
      };
    };
  }[];
};

export const ARBadge = ({ adventureRank }: any) => {
  const className = adventureRank
    ? `ar-${Math.floor(adventureRank / 5) * 5}-badge`
    : "ar-60-badge";
  return (
    <span className={`ar-badge ${className}`}>AR{adventureRank ?? " ?"}</span>
  );
};

export const LeaderboardsPage: React.FC = () => {
  // state
  const [categories, setCategories] = useState<Category[]>();
  const [inputUID, setInputUID] = useState<string>("");
  const [lookupUID, setLookupUID] = useState<string>("");
  const [podiumData, setPodiumData] = useState({
    rows: [] as any,
    totalRows: 0,
  });

  // context
  const { lastProfiles } = useContext(LastProfilesContext);
  const { hoverElement, updateTableHoverElement } =
    useContext(HoverElementContext);

  // hooks
  const { calculationId, variant } = useParams();
  const navigate = useNavigate();

  const currentCategory = calculationId ?? "";
  const calculationSortKey = currentCategory
    ? `calculations.${currentCategory}.result`
    : "";

  const categoriesById = useMemo(() => {
    const map: CategoriesById = {};
    if (!categories) return map;
    for (const category of categories) {
      for (const calc of category.options) {
        map[calc.value.calculationId] = {
          character: {
            name: category.label,
            icon: category.icon,
          },
          calculation: {
            order: calc.value.order,
            id: calc.value.calculationId,
            name: calc.label,
            details: calc.value.details,
            short: calc.value.short,
            variants: calc.value.filters,
            defaultVariant: calc.value.defaultFilter,
          },
          weapon: calc.value.weapon,
        };
      }
    }
    return map;
  }, [categories]);

  const displayCategory = categoriesById[calculationId ?? ""];

  const handleFetchLeaderboard = async () => {
    const opts = {
      params: {
        sort: calculationSortKey,
        order: -1,
        size: 20,
        page: 1,
        variant,
      },
    };

    const response = await axios.get(FETCH_LEADERBOARDS_URL, opts);
    const { data, totalRows } = response.data;

    setPodiumData({
      rows: data,
      totalRows,
    });
  };

  useEffect(() => {
    if (categories) {
      handleFetchLeaderboard();
    }
  }, [categories, calculationSortKey, variant]);

  useEffect(() => {
    fetchCategories();
  }, [calculationId]);

  const debouncedSetLookupUID = useCallback(debounce(setLookupUID, 350), []);

  useEffect(() => {
    debouncedSetLookupUID(inputUID);
  }, [inputUID]);

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
              href={`${BASENAME}/profile/${row.uid}`}
            >
              <ARBadge adventureRank={row.owner?.adventureRank} />
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
        sortable: true,
        sortField: `calculations.${currentCategory}.stats.artifactSetsFlat`,
        width: "75px",
        cell: (row) => {
          return <DisplaySets artifactSets={row.artifactSets} />;
        },
      },
      {
        name: "Crit Ratio",
        sortable: true,
        sortFields: ["stats.critValue", "stats.critRate", "stats.critDMG"].map(
          (x) => `calculations.${currentCategory}.${x}`
        ),
        cell: (row) => {
          const build = row.calculations[currentCategory]?.stats;
          return build ? <CritRatio stats={build} /> : <></>;
        },
      },
      {
        name: "Max HP",
        sortable: true,
        sortField: `calculations.${currentCategory}.stats.maxHP`,
        cell: (row) => {
          const build = row.calculations[currentCategory]?.stats;
          if (!build) return <></>;
          const hp = build.maxHP.toFixed(0);
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
        sortField: `calculations.${currentCategory}.stats.maxATK`,
        cell: (row) => {
          const build = row.calculations[currentCategory]?.stats;
          if (!build) return <></>;
          const atk = build.maxATK.toFixed(0);
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
        sortField: `calculations.${currentCategory}.stats.maxDEF`,
        cell: (row) => {
          const build = row.calculations[currentCategory]?.stats;
          if (!build) return <></>;
          const def = build.maxDEF.toFixed(0);
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
        sortField: `calculations.${currentCategory}.stats.elementalMastery`,
        cell: (row) => {
          const build = row.calculations[currentCategory]?.stats;
          if (!build) return <></>;
          const em = build.elementalMastery.toFixed(0);
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
        sortField: `calculations.${currentCategory}.stats.energyRecharge`,
        cell: (row) => {
          const build = row.calculations[currentCategory]?.stats;
          if (!build) return <></>;
          // const er = (100 + build.energyRecharge).toFixed(1);
          const er = (100 + build.energyRecharge).toFixed(1);
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="Energy Recharge" />
              {er}%
            </div>
          );
        },
      },
      {
        name: displayCategory?.calculation.short, // currentCategory.split(' - ')[1],
        // width: "100px",
        sortable: true,
        sortField: calculationSortKey,
        cell: (row: any) => {
          return (
            <div style={{ color: "orange", fontWeight: 600 }}>
              {row.calculations[currentCategory]?.result?.toFixed(0)}
            </div>
          );
        },
      },
    ],
    [
      currentCategory,
      displayCategory,
      calculationSortKey,
      // FETCH_LEADERBOARDS_URL, @TODO: not needed?
    ]
  );

  const fetchCategories = async () => {
    const response = await axios.get(FETCH_CATEGORIES_URL);
    const { data } = response.data;

    setCategories(data);
  };

  const iconUrlToNamecardUrl = (url: string) => {
    return url
      .replace("UI_AvatarIcon", "UI_NameCardPic")
      .replace(".png", "_P.png");
  };

  const blockBackgroundImage =
    podiumData.rows.length > 0
      ? iconUrlToNamecardUrl(podiumData.rows[0].icon)
      : "";

  const renderRung = useCallback(
    (position: 1 | 2 | 3) => {
      const player = podiumData.rows[position - 1] ?? null;
      if (!player) return null;

      const wrapperClassNames = [
        "pointer rung-wrapper",
        position === 1 ? "gold" : "",
        position === 2 ? "silver" : "",
        position === 3 ? "bronze" : "",
      ]
        .join(" ")
        .trim();

      const squishNameFactor = {
        transform: `scaleX(${
          player?.owner?.nickname?.length > 8
            ? 8 / player?.owner?.nickname?.length
            : 1
        })`,
      };

      const result = player.calculations[currentCategory]?.result.toFixed(0);

      const cv = player?.critValue || 0;
      const borderColor = getCharacterCvColor(cv);
      const imageStyle = {
        boxShadow: `0 0 0 2px ${borderColor}`,
        backgroundImage: `url(${player.nameCardLink})`,
        backgroundPosition: "center",
      } as React.CSSProperties;

      return (
        <a
          onMouseEnter={() =>
            updateTableHoverElement({ row: player, currentCategory })
          }
          onMouseLeave={() =>
            updateTableHoverElement({ hide: true, currentCategory })
          }
          className={wrapperClassNames}
          onClick={(event) => {
            event.preventDefault();
            navigate(`/profile/${player.uid}`);
          }}
          href={`${BASENAME}/profile/${player.uid}`}
        >
          <img
            style={imageStyle}
            src={player.profilePictureLink}
            className="podium-player-icon"
          />
          <div className="rung-player-score">{result || "---"}</div>
          <div className="rung-player-name">
            <div style={squishNameFactor}>{player?.owner?.nickname}</div>
          </div>
          <div className="rung-geometry">
            <div>{position}</div>
          </div>
        </a>
      );
    },
    [JSON.stringify(podiumData.rows), currentCategory]
  );

  const displayPodium = useMemo(() => {
    return (
      <div className="podium-wrapper">
        {podiumData.rows.length === 0 ? (
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Spinner />
          </div>
        ) : (
          <>
            {renderRung(2)}
            {renderRung(1)}
            {renderRung(3)}
          </>
        )}
        {/* <div style={{ color: "brown" }}>#3 {initialData.rows[3].nickname}</div>
        <div style={{ color: "gold", transform: "translateY(-40px)" }}>
          #1 {initialData.rows[0].nickname}
        </div>
        <div style={{ color: "silver", transform: "translateY(-20px)" }}>
          #2 {initialData.rows[1].nickname}
        </div> */}
      </div>
    );
  }, [JSON.stringify(podiumData.rows)]);

  const relatedCategories = Object.values(categoriesById)
    .filter((c: any) => c.character.name === displayCategory.character.name)
    .reduce((acc: any, val) => {
      return {
        ...acc,
        [val.calculation.name]: {
          ...acc[val.calculation.name],
          ...val.calculation,
          weapons: {
            ...acc[val.calculation.name]?.weapons,
            [val.weapon?.name || ""]: {
              ...val.weapon,
              calculationId: val.calculation.id,
              defaultVariant: val.calculation.defaultVariant,
            },
          },
        },
      };
    }, {});

  const displayVariantSelector = displayCategory?.calculation?.variants ? (
    <div className="variant-selection-wrapper">
      Available sub-categories:
      <div className="variant-selection">
        <a
          className={!variant ? "current-selection" : ""}
          onClick={(event) => {
            event.preventDefault();
            navigate(`/leaderboards/${calculationId}/`);
          }}
          href={`${BASENAME}/leaderboards/${calculationId}/`}
        >
          NONE
        </a>
        {/* get this from API instead */}
        {displayCategory?.calculation.variants?.map((val) => {
          const isActive = variant === val.name;
          return (
            <a
              className={isActive ? "current-selection" : ""}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/leaderboards/${calculationId}/${val.name}`);
              }}
              href={`${BASENAME}/leaderboards/${calculationId}/${val.name}`}
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
        {Object.keys(relatedCategories).map((cKey) => {
          const _cat = relatedCategories[cKey];
          const categoryName = _cat.name;
          return (
            <div key={cKey}>
              {categoryName}
              <div className="flex">
                {Object.keys(_cat.weapons).map((wKey: string, index) => {
                  const _weapon = _cat.weapons[wKey];
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
                      href={`${BASENAME}/${leaderboardPath}`}
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

  const testSetupObject = {
    character: {},
    weapon: {},
    team: {},
    enemy: {},
  };

  return (
    <div className="flex" key={calculationId}>
      {hoverElement}
      <div className="content-block w-100" key={currentCategory}>
        <StylizedContentBlock
          variant="gradient"
          revealCondition={podiumData.rows.length > 0}
          overrideImage={blockBackgroundImage}
        />
        <div
          className="relative block-highlight"
          style={{
            whiteSpace: "break-spaces",
            margin: "10px",
          }}
        >
          <div>
            <button
              className="pointer back-btn"
              onClick={() => navigate("/leaderboards")}
            >
              <FontAwesomeIcon icon={faChevronLeft} size="1x" /> GO BACK
            </button>
          </div>
          <div className="flex">
            {displayPodium}
            {displayCategory && (
              <div
                style={{
                  width: "calc(100% - 400px)",
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
                      src={displayCategory.character.icon}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {displayCategory.character.name} -{" "}
                      {displayCategory.calculation.name}
                    </div>
                  </div>
                  <div>{displayCategory.calculation.details}</div>
                  <div style={{display: 'none'}} className="calc-setup-info-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th colSpan={2}>
                            <div
                              className="flex gap-10"
                              style={{ justifyContent: "center" }}
                            >
                              <img
                                className="table-icon"
                                src={displayCategory.character.icon}
                              />
                              Hu Tao C1 Lv. 90
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* <tr>
                          <td>Character level</td>
                          <td>90/90</td>
                        </tr>
                        <tr>
                          <td>Constellation</td>
                          <td>C1</td>
                        </tr> */}
                        <tr>
                          <td>Talent levels</td>
                          <td>10/10/10</td>
                        </tr>
                        <tr>
                          <td>HP</td>
                          <td>below 50%</td>
                        </tr>
                        <tr>
                          <td>Skill (E)</td>
                          <td>Active</td>
                        </tr>
                      </tbody>
                    </table>

                    <table>
                      <thead>
                        <tr>
                          <th colSpan={2}>
                            <div
                              className="flex gap-10"
                              style={{ justifyContent: "center" }}
                            >
                              <WeaponMiniDisplay
                                icon={displayCategory.weapon?.icon || ""}
                                refinement={
                                  displayCategory.weapon?.refinement || 1
                                }
                              />
                              Staff of Homa R1 Lv. 90
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* <tr>
                          <td>Weapon level</td>
                          <td>90/90</td>
                        </tr>
                        <tr>
                          <td>Refinement</td>
                          <td>R1</td>
                        </tr> */}
                        <tr>
                          <td>HP</td>
                          <td>below 50%</td>
                        </tr>
                      </tbody>
                    </table>

                    <table>
                      <thead>
                        <tr>
                          <th colSpan={2}>
                            <div
                              className="flex gap-10"
                              style={{ justifyContent: "center" }}
                            >
                              <FontAwesomeIcon icon={faPeopleGroup} size="1x" />
                              Team buffs
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <StatIcon name="Hydro DMG Bonus" /> Hydro Resonance
                          </td>
                          <td>
                            <StatIcon name="HP%" /> +25% HP
                          </td>
                        </tr>
                        <tr>
                          <td>{getIconElement("Zhongli")} Dominus Lapidis</td>
                          <td>
                            <StatIcon name="Pyro DMG Bonus" />
                            Enemy Pyro DMG RES -20%
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table>
                      <thead>
                        <tr>
                          <th colSpan={2}>
                            <div
                              className="flex gap-10"
                              style={{ justifyContent: "center" }}
                            >
                              <FontAwesomeIcon icon={faSkull} size="1x" />
                              Enemy Lv. 90
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* <tr>
                          <td>Level</td>
                          <td>90</td>
                        </tr> */}
                        <tr>
                          <td>Pyro RES</td>
                          <td>10%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ margin: 10 }}>
                  <div>
                    <span className="flex gap-10">
                      Weapon:
                      <WeaponMiniDisplay
                        icon={displayCategory.weapon?.icon || ""}
                        refinement={displayCategory.weapon?.refinement || 1}
                      />
                      {displayCategory.weapon?.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative other-calculations-display block-highlight highlight-tile-container">
          {displayRelevantCategories}
        </div>
      </div>

      <div className="content-block w-100">
        <StylizedContentBlock
          revealCondition={podiumData.rows.length > 0}
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
        {displayCategory && (
          <div key={currentCategory}>
            <CustomTable
              fetchURL={FETCH_LEADERBOARDS_URL}
              fetchParams={{
                uids: uidsToQuery(lastProfiles.map((a) => a.uid)),
                uid: lookupUID,
                variant,
                filter: "[all]1",
              }}
              columns={LEADERBOARDS_COLUMNS}
              defaultSort={calculationSortKey}
              calculationColumn={currentCategory}
              expandableRows
              ignoreEmptyUidsArray
              // hidePagination
            />

            {/* spacer */}
            <div style={{ marginTop: "30px" }} />

            <CustomTable
              fetchURL={FETCH_LEADERBOARDS_URL}
              fetchParams={{ variant }}
              filtersURL={`${FETCH_CHARACTER_FILTERS_URL}?type=leaderboards`}
              columns={LEADERBOARDS_COLUMNS}
              defaultSort={calculationSortKey}
              calculationColumn={currentCategory}
              expandableRows
              projectParamsToPath
            />
          </div>
        )}
      </div>
    </div>
  );
};
