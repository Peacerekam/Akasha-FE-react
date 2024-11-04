import "./style.scss";

import { faCirclet, faFlower, faGoblet, faPlume, faSands } from "./faIcons";

import ATK from "../../assets/icons/ATTACK.png";
import ATK_ from "../../assets/icons/ATTACK_PERCENT.png";
import AnemoDMG from "../../assets/icons/WIND_ADD_HURT.png";
import CritDMG from "../../assets/icons/CRITICAL_HURT.png";
import CritRate from "../../assets/icons/CRITICAL.png";
import CryoDMG from "../../assets/icons/ICE_ADD_HURT.png";
import DEF from "../../assets/icons/DEFENSE.png";
import DEF_ from "../../assets/icons/DEFENSE_PERCENT.png";
import DendroDMG from "../../assets/icons/GRASS_ADD_HURT.png";
import EM from "../../assets/icons/ELEMENT_MASTERY.png";
import ER from "../../assets/icons/CHARGE_EFFICIENCY.png";
import ElectroDMG from "../../assets/icons/ELEC_ADD_HURT.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GeoDMG from "../../assets/icons/ROCK_ADD_HURT.png";
import HP from "../../assets/icons/HP.png";
import HP_ from "../../assets/icons/HP_PERCENT.png";
import HealingBonus from "../../assets/icons/HEAL_ADD.png";
import HydroDMG from "../../assets/icons/WATER_ADD_HURT.png";
import PhysicalDMG from "../../assets/icons/PHYSICAL_ADD_HURT.png";
import PyroDMG from "../../assets/icons/FIRE_ADD_HURT.png";
import React from "react";

type StatIconProps = { name: string; sizeOverride?: number };

export const STAT_KEYS: {
  [key: string]: any;
} = {
  "Crit Rate": CritRate,
  "Crit RATE": CritRate,
  "Crit DMG": CritDMG,
  "Elemental Mastery": EM,
  "Energy Recharge": ER,
  "Flat HP": HP,
  "Flat ATK": ATK,
  "Flat DEF": DEF,
  "Max HP": HP,
  HP: HP,
  HP_: HP_,
  "HP%": HP_,
  ATK: ATK,
  ATK_: ATK_,
  "ATK%": ATK_,
  DEF: DEF,
  DEF_: DEF_,
  "DEF%": DEF_,
  Pyro: PyroDMG,
  Electro: ElectroDMG,
  Cryo: CryoDMG,
  Geo: GeoDMG,
  Dendro: DendroDMG,
  Anemo: AnemoDMG,
  Hydro: HydroDMG,
  "Pyro DMG Bonus": PyroDMG,
  "Electro DMG Bonus": ElectroDMG,
  "Cryo DMG Bonus": CryoDMG,
  "Geo DMG Bonus": GeoDMG,
  "Dendro DMG Bonus": DendroDMG,
  "Anemo DMG Bonus": AnemoDMG,
  "Hydro DMG Bonus": HydroDMG,
  "Physical DMG Bonus": PhysicalDMG,
  "Healing Bonus": HealingBonus,
  Flower: {
    type: "faIcon",
    value: faFlower,
  },
  Feather: {
    type: "faIcon",
    value: faPlume,
  },
  Sands: {
    type: "faIcon",
    value: faSands,
  },
  Goblet: {
    type: "faIcon",
    value: faGoblet,
  },
  Circlet: {
    type: "faIcon",
    value: faCirclet,
  },
  "Crit Value": {
    type: "empty",
  },
  x: {
    type: "x",
  },
};

export const isIcon = (name: string) => !!STAT_KEYS[name];

export const StatIcon: React.FC<StatIconProps> = ({
  name,
  sizeOverride = null,
}) => {
  const asset = STAT_KEYS[name];
  if (!asset) return null;

  if (asset.type === "faIcon") {
    return <FontAwesomeIcon icon={asset.value} size="1x" />;
  }

  if (asset.type === "empty") {
    return <span className="empty-stat-icon" />;
  }

  if (asset.type === "x") {
    return <span>×</span>;
  }

  const styleObj: React.CSSProperties = {};

  if (sizeOverride) {
    styleObj.width = sizeOverride;
    styleObj.height = sizeOverride;
  }

  return (
    <img
      alt=""
      width={18}
      height={18}
      className="stat-icon"
      src={asset}
      style={styleObj}
    />
  );
};

export const statIconImgElement = (name: string) => {
  const asset = STAT_KEYS[name];
  if (!asset) return null;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = asset;

  return img;
};
