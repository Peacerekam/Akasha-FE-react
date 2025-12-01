import {
  AdsComponentManager,
  AssetFallback,
  CustomTable,
  HelpBox,
  RowIndex,
  StatIcon,
  StylizedContentBlock,
  TeammatesCompact,
  WeaponMiniDisplay,
} from "../../components";
import {
  FETCH_CATEGORIES_FILTERS_URL,
  FETCH_CATEGORIES_URL_V2,
  monthDayYear_shortNumNum,
  toEnkaUrl,
} from "../../utils/helpers";
import React, { useContext, useMemo } from "react";

import DomainBackground from "../../assets/images/Grand_Narukami_Shrine_Concept_Art.webp";
import { TableColumn } from "../../types/TableColumn";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { useNavigate } from "react-router-dom";

// import DomainBackground from "../../assets/images/Depths_of_Mt._Yougou_Concept_Art.webp";

export type TransformedCategories = {
  characterName: string;
  icon: string;
  name: string;
  characterId: number;
  baseStats: any;
  rarity: string;
  element: string;
  weapontype: string;
  version: string;
  substat: string;
  ascensionStat: {
    [key: string]: number;
  };
  calcs: {
    [calcName: string]: {
      label: string;
      characterId: string;
      calculationId: string;
      short: string;
      details: string;
      categorySize?: number;
      weapon?: {
        name: string;
        icon: string;
        refinement: number;
        substat: string;
        type: string;
        rarity: string;
      };
      defaultFilter?: string;
    }[];
  };
};

export type CategoriesColumns = {
  _id: string;
  calculationId: string;
  characterName: string;
  name: string;
  details: string;
  rarity: string;
  version: string;
  addDate: number;
  weapontype: string;
  short: string;
  filters: any[];
  element: string;
  weapon: {
    name: string;
    icon: string;
    rarity: string;
    refinement: number;
  };
  [key: string]: any;
};

