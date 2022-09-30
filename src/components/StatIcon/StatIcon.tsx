import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import CritRate from "../../assets/icons/CRITICAL.png";
import CritDMG from "../../assets/icons/CRITICAL_HURT.png";
import EM from "../../assets/icons/ELEMENT_MASTERY.png";
import HP from "../../assets/icons/HP.png";
import HP_ from "../../assets/icons/HP_PERCENT.png";
import ER from "../../assets/icons/CHARGE_EFFICIENCY.png";
import ATK from "../../assets/icons/ATTACK.png";
import ATK_ from "../../assets/icons/ATTACK_PERCENT.png";
import DEF from "../../assets/icons/DEFENSE.png";
import DEF_ from "../../assets/icons/DEFENSE_PERCENT.png";
import PyroDMG from "../../assets/icons/FIRE_ADD_HURT.png";
import ElectroDMG from "../../assets/icons/ELEC_ADD_HURT.png";
import DendroDMG from "../../assets/icons/GRASS_ADD_HURT.png";
import GeoDMG from "../../assets/icons/ROCK_ADD_HURT.png";
import AnemoDMG from "../../assets/icons/WIND_ADD_HURT.png";
import HydroDMG from "../../assets/icons/WATER_ADD_HURT.png";
import PhysicalDMG from "../../assets/icons/PHYSICAL_ADD_HURT.png";
import CryoDMG from "../../assets/icons/ICE_ADD_HURT.png";
import HealingBonus from "../../assets/icons/HEAL_ADD.png";
import { faFlower, faPlume, faSands, faGoblet, faCirclet } from './faIcons';

import "./style.scss";

const statKeys: any = {
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
};

export const isIcon = (name: string) => !!statKeys[name];

export const StatIcon = ({ name }: { name: string }) => {
  const asset = statKeys[name];
  if (!name) return null;

  return asset.type === "faIcon" ? (
    <FontAwesomeIcon icon={asset.value} size="1x" />
  ) : (
    <img className="stat-icon" src={asset} />
  );
};
