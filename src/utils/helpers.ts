import { IHash } from "../types/IHash";

export const PATREON_URL = "https://www.patreon.com/mimee";
export const DISCORD_URL = "https://discord.gg/vmdPppZVa8";

export const FETCH_ARTIFACTS_URL = `/api/artifacts`;
export const FETCH_BUILDS_URL = `/api/builds/`;
export const FETCH_ACCOUNTS_URL = `/api/accounts`;
export const FETCH_LEADERBOARDS_URL = `/api/leaderboards`;
export const FETCH_CATEGORIES_URL = `/api/leaderboards/categories`;
export const FETCH_CATEGORIES_URL_V2 = `/api/v2/leaderboards/categories`;
export const FETCH_SEARCH_USERS_URL = "/api/search/user/";
export const FETCH_COLLECTION_SIZE_URL = "/api/getCollectionSize/";

export const FETCH_LEADERBOARD_FILTERS_URL = `/api/filters/leaderboards/`;
export const FETCH_CHARACTER_FILTERS_URL = `/api/filters/characters/`;
export const FETCH_ACCOUNTS_FILTERS_URL = `/api/filters/accounts/`;
export const FETCH_ARTIFACT_FILTERS_URL = `/api/filters/artifacts/`;
export const FETCH_CATEGORIES_FILTERS_URL = `/api/filters/categories/`;

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
  const _cv = cv + 0.05;
  if (_cv >= 300) return "rainbow";
  if (_cv >= 260) return "cyan";
  if (_cv >= 240) return "rgb(255, 217, 0)";
  if (_cv >= 220) return "orange";
  if (_cv >= 200) return "rgb(194, 102, 255)";
  if (_cv >= 180) return "rgb(102, 163, 255)";
  return "gray";
};

export const getArtifactCvColor = (artifact?: any) => {
  if (!artifact.critValue) return "gray";
  let cv = artifact.critValue;

  const isCritCirclet =
    artifact?.equipType === "EQUIP_DRESS" &&
    artifact?.mainStatKey.startsWith("Crit");

  if (isCritCirclet) cv += 7.77;

  if (+cv.toFixed(1) >= 54.4) return "rainbow";

  const _cv = cv + 0.05;
  if (_cv >= 50) return "cyan";
  if (_cv >= 45) return "rgb(255, 217, 0)";
  if (_cv >= 35) return "orange";
  if (_cv >= 25) return "rgb(194, 102, 255)";
  if (_cv >= 15) return "rgb(102, 163, 255)";
  return "gray";
};

export const getArtifactCvClassName = (artifact?: any) => {
  if (!artifact.critValue) return "poo-artifact";
  let cv = artifact.critValue;

  const isCritCirclet =
    artifact?.equipType === "EQUIP_DRESS" &&
    artifact?.mainStatKey.startsWith("Crit");

  if (isCritCirclet) cv += 7.77;

  if (+cv.toFixed(1) >= 54.4) return "wtf-artifact";

  const _cv = cv + 0.05;
  if (_cv >= 50) return "unicorn-artifact";
  if (_cv >= 45) return "upper-diamond-artifact";
  if (_cv >= 35) return "diamond-artifact";
  if (_cv >= 25) return "good-artifact";
  if (_cv >= 15) return "ok-artifact";
  return "poo-artifact";
};

export const getRainbowTextStyle = () => {
  const style = {} as React.CSSProperties;
  // style.background =
  //   "linear-gradient(124deg, orange, red)";

  // style.WebkitBackgroundClip = "text";
  // style.WebkitTextFillColor = "transparent";
  // style.WebkitTextFillColor = "rgba(255, 155, 155, 0.4)";
  // style.backgroundSize = "1800% 1800%";
  // style.animation = "gradientMove 3s linear infinite";
  // style.animation = "gradientMove 3s ease infinite";
  style.fontWeight = 600;
  style.letterSpacing = "1px";
  style.filter = "drop-shadow(0 0 2px black)";
  style.color = "red";
  style.animation = "filterGlowRed 2s ease infinite";
  return style;
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

export const getSubstatPercentageEfficiency = (key: string, value: number) => {
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
  return Math.min(0.99, Math.max(0.2, subEff * 2.5)).toFixed(2);
};

export const arrayPushOrSplice = (prev: any[], element: any) => {
  const arr = [...prev];
  const index = arr.indexOf(element);
  if (index > -1) {
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

export const toShortThousands = (n: number) => {
  if (n > 9999) {
    const thousands = n / 1000;

    // if above 100k then dont show decimals ( e.g. 107k )
    if (thousands > 99) {
      return `${Math.round(thousands)}k`;
    }

    // if below 100k then show one decimal ( e.g. 56.6k )
    const rounded = thousands.toFixed(1);

    // if number is even then dont show unnecesary .0 decimal
    const adjusted = rounded.endsWith(".0")
      ? rounded.replace(".0", "")
      : rounded;

    return `${adjusted}k`;
  }
  return n;
};

export const iconUrlToNamecardUrl = (url: string) => {
  const iDontFuckingEven = url.includes("Yae") ? 1 : "";

  return url
    .replace("UI_AvatarIcon", "UI_NameCardPic")
    .replace(".png", `${iDontFuckingEven}_P.png`);
};

export const toEnkaUrl = (assetName?: string) => {
  if (!assetName) return "";
  return `https://enka.network/ui/${assetName}.png`;
};

export const shadeColor = (color: string, percent: number) => {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = (R * (100 + percent)) / 100;
  G = (G * (100 + percent)) / 100;
  B = (B * (100 + percent)) / 100;

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  var RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};

export const getGenderFromIcon = (icon?: string) => {
  if (!icon) return undefined;

  const gender = icon.includes("PlayerGirl")
    ? "F"
    : icon.includes("PlayerBoy")
    ? "M"
    : undefined;

  return gender;
};

export const delay = async (ms: number) =>
  new Promise((resolve, reject) => setTimeout(resolve, ms));