export const CategorySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { translate, language } = useContext(TranslationContext);

  const CHAR_CATEGORIES_COLUMNS: TableColumn<CategoriesColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <RowIndex index={row.index} />;
        },
      },
      {
        name: "Leaderboard",
        width: "100px",
        sortable: true,
        sortFields: ["name", "characterName", "element", "c6"],
        cell: (row) => {
          const element = row?.element || "";
          const lbName = row?.name || "";

          const firstWeapon = row.weapons[0];
          const _variant = firstWeapon?.defaultVariant || "";
          const leaderboardPath = `leaderboards/${firstWeapon?.calculationId}/${_variant}`;
          const aClassName = row.new ? "new-lb-badge" : "";
          const isNiche = row.label === "niche";

          return (
            <div
              className="flex nowrap"
              style={{ justifyContent: "space-between" }}
            >
              <div className="table-icon-text-pair">
                <StatIcon name={element} />
                <AssetFallback
                  className="table-icon"
                  width={25}
                  height={25}
                  src={row.characterIcon}
                  title={row?.characterName}
                />
                <a
                  className={`row-link-element ${aClassName}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(`/${leaderboardPath}`);
                  }}
                  href={`/${leaderboardPath}`}
                >
                  {isNiche && (
                    <div
                      style={{ width: "auto" }}
                      className="c-badge-wrapper"
                      title="This leaderboard will not be prioritized on profile highlights"
                    >
                      <div
                        style={{ width: "auto", fontSize: 11, marginRight: 5 }}
                        className={`c-badge c-0-badge`}
                      >
                        {row.label?.toUpperCase()}
                      </div>
                    </div>
                  )}
                  {lbName}{" "}
                  <span
                    style={{ color: "gray", fontSize: 11, margin: "0px 10px" }}
                  >
                    {translate(row?.characterName)}
                  </span>
                </a>
              </div>
              {!!row.c6 && (
                <div className="table-icon-text-pair c-badge-wrapper">
                  <div style={{ width: 18 }} className={`c-badge c-6-badge`}>
                    C6
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
      {
        name: "Weapons",
        // width: "100px",
        sortable: true,
        sortField: "weaponsCount",
        cell: (row) => {
          return (
            <div className="table-icon-text-pair clickable-icons">
              {row.weapons.map((weapon: any) => {
                const _variant = weapon.defaultVariant || "";
                const leaderboardPath = `leaderboards/${weapon.calculationId}/${_variant}`;
                const weaponLabel = `${weapon?.name} R${weapon?.refinement}`;
                return (
                  <a
                    style={{
                      color: "white",
                      display: weapon?.hidden ? "none" : "inline",
                    }}
                    key={weaponLabel}
                    title={weaponLabel}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(`/${leaderboardPath}`);
                    }}
                    href={`/${leaderboardPath}`}
                  >
                    <WeaponMiniDisplay
                      icon={weapon.icon}
                      refinement={weapon.refinement}
                    />
                  </a>
                );
              })}
            </div>
          );
        },
      },
      {
        name: "Team",
        width: "0px",
        sortable: false,
        cell: (row) => {
          return (
            <TeammatesCompact
              teammates={row.weapons[0].teammates}
              scale={1}
              simplify
            />
          );
        },
      },
      {
        name: "Count",
        width: "80px",
        sortable: true,
        sortField: "count",
        cell: (row) => {
          // const element = row?.element || "";
          const count = row?.count || "";

          return (
            <div className="table-icon-text-pair">
              {/* <StatIcon name={`${element} DMG Bonus`} /> */}
              <div>{count || "-"}</div>
            </div>
          );
        },
      },
      {
        name: "Added",
        sortable: true,
        sortField: "addDate",
        width: "140px",
        cell: (row) => {
          const addDate = new Date(row?.addDate || "");
          const strDate = addDate.toLocaleString(
            language,
            monthDayYear_shortNumNum
          );
          return (
            <div
              style={{
                whiteSpace: "nowrap",
              }}
            >
              {row?.addDate ? strDate : "-"}
            </div>
          );
        },
      },
    ],
    [translate, language]
  );

  const STYGIAN_CATEGORIES_COLUMNS: TableColumn<CategoriesColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <RowIndex index={row.index} />;
        },
      },
      {
        name: translate("Stygian Onslaught"),
        sortable: true,
        sortField: "name",
        cell: (row) => {
          const stName = row?.name || "";
          const leaderboardPath = `leaderboards/${row?.lbURL}`;
          const aClassName = row.new ? "new-lb-badge" : "";

          return (
            <div
              className="flex nowrap"
              style={{ justifyContent: "space-between" }}
            >
              <div className="table-icon-text-pair">
                <AssetFallback
                  className="table-icon"
                  title={translate("Stygian Onslaught")}
                  width={16}
                  height={16}
                  src={toEnkaUrl("UI_LeyLineChallenge_Medal_6")}
                />

                <a
                  className={`row-link-element ${aClassName}`}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(`/${leaderboardPath}`);
                  }}
                  href={`/${leaderboardPath}`}
                >
                  {row?.version}: {stName || "..."}
                </a>
              </div>
            </div>
          );
        },
      },

      ...[0, 1, 2].map((i) => ({
        name: <span className="weak-filler-line" />,
        // name: `Boss #${i+1}`,
        sortable: false,
        colSpan: i === 0 ? 4 : 0,
        cell: (row: any) => {
          const enemy = row?.enemies?.[i];
          if (!enemy) return <></>;

          let baseName = enemy.enemyName.split(":")[0];
          const _split = baseName.split(" ");
          const hasPrefix = baseName.startsWith("Battle-");

          if (hasPrefix) {
            baseName = `${_split.slice(1).join(" ")}`;
          }

          return (
            <span
              className="table-icon-text-pair"
              key={enemy.enemyName}
              style={{ alignItems: "center", maxWidth: 195 }}
            >
              <img
                className="table-icon"
                src={enemy.icon}
                title={enemy.enemyName}
                alt=""
              />
              <span>
                {hasPrefix && (
                  <div
                    style={{
                      fontSize: hasPrefix ? 10 : 13,
                      color: "gray",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      position: "relative",
                      top: 0,
                    }}
                  >
                    {_split[0]}
                  </div>
                )}
                <span
                  style={{
                    fontSize: hasPrefix ? 12 : 13,
                    position: "relative",
                    top: hasPrefix ? -5 : 0,
                  }}
                >
                  {baseName}
                </span>
              </span>
            </span>
          );
        },
      })),
      {
        name: "Count",
        width: "60px",
        sortable: true,
        sortField: "count",
        cell: (row) => {
          // const element = row?.element || "";
          const count = row?.count || "";

          return (
            <div className="table-icon-text-pair">
              {/* <StatIcon name={`${element} DMG Bonus`} /> */}
              <div>{count || "-"}</div>
            </div>
          );
        },
      },
      {
        name: "Added",
        sortable: true,
        sortField: "addDate",
        cell: (row) => {
          const addDate = new Date(row?.addDate || "");
          const strDate = addDate.toLocaleString(
            language,
            monthDayYear_shortNumNum
          );
          return (
            <div
              style={{
                whiteSpace: "nowrap",
              }}
            >
              {row?.addDate ? strDate : "-"}
            </div>
          );
        },
      },
    ],
    [translate, language]
  );

  return (
    <div className="flex">
      <div className="content-block w-100" id="content-container">
        <StylizedContentBlock overrideImage={DomainBackground} />

        <div className="flex-special-container">
          <HelpBox page="stygian" />
          <AdsComponentManager adType="Video" />
        </div>

        {/* non-character leaderboards */}
        <div className="relative">
          <CustomTable
            fetchParams={{ variant: "stygian" }}
            fetchURL={FETCH_CATEGORIES_URL_V2}
            columns={STYGIAN_CATEGORIES_COLUMNS}
            defaultSort="addDate"
            expandableRows
            hidePagination
          />
        </div>

        {/* spacer */}
        <div />

        <div className="flex-special-container">
          <HelpBox page="leaderboards" />
        </div>

        {/* character leaderboards */}
        <div className="relative">
          <CustomTable
            fetchParams={{ variant: "charactersLb" }}
            fetchURL={FETCH_CATEGORIES_URL_V2}
            filtersURL={FETCH_CATEGORIES_FILTERS_URL}
            columns={CHAR_CATEGORIES_COLUMNS}
            defaultSort="count"
            projectParamsToPath
            expandableRows
            hidePagination
          />
        </div>
      </div>
    </div>
  );
};
