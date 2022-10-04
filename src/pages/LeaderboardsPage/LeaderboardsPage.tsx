import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import { BuildsColumns } from "../BuildsPage";

import {
  CritRatio,
  StatIcon,
  DisplaySets,
  CustomTable,
  Spinner,
  TableHoverElement,
  WeaponMiniDisplay,
} from "../../components";
import {
  FETCH_CATEGORIES_URL,
  FETCH_LEADERBOARDS_URL,
  getCharacterCvColor,
  FETCH_CHARACTER_FILTERS_URL,
  uidsToQuery,
} from "../../utils/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { TableColumn } from "../../types/TableColumn";

import { StylizedContentBlock } from "../../components/StylizedContentBlock";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";

import "./style.scss";

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
      weapon?: {
        icon: string;
        name: string;
        refinement: number;
      };
    };
  }[];
};

export const ARBadge = ({ adventureRank }: any) => (
  <span className={`ar-badge ar-${Math.floor(adventureRank / 5) * 5}-badge`}>
    AR{adventureRank}
  </span>
);

export const LeaderboardsPage: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>();
  const [inputUID, setInputUID] = useState<string>("");
  const [lookupUID, setLookupUID] = useState<string>("");
  const [hoverPreview, setHoverPreview] = useState<any | null>(null);

  const { lastProfiles } = useContext(LastProfilesContext);
  const navigate = useNavigate();
  const { calculationId } = useParams();
  const pathname = window.location.pathname;

  const [initialData, setInitialData] = useState({
    rows: [] as any,
    totalRows: 0,
  });

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
          },
          weapon: calc.value.weapon,
        };
      }
    }
    return map;
  }, [categories]);

  const displayCategory = categoriesById[currentCategory];

  const handleFetchLeaderboard = async () => {
    const opts = {
      params: {
        sort: calculationSortKey,
        order: -1,
        size: 20,
        page: 1,
      },
    };

    const response = await axios.get(FETCH_LEADERBOARDS_URL, opts);
    const { data, totalRows } = response.data;

    setInitialData({
      rows: data,
      totalRows,
    });
  };

  useEffect(() => {
    if (categories) {
      handleFetchLeaderboard();
    }
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [calculationId]);

  useEffect(() => {
    if (calculationId) {
      setCurrentCategory(calculationId);
    }
  }, [calculationId]);

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
              href={`${pathname}#/profile/${row.uid}`}
            >
              <ARBadge adventureRank={row.owner?.adventureRank} />
              {row.owner?.nickname}
            </a>
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
        sortField: `calculations.${currentCategory}.stats.critValue`,
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
      FETCH_LEADERBOARDS_URL,
    ]
  );

  const fetchCategories = async () => {
    const response = await axios.get(FETCH_CATEGORIES_URL);
    const { data } = response.data;

    setCategories(data);
  };

  const updateTableHoverElement = (props: any) => {
    const el = (
      <TableHoverElement
        currentCategory={currentCategory}
        listingType={"table"}
        {...props}
      />
    );
    setHoverPreview(el);
  };

  const iconUrlToNamecardUrl = (url: string) => {
    return url
      .replace("UI_AvatarIcon", "UI_NameCardPic")
      .replace(".png", "_P.png");
  };

  const blockBackgroundImage =
    initialData.rows.length > 0
      ? iconUrlToNamecardUrl(initialData.rows[0].icon)
      : "";

  const renderRung = (position: 1 | 2 | 3) => {
    const player = initialData.rows[position - 1] ?? null;
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
        player?.owner?.nickname?.length > 8 ? 8 / player?.owner?.nickname?.length : 1
      })`,
    };

    const result = player.calculations[currentCategory]?.result.toFixed(0);

    const cv = player?.critValue || 0;
    const borderColor = getCharacterCvColor(cv);
    const imageStyle = {
      boxShadow: `0 0 0 2px ${borderColor}`,
      background: `url(${player.nameCardLink})`,
      backgroundPosition: "center",
    } as React.CSSProperties;

    return (
      <a
        onMouseEnter={() => updateTableHoverElement({ row: player })}
        onMouseLeave={() => updateTableHoverElement({ hide: true })}
        className={wrapperClassNames}
        onClick={(event) => {
          event.preventDefault();
          navigate(`/profile/${player.uid}`);
        }}
        href={`${pathname}#/profile/${player.uid}`}
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
  };

  const Podium = useCallback(() => {
    return (
      <div className="podium-wrapper">
        {initialData.rows.length === 0 ? (
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
  }, [initialData.rows.length, calculationId]);

  const sortedCategoriesWithSameCharacter = useMemo(
    () =>
      Object.keys(categoriesById)
        .filter(
          (id) =>
            id.slice(0, -2) === displayCategory.calculation.id.slice(0, -2)
        )
        .sort((a, b) => {
          const nameA = categoriesById[a].calculation.name;
          const nameB = categoriesById[b].calculation.name;
          const orderA = categoriesById[a].calculation.order;
          const orderB = categoriesById[b].calculation.order;
          return nameA > nameB
            ? orderA < orderB
              ? -1
              : 1
            : orderA > orderB
            ? 1
            : -1;
        })
        .map((id) => {
          const _category = categoriesById[id];
          const _title = `${_category.character.name} - ${
            _category.calculation.name
          } - ${_category.weapon?.name} R${
            (_category.weapon?.refinement ?? 0) + 1
          }`;
          return {
            id,
            _category,
            _title,
          };
        }),
    [categoriesById, displayCategory]
  );

  return (
    <div className="flex" key={calculationId}>
      {hoverPreview}
      <div className="content-block w-100">
        <StylizedContentBlock
          variant="gradient"
          revealCondition={initialData.rows.length > 0}
          overrideImage={blockBackgroundImage}
        />
        <div className="relative">
          <button
            className="pointer back-btn"
            onClick={() => navigate("/leaderboards")}
          >
            <FontAwesomeIcon icon={faChevronLeft} size="1x" /> back to
            categories
          </button>
        </div>
        <div
          className="flex nowrap relative block-highlight"
          style={{
            whiteSpace: "break-spaces",
            margin: "10px",
          }}
        >
          <Podium />
          <div style={{}}>
            {displayCategory && (
              <div>
                <div style={{ margin: 10 }}>
                  <div
                    className="flex gap-10"
                    style={{
                      fontSize: 30,
                      borderBottom: "1px solid white",
                    }}
                  >
                    <img
                      style={{ width: 40, marginBottom: 15 }}
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
                </div>
                <div style={{ margin: 10 }}>
                  <div>
                    Weapon:
                    <img
                      className="table-icon"
                      src={displayCategory.weapon?.icon}
                    />
                    {displayCategory.weapon?.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative other-calculations-display block-highlight highlight-tile-container">
          {false && sortedCategoriesWithSameCharacter.map((c, index) => {
            const thisName = c._category.calculation.short;
            const weaponicon = c._category.weapon?.icon ?? "";
            const weaponRefinement = c._category.weapon?.refinement ?? 0;

            return (
              <a
                title={c._title}
                className="highlight-tile"
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/leaderboards/${c.id}`);
                }}
                href={`${pathname}#/leaderboards/${c.id}`}
              >
                <div className="highlight-tile-pill">{thisName}</div>
                <div className="flex">
                  <img
                    className="table-icon"
                    src={c._category.character.icon}
                  />
                  <WeaponMiniDisplay
                    icon={weaponicon}
                    refinement={weaponRefinement}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="content-block w-100">
        <StylizedContentBlock
          revealCondition={initialData.rows.length > 0}
          overrideImage={blockBackgroundImage}
        />
        <div className="relative" style={{ textAlign: "center" }}>
          UID / nickname
          <div>
            <input
              defaultValue={inputUID}
              onChange={(event) => {
                setInputUID(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setLookupUID(inputUID);
                }
              }}
            />
            <button
              onClick={() => {
                setLookupUID(inputUID);
              }}
            >
              search
            </button>
          </div>
        </div>
        {displayCategory && (
          <div>
            <CustomTable
              fetchURL={FETCH_LEADERBOARDS_URL}
              fetchParams={{
                uids: uidsToQuery(lastProfiles),
                uid: lookupUID,
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

            {/* <div className="relative"> {calculationSortKey} </div>
            <div className="relative"> {currentCategory} </div> */}

            <CustomTable
              fetchURL={FETCH_LEADERBOARDS_URL}
              filtersURL={FETCH_CHARACTER_FILTERS_URL}
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
