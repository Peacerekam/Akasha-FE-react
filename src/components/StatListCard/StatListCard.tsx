import "./style.scss";

import { artifactIdFromIcon, getRelevantDmgBonuses } from "../../utils/helpers";

import { AssetFallback } from "../AssetFallback";
import { StatIcon } from "../StatIcon";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { useContext } from "react";

type StatListProps = {
  row: any;
};

export const getPercentageStat = (stat: any, toFixed: number) => {
  const result = Math.round((stat?.value || 0) * 1000) / 10;
  return result.toFixed(toFixed);
};

const getStatsFromRow = (row: any) => {
  const stats = row.stats;
  if (!stats) return null;

  const hp = stats.maxHp.value.toFixed(0);
  const atk = stats.atk.value.toFixed(0);
  const def = stats.def.value.toFixed(0);

  const cr = getPercentageStat(stats.critRate, 1);
  const cd = getPercentageStat(stats.critDamage, 1);
  const er = getPercentageStat(stats.energyRecharge, 1);
  const em = +stats.elementalMastery?.value.toFixed(0) || 0;

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

export const StatListCard: React.FC<StatListProps> = ({ row }) => {
  const { translate, language } = useContext(TranslationContext);

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

      const artifactTooltip = {
        "data-gi-type": "artifact",
        "data-gi-id": artifactIdFromIcon(icon),
        "data-gi-index": 0, // 0 = Flower
        "data-gi-lang": language,
      };

      return (
        <div
          key={name}
          className="table-stat-row green-tint"
          {...artifactTooltip}
        >
          <div className="flex gap-5 w-100">
            <AssetFallback alt="" className="stat-icon" src={icon} isArtifact />
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
        <div>{(+dmgStat.value).toFixed(1)}%</div>
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

  return (
    <div className="table-stats-display-card">
      {displayGeneralStats()}
      {displayDamageValues()}
      {displayArtifactSets()}
    </div>
  );
};
