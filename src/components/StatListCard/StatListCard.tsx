import { useContext } from "react";
import { StatIcon } from "../StatIcon";
import "./style.scss";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { getRelevantDmgBonuses } from "../../utils/helpers";

type StatListProps = {
  row: any;
};

const getStatsFromRow = (row: any) => {
  const stats = row.stats;
  if (!stats) return null;

  const hp = stats.maxHp.value.toFixed(0);
  const atk = stats.atk.value.toFixed(0);
  const def = stats.def.value.toFixed(0);
  const cr = ((stats.critRate?.value || 0) * 100).toFixed(1);
  const cd = ((stats.critDamage?.value || 0) * 100).toFixed(1);
  const er = ((stats.energyRecharge?.value || 0) * 100).toFixed(1);
  const em = +stats.elementalMastery?.value.toFixed(0) || 0;

  const healBonus = ((stats.healingBonus?.value || 0) * 100).toFixed(1);

  const pyroDMG = ((stats.pyroDamageBonus?.value || 0) * 100).toFixed(1);
  const hydroDMG = ((stats.hydroDamageBonus?.value || 0) * 100).toFixed(1);
  const cryoDMG = ((stats.cryoDamageBonus?.value || 0) * 100).toFixed(1);
  const dendroDMG = ((stats.dendroDamageBonus?.value || 0) * 100).toFixed(1); // partially missing data
  const electroDMG = ((stats.electroDamageBonus?.value || 0) * 100).toFixed(1);
  const anemoDMG = ((stats.anemoDamageBonus?.value || 0) * 100).toFixed(1);
  const geoDMG = ((stats.geoDamageBonus?.value || 0) * 100).toFixed(1);
  const physicalDMG = ((stats.physicalDamageBonus?.value || 0) * 100).toFixed(
    1
  );

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
        <div key={name} className="table-stat-row">
          <div className="flex gap-5 w-100">
            <img alt="" className="stat-icon" src={icon} />
            <span style={{ color: "#90ee90" }}>
              {" "}
              {translate(name)}
            </span>
          </div>
          <div style={{ color: "#90ee90" }}>×{Math.floor(count / 2) * 2}</div>
        </div>
      );
    });
  };

  const displayDamageValues = () => {
    const relevantDamageTypes = getRelevantDmgBonuses(row)

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
