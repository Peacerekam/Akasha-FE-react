import { IHash } from "../types/IHash";

export const PATREON_URL = "https://www.patreon.com/mimee";
export const DISCORD_URL = "https://discord.gg/vmdPppZVa8";

export const FETCH_ARTIFACTS_URL = `/api/artifacts`;
export const FETCH_BUILDS_URL = `/api/builds/`;
export const FETCH_LEADERBOARDS_URL = `/api/leaderboards`;
export const FETCH_CATEGORIES_URL = `/api/leaderboards/categories`;

export const FETCH_CHARACTER_FILTERS_URL = `/api/filters/characters/`;
export const FETCH_ARTIFACT_FILTERS_URL = `/api/filters/artifacts/`;

export const normalizeText = (test: string) => {
  const regex = /[^A-Za-z0-9%]/g;
  return test.replace(regex, "").replace(/%/g, "_").toLowerCase();
};

export const _getEncodeURIComponents = (input: IHash): IHash => {
  return Object.keys(input).reduce((accumulator, key) => {
    accumulator[`_${key}`] = encodeURIComponent(input[key]);
    return accumulator;
  }, {} as IHash);
};

export const getSessionIdFromCookie = () => {
  return document.cookie?.split("connect.sid=s%3A")?.[1]?.split(".")?.[0] ?? "";
};

export const optsParamsSessionID = () => {
  return {
    params: {
      sessionID: getSessionIdFromCookie(),
    },
  };
};

export const ascensionToLevel = (ascension = 0) => {
  return (
    {
      0: 20,
      1: 40,
      2: 50,
      3: 60,
      4: 70,
      5: 80,
      6: 90,
    }[ascension] ?? 20
  );
};

export const getArtifactsInOrder = (artifacts: { equipType: string }[]) => {
  if (!artifacts) return [];

  const reordered: any[] = [];
  const customOrder = [
    "EQUIP_BRACER", // flower
    "EQUIP_NECKLACE", // feather
    "EQUIP_SHOES", // sands
    "EQUIP_RING", // cup
    "EQUIP_DRESS", // circlet
  ];

  customOrder.forEach((key) => {
    Object.values(artifacts).forEach((artifact) => {
      if (artifact.equipType !== key) return;
      const desiredArtifact = Object.values(artifacts).find(
        (a) => a.equipType === key
      );
      if (desiredArtifact) reordered.push(desiredArtifact);
    });
  });

  return reordered;
};

export const allSubstatsInOrder = [
  "Crit RATE",
  "Crit DMG",
  "ATK%",
  "HP%",
  "DEF%",
  "Elemental Mastery",
  "Energy Recharge",
  "Flat ATK",
  "Flat HP",
  "Flat DEF",
];

export const getSubstatsInOrder = (
  artifactData: { substats: any[] } & any
  // unshiftKey?: string
) => {
  const reordered: any[] = [];
  const arr = [...allSubstatsInOrder];

  // @TODO: cool feature but wont work in my case
  // if (unshiftKey) {
  //   const index = arr.indexOf(unshiftKey);
  //   if (index > -1) {
  //     arr.splice(index, 1);
  //     arr.unshift(unshiftKey);
  //   }
  // }

  arr.forEach((key) => {
    if (!artifactData.substats[key]) return;
    reordered.push(key);
  });

  return reordered;
};

export const getCharacterCvColor = (cv: number) => {
  if (cv >= 260) return "cyan";
  if (cv >= 240) return "rgb(255, 217, 0)";
  if (cv >= 220) return "orange";
  if (cv >= 200) return "rgb(194, 102, 255)";
  if (cv >= 180) return "rgb(102, 163, 255)";
  return "gray";
};

export const getArtifactCvColor = (cv: number) => {
  if (cv >= 50) return "cyan";
  if (cv >= 45) return "rgb(255, 217, 0)";
  if (cv >= 35) return "orange";
  if (cv >= 25) return "rgb(194, 102, 255)";
  if (cv >= 15) return "rgb(102, 163, 255)";
  return "gray";
};

export const getArtifactCvClassName = (cv: number) => {
  if (cv >= 50) return "unicorn-artifact";
  if (cv >= 45) return "upper-diamond-artifact";
  if (cv >= 35) return "diamond-artifact";
  if (cv >= 25) return "good-artifact";
  if (cv >= 15) return "ok-artifact";
  return "poo-artifact";
};

export const getInGameSubstatValue = (value: number, key: string) => {
  const offset = 0.000001;
  const corrected = value + offset;
  const fractionDigits = isPercent(key) ? 1 : 0;
  return corrected.toFixed(fractionDigits);
};

export const isPercent = (key: string) => {
  if (!key) return false;
  return (
    [
      "HP%",
      "ATK%",
      "DEF%",
      "Energy Recharge",
      "Crit RATE",
      "Crit DMG",
    ].includes(key) || key.includes("Bonus")
    //|| key.endsWith('%')
  );
};

export const getSubstatEfficiency = (key: string, value: number) => {
  const maxValue =
    {
      critdmg: 46.8,
      critrate: 23.4,
      hp_: 34.8,
      atk_: 34.8,
      def_: 43.8,
      flathp: 1794,
      flatatk: 114,
      flatdef: 138,
      elementalmastery: 138,
      energyrecharge: 39,
    }[key] || 1000;

  const subEff = value / maxValue;
  return Math.min(1, Math.max(0.2, subEff * 2.5)).toFixed(2);
};

export const arrayPushOrSplice = (prev: any[], element: any) => {
  const arr = [...prev];
  if (arr.includes(element)) {
    const index = arr.indexOf(element);
    arr.splice(index, 1);
  } else {
    arr.push(element);
  }
  return arr;
};

export const filtersQueryToArray = (value: string) => {
  // example input value:
  // [name]Aloy[weapon.name]Apprentice's Notes[constellation]2[setName]Crimson Witch of Flames
  const filters: any[] = [];
  const _tmp = value.split("[").slice(1);
  _tmp.forEach((str) => {
    const _vals = str.split("]");
    const key = _vals[0];
    const value = isNaN(+_vals[1]) ? _vals[1] : +_vals[1];
    if (key === undefined || value === undefined) return;

    filters.push({
      name: key,
      value: value,
    });
  });
  return filters;
};

export const uidsToQuery = (uids: (string | number)[]) => {
  // example output:
  // [uid]123124[uid]32323232[uid]see[uid]algoinde
  let stringified = "";

  uids.forEach((uid) => {
    if (!uid) return;
    stringified += `[uid]${uid}`;
  });

  return stringified;
};

export const abortSignalCatcher = async (cb: any, onError?: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      await cb();
    } catch (err) {
      const _err = err as any;
      const ERR_CANCELED =
        _err?.name === "CanceledError" || _err?.code === "ERR_CANCELED";

      if (ERR_CANCELED) return;
      if (onError) await onError(_err);
    }
    resolve(true);
  });
};
