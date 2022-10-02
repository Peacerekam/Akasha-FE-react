import { ascensionToLevel } from "../../utils/helpers";
import { StatIcon } from "../StatIcon";
import "./style.scss";

type StatListProps = {
  row: any;
  currentCategory: string;
  showCharacter: boolean;
  showWeapon: boolean;
};

const getStatsFromCalculation = (row: any, currentCategory: string) => {
  const stats = row?.calculations?.[currentCategory]?.stats;
  if (!stats) return null;

  const hp = stats.maxHP.toFixed(0);
  const atk = stats.maxATK.toFixed(0);
  const def = stats.maxDEF.toFixed(0);
  const cr = stats.critRate.toFixed(1);
  const cd = stats.critDMG.toFixed(1);
  const er = (100 + stats.energyRecharge).toFixed(1);
  const em = stats.elementalMastery.toFixed(0) | 0;

  return {
    hp,
    atk,
    def,
    cr,
    cd,
    er,
    em,
    pyroDMG: stats.pyroDMG,
    hydroDMG: stats.hydroDMG,
    cryoDMG: stats.cryoDMG,
    dendroDMG: stats.dendroDMG,
    electroDMG: stats.electroDMG,
    anemoDMG: stats.anemoDMG,
    geoDMG: stats.geoDMG,
    physicalDMG: stats.physicalDMG,
  };
};

const getStatsFromRow = (row: any) => {
  const stats = row.stats;
  if (!stats) return null;

  const hp = stats.maxHp.value.toFixed(0);
  const atk = stats.atk.value.toFixed(0);
  const def = stats.def.value.toFixed(0);
  const cr = (stats.critRate?.value * 100).toFixed(1);
  const cd = (stats.critDamage?.value * 100).toFixed(1);
  const er = (stats.energyRecharge.value * 100).toFixed(1);
  const em = +stats.elementalMastery.value.toFixed(0) || 0;

  const pyroDMG = (stats.pyroDamageBonus.value * 100).toFixed(1);
  const hydroDMG = (stats.hydroDamageBonus.value * 100).toFixed(1);
  const cryoDMG = (stats.cryoDamageBonus.value * 100).toFixed(1);
  const dendroDMG = (stats.dendroDamageBonus?.value * 100).toFixed(1); // partially missing data
  const electroDMG = (stats.electroDamageBonus.value * 100).toFixed(1);
  const anemoDMG = (stats.anemoDamageBonus.value * 100).toFixed(1);
  const geoDMG = (stats.geoDamageBonus.value * 100).toFixed(1);
  const physicalDMG = (stats.physicalDamageBonus.value * 100).toFixed(1);

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

export const StatList: React.FC<StatListProps> = ({
  row,
  currentCategory,
  showCharacter,
  showWeapon,
}) => {
  const stats = currentCategory
    ? getStatsFromCalculation(row, currentCategory)
    : getStatsFromRow(row);

  if (!stats) return <></>;

  const displayArtifactSets = () => {
    const { artifactSets } = row;
    const setNames = Object.keys(artifactSets);
    const activeSets = setNames.filter(
      (name: any) => artifactSets[name].count > 1
    );

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

  const displayHighestDamageValue = () => {
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

    const dmgStats: any = {
      "Pyro DMG Bonus": pyroDMG,
      "Electro DMG Bonus": electroDMG,
      "Cryo DMG Bonus": cryoDMG,
      "Geo DMG Bonus": geoDMG,
      "Dendro DMG Bonus": dendroDMG,
      "Anemo DMG Bonus": anemoDMG,
      "Hydro DMG Bonus": hydroDMG,
      "Physical DMG Bonus": physicalDMG,
    };

    const highestDmgType = {
      name: "",
      value: 0,
    };

    for (const key of Object.keys(dmgStats)) {
      const value = +dmgStats[key];
      if (value && value > highestDmgType.value) {
        highestDmgType.name = key;
        highestDmgType.value = value;
      }
    }

    return (
      highestDmgType.value > 0 && (
        <div className="table-stat-row">
          <div className="flex gap-5">
            <StatIcon name={highestDmgType.name} />
            <span>{highestDmgType.name}</span>
          </div>
          <div>{highestDmgType.value.toFixed(1)}%</div>
        </div>
      )
    );
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

  const displayWeapon = showWeapon && row.weapon && (
    <div className="table-stat-row">
      <div className="flex gap-5">
        <img
          className={`stat-icon ${currentCategory ? "strike-through" : ""}`}
          src={row.weapon.icon}
        />
        <span className={currentCategory ? "strike-through opacity-5" : ""}>
          {row.weapon.name}
        </span>
        <div className="relative">
          <span className="refinement-display">
            <span className={currentCategory ? "strike-through" : ""}>
              R{(row.weapon.weaponInfo?.refinementLevel?.value ?? 0) + 1}
            </span>
          </span>
        </div>
      </div>
      <div className={currentCategory ? "strike-through opacity-5" : ""}>
        <span>Level {row.weapon.weaponInfo.level}</span>
        <span className="opacity-5">
          /{ascensionToLevel(row.weapon.weaponInfo?.promoteLevel)}
        </span>
      </div>
    </div>
  );

  const displayCharacter = showCharacter && (
    <div className="table-stat-row">
      <div className="flex gap-5">
        <img className="stat-icon" src={row.icon} />
        <span>{row.name}</span>
        <div className="relative">
          <span className="refinement-display">
            <span className={currentCategory ? "strike-through" : ""}>
              C{row.constellationsIdList?.length ?? 0}
            </span>
          </span>
        </div>
      </div>
      <div className={currentCategory ? "strike-through opacity-5" : ""}>
        Level {row.propMap.level.val}
        <span className="opacity-5">
          /{ascensionToLevel(row.propMap.ascension.val)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="table-stats-display">
      {displayCharacter}
      {displayWeapon}
      {displayGeneralStats()}
      {displayHighestDamageValue()}
      {displayArtifactSets()}
    </div>
  );
};
