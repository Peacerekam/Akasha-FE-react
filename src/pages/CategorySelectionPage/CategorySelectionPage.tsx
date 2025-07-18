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

  const CATEGORIES_COLUMNS: TableColumn<CategoriesColumns>[] = useMemo(
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
                  alt=" "
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
      // {
      //   name: "",
      //   width: "0px",
      //   sortable: true,
      //   sortField: "c6",
      //   cell: (row) => {
      //     if (!row.c6) return "";
      //     return (
      //       <div className="table-icon-text-pair c-badge-wrapper">
      //         <div style={{ width: 18 }} className={`c-badge c-6-badge`}>
      //           C6
      //         </div>
      //       </div>
      //     );
      //   },
      // },
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
      // {
      //   name: "Character",
      //   sortable: true,
      //   sortField: "characterName",
      //   width: "0px",
      //   cell: (row) => {
      //     const characterName = row?.characterName || "";
      //     // const lbName = row?.name || "";
      //     // return <div>{lbName}</div>;

      //     return (
      //       <div className="table-icon-text-pair" style={{ color: "gray" }}>
      //         <div>{translate(characterName)}</div>
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: "",
      //   width: "80px",
      //   sortable: false,
      //   sortField: "",
      //   cell: (row) => {
      //     const filters = row?.filters;
      //     return (
      //       <div>
      //         {filters ? `${filters.length} filters` : ""}
      //         {/* {filters?.map((filter) => {
      //           return <span>{filter.displayName}</span>;
      //         })} */}
      //       </div>
      //     );
      //   },
      // },
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
          const strDate = addDate.toLocaleString(language, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <div
              style={{
                whiteSpace: "nowrap",
              }}
            >
              {strDate}
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
        {/* <NotificationBar /> */}
        <StylizedContentBlock
          // variant="gradient"
          overrideImage={DomainBackground}
          // revealCondition={
          //   categoriesTransformed && categoriesTransformed?.length > 0
          // }
        />
        <div className="flex-special-container">
          <HelpBox page="leaderboards" />
          <AdsComponentManager adType="Video" />
        </div>
        {/* <AdsComponentManager
          adType="LeaderboardBTF"
          dataAdSlot="6204085735"
          hybrid="mobile"
          hideOnDesktop
        /> */}

        {/* <div className="relative">
          <CustomTable
            fetchURL={FETCH_CATEGORIES_URL_V2}
            // filtersURL={FETCH_CATEGORIES_FILTERS_URL}
            columns={CATEGORIES_COLUMNS}
            defaultSort="addDate"
            // expandableRows
            // projectParamsToPath
            expandableRows
            hidePagination
            fetchParams={{ new: 1 }}
          />
        </div> */}
        <div className="relative">
          <CustomTable
            fetchURL={FETCH_CATEGORIES_URL_V2}
            filtersURL={FETCH_CATEGORIES_FILTERS_URL}
            columns={CATEGORIES_COLUMNS}
            defaultSort="count"
            // expandableRows
            projectParamsToPath
            expandableRows
            hidePagination
          />
        </div>
      </div>
    </div>
  );
};
