import { toEnkaUrl } from "../../utils/helpers";

export const ELEMENT_TO_COLOR = {
  Pyro: "#f58453",
  Electro: "#ffa1ff",
  Anemo: "#71fdec",
  Geo: "#ffc64a",
  Cryo: "#98efff",
  Dendro: "#a5ffab",
  Hydro: "#56a2ff",
} as any;

export const ELEMENT_TO_HUE = {
  Pyro: 325,
  Electro: 230,
  Anemo: 120,
  Geo: 375, // @TODO: ??
  Cryo: 160,
  Dendro: 65,
  Hydro: 180,
} as any;

export const calcStatVals = (_statName: string, reversed = false) => {
  return (
    {
      atk: {
        key: "maxATK",
        value: (n: number) => n,
      },
      def: { key: "maxDEF", value: (n: number) => n },
      maxHp: { key: "maxHP", value: (n: number) => n },
      critDamage: {
        key: "critDMG",
        value: (n: number) => (reversed ? (n || 0) * 100 : (n || 0) / 100),
      },
      critRate: {
        key: "critRate",
        value: (n: number) => (reversed ? (n || 0) * 100 : (n || 0) / 100),
      },
      healingBonus: {
        key: "healingBonus",
        value: (n: number) => (reversed ? (n || 0) * 100 : (n || 0) / 100),
      },
      energyRecharge: {
        key: "energyRecharge",
        value: (n: number) =>
          reversed ? (n || 0) * 100 : (100 + (n || 0)) / 100,
      },
    }[_statName] || {
      key: _statName.endsWith("DamageBonus")
        ? _statName.replace("DamageBonus", "DMG")
        : _statName,
      value: (n: number) =>
        _statName.endsWith("DamageBonus")
          ? reversed
            ? (n || 0) * 100
            : (n || 0) / 100
          : n || 0,
    }
  );
};

export const handleTitle = (arr: any) => {
  const obj = arr[0].dataset;
  if (!obj) return "";
  return `${obj.label}`;
};

export const scales = {
  r: {
    suggestedMin: 0,
    suggestedMax: 100,
    max: 120,
    ticks: {
      stepSize: 20,
      textStrokeColor: "transparent",
      color: "transparent",
      backdropColor: "transparent",
    },
    angleLines: {
      color: "rgba(255, 255, 255, 0.2)",
    },
    grid: {
      color: "rgba(255, 255, 255, 0.2)",
    },
    pointLabels: {
      color: "#e7f6f2",
      font: {
        family: "GenshinFont",
        size: 9,
      },
      callback: (statName: string, index: number) => {
        return statName as string | string[];
      },
    },
  },
};

export const toTalentProps = (row: any, keys: string[], chartsData: any) => {
  const talent = row?.talentsLevelMap?.[keys[0]];
  if (!talent) return null;

  const assetKey = keys[1] || keys[0];
  const asset = chartsData?.assets?.talents?.[assetKey];
  const icon = asset ? toEnkaUrl(asset) : talent.icon;

  return {
    ...talent,
    icon,
  };
};
