import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import {
  AdsComponent,
  CustomTable,
  HelpBox,
  Spinner,
  StatIcon,
  StylizedContentBlock,
  WeaponMiniDisplay,
} from "../../components";
import {
  FETCH_CATEGORIES_FILTERS_URL,
  FETCH_CATEGORIES_URL,
  FETCH_CATEGORIES_URL_V2,
} from "../../utils/helpers";
import { TableColumn } from "../../types/TableColumn";
import { AdsComponentManager } from "../../components/AdsComponentManager";

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
  // const [categories, setCategories] = useState<Category[]>();
  const [categoriesTransformed, setCategoriesTransformed] = useState<
    TransformedCategories[]
  >([]);

  const navigate = useNavigate();
  const pathname = window.location.pathname;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await axios.get(FETCH_CATEGORIES_URL);
    const { dataTransformed } = response.data;
    setCategoriesTransformed(dataTransformed);
  };

  const CATEGORIES_COLUMNS: TableColumn<CategoriesColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <div>{row.index}</div>;
        },
      },
      {
        name: "Leaderboard",
        width: "100px",
        sortable: true,
        sortField: "name",
        cell: (row) => {
          const element = row?.element || "";
          const lbName = row?.name || "";

          const firstWeapon = row.weapons[0];
          const leaderboardPath = `leaderboards/${firstWeapon?.calculationId}/${
            firstWeapon?.defaultVariant || ""
          }`;

          return (
            <div className="table-icon-text-pair">
              <StatIcon name={element} />
              <img
                className="table-icon"
                src={row.characterIcon}
                title={row?.characterName}
              />
              <a
                className="row-link-element"
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/${leaderboardPath}`);
                }}
                href={`/${leaderboardPath}`}
              >
                {lbName}
              </a>
            </div>
          );
        },
      },
      {
        name: "",
        width: "0px",
        sortable: true,
        sortField: "c6",
        cell: (row) => {
          if (!row.c6) return "";
          return (
            <div className="table-icon-text-pair c-badge-wrapper">
              <div style={{ width: 18 }} className={`c-badge c-6-badge`}>
                C6
              </div>
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
                const leaderboardPath = `leaderboards/${weapon.calculationId}/${
                  weapon.defaultVariant || ""
                }`;

                return (
                  <a
                    style={{ color: "white" }}
                    title={`${weapon?.name} R${weapon.refinement}`}
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

          // const weaponName = row?.weapon?.name || "";
          // const refinement = row.weapon.refinement ?? 0;
          //
          // <div className="table-icon-text-pair">
          //   <WeaponMiniDisplay
          //     icon={row.weapon.icon}
          //     refinement={refinement}
          //   />
          //   <span style={{ opacity: 0.5 }}>{weaponName}</span>
          // </div>
        },
      },
      {
        name: "Character",
        sortable: true,
        sortField: "characterName",
        width: "0px",
        cell: (row) => {
          const characterName = row?.characterName || "";
          // const lbName = row?.name || "";
          // return <div>{lbName}</div>;

          return (
            <div className="table-icon-text-pair" style={{ color: "gray" }}>
              <div>{characterName}</div>
            </div>
          );
        },
      },
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
          const element = row?.element || "";
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
          const strDate = addDate.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          return <div style={{ whiteSpace: "nowrap" }}>{strDate}</div>;
        },
      },
    ],
    []
  );

  return (
    <div className="flex">
      <AdsComponentManager adType="LeaderboardATF" dataAdSlot="6204085735" />
      <AdsComponentManager adType="Video" />
      <div className="content-block w-100">
        <StylizedContentBlock
          // variant="gradient"
          overrideImage={DomainBackground}
          revealCondition={
            categoriesTransformed && categoriesTransformed?.length > 0
          }
        />
        <HelpBox page="leaderboards" />

        <div className="relative">
          <CustomTable
            fetchURL={FETCH_CATEGORIES_URL_V2}
            filtersURL={FETCH_CATEGORIES_FILTERS_URL}
            columns={CATEGORIES_COLUMNS}
            defaultSort="addDate"
            // expandableRows
            projectParamsToPath
            expandableRows
            hidePagination
          />
        </div>
      </div>
      <AdsComponentManager adType="LeaderboardBTF" dataAdSlot="6204085735" />
      <AdsComponentManager adType="RichMedia" />
    </div>
  );
};
