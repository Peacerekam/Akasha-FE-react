import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  CritRatio,
  StatIcon,
  WeaponMiniDisplay,
  DisplaySets,
  CustomTable,
  ReplaceRowDataOnHover,
  StylizedContentBlock,
  HelpBox,
  RegionBadge,
  NotificationBar,
} from "../../components";
import { TableColumn } from "../../types/TableColumn";

import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import {
  FETCH_BUILDS_URL,
  FETCH_CHARACTER_FILTERS_URL,
  getGenderFromIcon,
  getRelevantCharacterStats,
  normalizeText,
} from "../../utils/helpers";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { AdsComponentManager } from "../../components/AdsComponentManager";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";

export type BuildsColumns = {
  _id: string;
  uid: string;
  name: string;
  icon: string;
  totalCritValue: number;
  nickname: string;
  constellation: number;
  [key: string]: any;
};

export const BuildsPage: React.FC = () => {
  const { adProvider } = useContext(AdProviderContext);
  const { hoverElement } = useContext(HoverElementContext);
  const { translate } = useContext(TranslationContext);
  const navigate = useNavigate();

  const BUILDS_COLUMNS: TableColumn<BuildsColumns>[] = useMemo(
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
        sortField: "owner.nickname",
        width: "180px",
        sortable: false,
        cell: (row) => {
          if (!row.owner?.adventureRank) return <></>;
          const isEnkaProfile = isNaN(+row.uid);

          return (
            <a
              className={`row-link-element ${
                isEnkaProfile ? "enka-profile" : ""
              }`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${row.uid}`);
              }}
              href={`/profile/${row.uid}`}
            >
              {/* <ARBadge adventureRank={row.owner.adventureRank} /> */}
              <RegionBadge region={row.owner.region} />
              {row.owner.nickname}
            </a>
          );
        },
      },
      {
        name: "Name",
        sortable: false,
        sortField: "name",
        cell: (row) => {
          const gender = getGenderFromIcon(row.icon);
          // const constellation = row.constellation ?? 0;

          return (
            <div className="table-icon-text-pair">
              <img className="table-icon" src={row.icon} title={row?.name} />
              {/* <div className="table-icon-text-pair relative">
                <img src={row.icon} className="table-icon" title={row?.name} />
                <span className="bottom-right-absolute">
                  {`C${constellation}`}
                </span>
              </div> */}
              {row.type !== "current" ? (
                <ReplaceRowDataOnHover data={row.name} onHoverData={row.type} />
              ) : (
                translate(row.name, gender)
              )}
            </div>
          );
        },
      },
      {
        name: adProvider === "playwire" ? "" : "Constellation",
        sortable: false,
        sortField: "constellation",
        cell: (row) => {
          const constellation = row.constellation ?? 0;
          return (
            <div className="c-badge-wrapper">
              <div className={`c-badge c-${constellation}-badge`}>
                C{constellation}
              </div>
            </div>
          );
        },
      },
      {
        name: adProvider === "playwire" ? "" : "Weapon",
        // grow: 0,
        width: "60px",
        sortable: false,
        sortField: "weapon.name",
        cell: (row) => {
          const refinement =
            (row.weapon.weaponInfo?.refinementLevel?.value ?? 0) + 1;
          return (
            <WeaponMiniDisplay icon={row.weapon.icon} refinement={refinement} />
          );
        },
      },
      {
        name: "Sets",
        sortable: false,
        // sortField: "artifactSetsFlat",
        cell: (row) => {
          return <DisplaySets artifactSets={row.artifactSets} />;
        },
      },
      {
        name: "Crit Ratio",
        sortable: true,
        sortFields: [
          "critValue",
          "stats.critRate.value",
          "stats.critDamage.value",
        ],
        cell: (row) => {
          return <CritRatio row={row} overrideCV={row.critValue} />;
        },
      },
      ...[0, 1, 2, 3].map((i) => ({
        name: <span className="weak-filler-line" />,
        sortable: true,
        // sortFields: allSubstatsInOrder.map((key) => `stats.${key}.value`),
        sortFields: [
          "stats.maxHp.value",
          "stats.atk.value",
          "stats.def.value",
          "stats.elementalMastery.value",
          "stats.energyRecharge.value",
          "stats.hydroDamageBonus.value",
          "stats.geoDamageBonus.value",
          "stats.pyroDamageBonus.value",
          "stats.cryoDamageBonus.value",
          "stats.electroDamageBonus.value",
          "stats.anemoDamageBonus.value",
          "stats.dendroDamageBonus.value",
          "stats.physicalDamageBonus.value",
          "stats.healingBonus.value",
        ],
        colSpan: i === 0 ? 4 : 0,
        width: "70px",
        // getDynamicTdClassName: (row: any) => {
        //   const reordered = getSubstatsInOrder(row);
        //   const key = reordered?.[i];
        //   if (!key) return "";
        //   return normalizeText(key);
        // },
        cell: (row: any) => {
          const relevantStats = getRelevantCharacterStats(row);

          const _stat = relevantStats?.[i];
          if (!_stat) return <></>;

          const isPercent =
            _stat.name.includes("Bonus") || _stat.name === "Energy Recharge";

          let _value = _stat.value !== null ? +_stat.value : _stat.value;

          if (["Healing Bonus", "Energy Recharge"].includes(_stat.name)) {
            _value *= 100;
          }

          return (
            <div
              key={normalizeText(_stat.name)}
              className={`character-stat flex nowrap ${normalizeText(
                _stat.name.replace("%", "")
              )}`}
            >
              <span style={{ marginRight: "5px" }}>
                <StatIcon name={_stat.name.replace("%", "")} />
              </span>
              {_value?.toFixed(isPercent ? 1 : 0)}
              {isPercent ? "%" : ""}
              {/* {_stat.name} */}
            </div>
          );
        },
      })),
      // {
      //   name: "Max HP",
      //   // selector: (row) => row.stats.maxHp.value.toFixed(0),
      //   sortable: true,
      //   sortField: "stats.maxHp.value",
      //   cell: (row) => {
      //     return (
      //       <div className="flex gap-3 nowrap">
      //         <StatIcon name="HP" />
      //         {row.stats.maxHp.value.toFixed(0)}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: "ATK",
      //   // selector: (row) => row.stats.atk.value.toFixed(0),
      //   sortable: true,
      //   sortField: "stats.atk.value",
      //   cell: (row) => {
      //     return (
      //       <div className="flex gap-3 nowrap">
      //         <StatIcon name="ATK" />
      //         {row.stats.atk.value.toFixed(0)}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: "DEF",
      //   // selector: (row) => row.stats.def.value.toFixed(0),
      //   sortable: true,
      //   sortField: "stats.def.value",
      //   cell: (row) => {
      //     return (
      //       <div className="flex gap-3 nowrap">
      //         <StatIcon name="DEF" />
      //         {row.stats.def.value.toFixed(0)}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: "EM",
      //   // selector: (row) => row.stats.elementalMastery.value.toFixed(0),
      //   sortable: true,
      //   sortField: "stats.elementalMastery.value",
      //   cell: (row) => {
      //     return (
      //       <div className="flex gap-3 nowrap">
      //         <StatIcon name="Elemental Mastery" />
      //         {+row.stats.elementalMastery.value.toFixed(0) || 0}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: "ER%",
      //   // selector: (row) =>
      //   //   `${(row.stats.energyRecharge.value * 100).toFixed(1)}%`,
      //   sortable: true,
      //   sortField: "stats.energyRecharge.value",
      //   cell: (row) => {
      //     return (
      //       <div className="flex gap-3 nowrap">
      //         <StatIcon name="Energy Recharge" />
      //         {(row.stats.energyRecharge.value * 100).toFixed(1)}%
      //         {/* {(row.stats.energyRecharge.value * 100).toFixed(1)}% */}
      //       </div>
      //     );
      //   },
      // },
    ],
    [translate]
  );

  return (
    <div className="flex">
      {hoverElement}
      <div className="content-block w-100" id="content-container">
        <NotificationBar />
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="flex-special-container">
          <AdsComponentManager adType="Video" />
          <HelpBox page="builds" />
        </div>
        {/* <AdsComponentManager
          adType="LeaderboardBTF"
          dataAdSlot="6204085735"
          hybrid="mobile"
          hideOnDesktop
        /> */}
        <CustomTable
          fetchURL={FETCH_BUILDS_URL}
          filtersURL={FETCH_CHARACTER_FILTERS_URL}
          columns={BUILDS_COLUMNS}
          defaultSort="critValue"
          expandableRows
          projectParamsToPath
        />
      </div>
    </div>
  );
};
