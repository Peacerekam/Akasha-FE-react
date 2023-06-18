import { StatIcon } from "../StatIcon";
import "./style.scss";

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

export const StatListCard: React.FC<StatListProps> = ({
  row,
}) => {
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
            <img className="stat-icon" src={icon} />
            <span style={{ color: "#90ee90" }}> {name}</span>
          </div>
          <div style={{ color: "#90ee90" }}>×{Math.floor(count / 2) * 2}</div>
        </div>
      );
    });
  };

  const displayDamageValues = () => {
    const {
      pyroDMG,
      hydroDMG,
      cryoDMG,
      dendroDMG,
      electroDMG,
      anemoDMG,
      geoDMG,
      physicalDMG,
    } = stats;

    const dmgStats: any[] = [
      {
        name: "Pyro DMG Bonus",
        value: pyroDMG,
      },
      {
        name: "Electro DMG Bonus",
        value: electroDMG,
      },
      {
        name: "Cryo DMG Bonus",
        value: cryoDMG,
      },
      {
        name: "Geo DMG Bonus",
        value: geoDMG,
      },
      {
        name: "Dendro DMG Bonus",
        value: dendroDMG,
      },
      {
        name: "Anemo DMG Bonus",
        value: anemoDMG,
      },
      {
        name: "Hydro DMG Bonus",
        value: hydroDMG,
      },
      {
        name: "Physical DMG Bonus",
        value: physicalDMG,
      },
    ];

    const sorted = dmgStats
      .sort((a, b) => {
        const numA = +(a.value || 0);
        const numB = +(b.value || 0);
        return numA > numB ? -1 : 1;
      })
      .slice(0, 5);
    const lowestDmg = sorted.length > 1 ? +sorted[sorted.length - 1].value : 0;

    const relevantDamageTypes = sorted.filter(
      (a: any) => +a.value !== lowestDmg && +a.value !== 0 && !isNaN(a.value)
    );

    return relevantDamageTypes.map((dmgStat: any) => (
      <div className="table-stat-row" key={dmgStat.name}>
        <div className="flex gap-5">
          <StatIcon name={dmgStat.name} />
          <span>{dmgStat.name}</span>
        </div>
        <div>{(+dmgStat.value).toFixed(1)}%</div>
      </div>
    ));
  };

  const displayGeneralStats = () => {
    const { hp, atk, def, em, er, cr, cd } = stats;

    const generalStats: any = {
      "Max HP": hp,
      ATK: atk,
      DEF: def,
      "Elemental Mastery": em,
      "Crit Rate": `${cr}%`,
      "Crit DMG": `${cd}%`,
      "Energy Recharge": `${er}%`,
    };

    return Object.keys(generalStats).map((key: any) => {
      const value = generalStats[key];
      if (value === 0) return null;
      return (
        <div className="table-stat-row" key={key}>
          <div className="flex gap-5">
            <StatIcon name={key} />
            <span>{key}</span>
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
