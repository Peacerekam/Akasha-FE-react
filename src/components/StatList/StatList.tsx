import "./style.scss";

import {
  ascensionToLevel,
  cssJoin,
  getGenderFromIcon,
  getRelevantDmgBonuses,
} from "../../utils/helpers";

import { AssetFallback } from "../AssetFallback";
import { StatIcon } from "../StatIcon";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { getPercentageStat } from "../StatListCard";
import { roundToFixed } from "../../utils/substats";
import { useContext } from "react";

type StatListProps = {
  row: any;
  // currentCategory?: string;
  showCharacter: boolean;
  showWeapon: boolean;
  strikethrough?: boolean;
};

// const getStatsFromCalculation = (row: any, currentCategory: string) => {
//   const stats = row?.calculations?.[currentCategory]?.stats;
//   if (!stats) return null;

//   const hp = stats.maxHP.toFixed(0);
//   const atk = stats.maxATK.toFixed(0);
//   const def = stats.maxDEF.toFixed(0);
//   const cr = stats.critRate.toFixed(1);
//   const cd = stats.critDMG.toFixed(1);
//   const er = (100 + stats.energyRecharge).toFixed(1);
//   const em = stats.elementalMastery.toFixed(0) | 0;

//   return {
//     hp,
//     atk,
//     def,
//     cr,
//     cd,
//     er,
//     em,
//     pyroDMG: stats.pyroDMG,
//     hydroDMG: stats.hydroDMG,
//     cryoDMG: stats.cryoDMG,
//     dendroDMG: stats.dendroDMG,
//     electroDMG: stats.electroDMG,
//     anemoDMG: stats.anemoDMG,
//     geoDMG: stats.geoDMG,
//     physicalDMG: stats.physicalDMG,
//   };
// };

export const getStatsFromRow = (row: any) => {
  const stats = row.stats;
  if (!stats) return null;

  const hp = roundToFixed(stats.maxHp.value, 0);
  const atk = roundToFixed(stats.atk.value, 0);
  const def = roundToFixed(stats.def.value, 0);

  const cr = getPercentageStat(stats.critRate, 1);
  const cd = getPercentageStat(stats.critDamage, 1);
  const er = getPercentageStat(stats.energyRecharge, 1);
  const em = roundToFixed(stats.elementalMastery?.value, 0);

  const healBonus = getPercentageStat(stats.healingBonus, 1);

  const pyroDMG = getPercentageStat(stats.pyroDamageBonus, 1);
  const hydroDMG = getPercentageStat(stats.hydroDamageBonus, 1);
  const cryoDMG = getPercentageStat(stats.cryoDamageBonus, 1);
  const dendroDMG = getPercentageStat(stats.dendroDamageBonus, 1);
  const electroDMG = getPercentageStat(stats.electroDamageBonus, 1);
  const anemoDMG = getPercentageStat(stats.anemoDamageBonus, 1);
  const geoDMG = getPercentageStat(stats.geoDamageBonus, 1);
  const physicalDMG = getPercentageStat(stats.physicalDamageBonus, 1);

  return {
    hp,
    atk,
    def,
    cr,
    cd,
    er,
    em,
    healBonus,
    pyroDMG,
    hydroDMG,
    cryoDMG,
    dendroDMG,
    electroDMG,
    anemoDMG,
    geoDMG,
    physicalDMG,
  };
};

export const StatList: React.FC<StatListProps> = ({
  row,
  // currentCategory,
  showCharacter,
  showWeapon,
  strikethrough = false,
}) => {
  // const stats = currentCategory
  //   ? getStatsFromCalculation(row, currentCategory)
  //   : getStatsFromRow(row);

  const { translate } = useContext(TranslationContext);
  const stats = getStatsFromRow(row);

  if (!stats) return <></>;

  const displayArtifactSets = () => {
    const { artifactSets } = row;
    const setNames = Object.keys(artifactSets);
    const activeSets = setNames
      .filter((name: any) => artifactSets[name].count > 1)
      .sort((a, b) => (a > b ? 1 : -1));

    return activeSets.map((name) => {
      const { icon, count } = artifactSets[name];
      return (
        <div key={name} className="table-stat-row green-tint">
          <div className="flex gap-5 w-100">
            <AssetFallback
              alt=""
              className="stat-icon"
              src={icon}
              key={icon}
              isArtifact
            />
            <span>{translate(name)}</span>
          </div>
          <div>×{Math.floor(count / 2) * 2}</div>
        </div>
      );
    });
  };

  const displayDamageValues = () => {
    const relevantDamageTypes = getRelevantDmgBonuses(row);

    return relevantDamageTypes.map((dmgStat: any) => (
      <div className="table-stat-row" key={dmgStat.name}>
        <div className="flex gap-5">
          <StatIcon name={dmgStat.name} />
          <span>{translate(dmgStat.name)}</span>
        </div>
        <div>{roundToFixed(dmgStat.value, 1).toFixed(1)}%</div>
      </div>
    ));
  };

  const displayGeneralStats = () => {
    const { hp, atk, def, em, er, cr, cd, healBonus } = stats;

    const generalStats: any = {
      "Max HP": hp,
      ATK: atk,
      DEF: def,
      "Elemental Mastery": em,
      "Crit Rate": `${cr}%`,
      "Crit DMG": `${cd}%`,
      "Healing Bonus": `${healBonus}%`,
      "Energy Recharge": `${er}%`,
    };

    return Object.keys(generalStats).map((key: any) => {
      const value = generalStats[key];
      const rawValue = +("" + value).replace("%", "");
      if (rawValue === 0) return null;

      return (
        <div className="table-stat-row" key={key}>
          <div className="flex gap-5">
            <StatIcon name={key} />
            <span>{translate(key)}</span>
          </div>
          <div>{value}</div>
        </div>
      );
    });
  };

  const displayWeapon = showWeapon && row.weapon && (
    <div className="table-stat-row">
      <div className="flex gap-5">
        <AssetFallback
          alt=""
          className={cssJoin([
            "stat-icon",
            strikethrough ? "strike-through" : "",
          ])}
          src={row.weapon.icon}
          key={row.weapon.icon}
        />
        <span className={strikethrough ? "strike-through opacity-5" : ""}>
          {translate(row.weapon.name)}
        </span>
        <div className="relative">
          <span className="refinement-display">
            <span className={strikethrough ? "strike-through" : ""}>
              R{(row.weapon.weaponInfo?.refinementLevel?.value ?? 0) + 1}
            </span>
          </span>
        </div>
      </div>
      <div className={strikethrough ? "strike-through opacity-5" : ""}>
        <span>
          {translate("Lv.")} {row.weapon.weaponInfo.level}
        </span>
        <span className="opacity-5">
          /
          {ascensionToLevel(
            row.weapon.weaponInfo?.promoteLevel,
            "weapon",
            row.weapon.weaponInfo.level
          )}
        </span>
      </div>
    </div>
  );

  const gender = getGenderFromIcon(row.icon);

  const displayCharacter = showCharacter && (
    <div className="table-stat-row">
      <div className="flex gap-5">
        <AssetFallback
          alt=""
          className="stat-icon"
          src={row.icon}
          key={row.icon}
        />
        <span>{translate(row.name, gender)}</span>
        <div className="relative">
          <span className="refinement-display">
            <span className={strikethrough ? "strike-through" : ""}>
              C{row.constellation ?? 0}
            </span>
          </span>
        </div>
      </div>
      <div className={strikethrough ? "strike-through opacity-5" : ""}>
        {translate("Lv.")} {row.propMap.level.val}
        <span className="opacity-5">
          /{ascensionToLevel(row.propMap.ascension.val, "character")}
        </span>
      </div>
    </div>
  );

  return (
    <div className="table-stats-display">
      {displayCharacter}
      {displayWeapon}
      {displayGeneralStats()}
      {displayDamageValues()}
      {displayArtifactSets()}
    </div>
  );
};
