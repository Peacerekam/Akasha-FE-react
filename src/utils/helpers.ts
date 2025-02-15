import {
  REAL_SUBSTAT_VALUES,
  STAT_NAMES,
  getSubstatEfficiency,
  roundToFixed,
} from "./substats";

import { IHash } from "../types/IHash";
import { getDefaultRvFilters } from "../components/RollList/defaultFilters";
import { getStatsFromRow } from "../components";

export const PATREON_URL = "https://www.patreon.com/mimee";
// export const DISCORD_URL = "https://discord.gg/akasha";
export const DISCORD_URL = "https://discord.gg/jNM9HpaW2p";

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
  if (!document.cookie) return "";
  const toParam = new URLSearchParams(document.cookie.replace(/; /g, "&"));
  const cookie = Object.fromEntries(toParam);
  return cookie.akasha_session_id;

  // old:
  // return document.cookie?.split("connect.sid=s%3A")?.[1]?.split(".")?.[0] ?? "";
};

export const optsHeadersSessionID = () => {
  return {
    headers: {
      Authorization: `Bearer ${getSessionIdFromCookie()}`,
    },
  };
  // return {
  //   params: {
  //     sessionID: getSessionIdFromCookie(),
  //   },
  // };
};

export const ascensionToLevel = (
  ascension = 0,
  type: "weapon" | "character",
  levelFallback?: number
) => {
  // this partially fixes my screw-up on the backend
  // where promoteLevel is defaulted to a wrong value
  if (type === "weapon" && levelFallback && levelFallback <= 20) return 20;

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

const dummyArtifact = {
  name: null,
  setName: null,
  stars: null,
  mainStatKey: null,
  mainStatValue: null,
  equipType: null,
  level: null,
  critValue: null,
  icon: null,
  substats: {},
  substatsIdList: [],
  _id: null,
};

export const getArtifactsInOrder = (
  artifacts: { equipType: string }[],
  fillEmpty?: boolean
) => {
  if (!artifacts) return [];

  const reordered: any[] = [];
  const customOrder = [
    "EQUIP_BRACER", // flower
    "EQUIP_NECKLACE", // feather
    "EQUIP_SHOES", // sands
    "EQUIP_RING", // cup
    "EQUIP_DRESS", // circlet
  ];

  const artifactsMapped = Object.values(artifacts).reduce(
    (acc: any, val: any) => {
      acc[val.equipType] = val;
      return acc;
    },
    {}
  );

  customOrder.forEach((key) => {
    const desiredArtifact = artifactsMapped[key];

    if (desiredArtifact) {
      reordered.push(desiredArtifact);
    } else if (fillEmpty) {
      reordered.push({
        ...dummyArtifact,
        _id: Math.random(),
      });
    }
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

  // cool feature but wont work in my case
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

  if (roundToFixed(cv, 1) >= 54.4) return "rainbow";

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

  if (roundToFixed(cv, 1) >= 54.4) return "wtf-artifact";

  const _cv = cv + 0.05;
  if (_cv >= 50) return "unicorn-artifact";
  if (_cv >= 45) return "upper-diamond-artifact";
  if (_cv >= 35) return "diamond-artifact";
  if (_cv >= 25) return "good-artifact";
  if (_cv >= 15) return "ok-artifact";
  return "poo-artifact";
};

export const getArtifactRvClassName = (
  characterName: string,
  artifact: any,
  overrideFilter?: string[]
) => {
  const summedArtifactRolls = getSummedArtifactRolls(artifact);
  const characterRvStats = overrideFilter || getDefaultRvFilters(characterName);

  let _RV = characterRvStats.reduce((accumulator, key) => {
    const _rv = summedArtifactRolls[key]?.rv || 0;
    return (accumulator += _rv);
  }, 0);

  // const isCritCirclet =
  //   artifact?.equipType === "EQUIP_DRESS" &&
  //   artifact?.mainStatKey.startsWith("Crit");

  // if (isCritCirclet) _RV += 100;

  if (_RV >= 900) return "wtf-artifact";
  if (_RV >= 750) return "unicorn-artifact";
  if (_RV >= 650) return "upper-diamond-artifact";
  if (_RV >= 550) return "diamond-artifact";
  if (_RV >= 450) return "good-artifact";
  if (_RV >= 350) return "ok-artifact";
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
    uid = "" + uid;
    if (uid.startsWith("@")) uid = uid.slice(1);
    stringified += `[uid]${uid.toLowerCase()}`;
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
  if (n > 999_999) {
    const millions = n / 1_000_000;

    // e.g.  1m  or  1.2m
    const rounded = roundToFixed(millions, 2);

    return `${rounded}m`;
  }

  if (n > 9_999) {
    const thousands = n / 1000;

    // if above 100k then dont show decimals ( e.g. 107k )
    if (thousands > 99) {
      return `${Math.round(thousands)}k`;
    }

    // if below 100k then show one decimal ( e.g. 56.6k )
    const rounded = roundToFixed(thousands, 1);

    return `${rounded}k`;
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
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = (R * (100 + percent)) / 100;
  G = (G * (100 + percent)) / 100;
  B = (B * (100 + percent)) / 100;

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  const RR =
    R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  const GG =
    G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  const BB =
    B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

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

export const getCharacterStatsInOrder = (
  stats: { name: string; value: number }[]
) => {
  const reordered: any[] = [];
  const damageBonusStat = stats.find((x) => x.name.endsWith("DMG Bonus"));

  // elemental damage first
  if (damageBonusStat) {
    reordered.push(damageBonusStat);
  } else {
    // reordered.push({
    //   name: "x",
    //   value: null,
    // });
  }

  const customOrder = [
    "HP",
    "ATK",
    "DEF",
    "Healing Bonus",
    "Elemental Mastery",
    "Energy Recharge",
  ];

  customOrder.forEach((key) => {
    Object.values(stats).forEach((stat) => {
      if (stat.name !== key) return;
      reordered.push(stat);
    });
  });

  return reordered;
};

export const getRelevantMainStats = (row: any) => {
  const relevantMainStats = [];

  // first pass, check by artifact main stats
  for (const artifactSlot of Object.keys(row.artifactObjects)) {
    const mainStatKey: string = row.artifactObjects[artifactSlot].mainStatKey;
    if (mainStatKey.includes("Crit") || mainStatKey.includes("DMG Bonus"))
      continue;

    const keyValue =
      {
        "HP%": "maxHp",
        "DEF%": "def",
        "ATK%": "atk",
        "Healing Bonus": "healingBonus",
        "Elemental Mastery": "elementalMastery",
        "Energy Recharge": "energyRecharge",
      }[mainStatKey] || "";

    relevantMainStats.push({
      name: mainStatKey.replace("%", ""),
      value: row.stats[keyValue]?.value,
    });
  }
  return relevantMainStats;
};

export const getRelevantDmgBonuses = (row: any) => {
  const stats: any = getStatsFromRow(row);

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

  const chElement = row.characterMetadata?.element;

  const sorted = dmgStats
    .sort((a, b) => {
      const numA = +(a.value || 0);
      const numB = +(b.value || 0);

      // prioritize character's element on TIE.
      if (numA === numB && chElement && a.name.includes(chElement)) {
        return -1;
      }

      return numA > numB ? -1 : 1;
    })
    .slice(0, 5);

  const lowestDmg = sorted.length > 1 ? +sorted[sorted.length - 1].value : 0;
  const allLowestDmgs = sorted.filter(
    (a) => +a.value === lowestDmg && +a.value !== 0 && !isNaN(a.value)
  );

  if (allLowestDmgs.length === sorted.length && lowestDmg !== 0) {
    if (chElement) {
      const chElementDmg = sorted.find((a) => a.name.includes(chElement));
      return [chElementDmg];
    }
  }

  const relevantDamageTypes = sorted.filter(
    (a: any) => +a.value !== lowestDmg && +a.value !== 0 && !isNaN(a.value)
  );

  return relevantDamageTypes;
};

export const getRelevantEmErHb = (row: any) => {
  const relevantExtraStats = [];

  const hbThreshold = 0.2495; // 25% Healing Bonus -> // @TODO: change to 15% because thats 2pc set bonus?
  const emThreshold = 74.95; // 75 EM ~~ around 4 EM subs or set effect.
  const erThreshold = 1.0495; // higher than 105% ?

  if (row.stats.healingBonus?.value >= hbThreshold) {
    relevantExtraStats.push({
      name: "Healing Bonus",
      value: row.stats.healingBonus.value,
    });
  }
  if (row.stats.elementalMastery?.value >= emThreshold) {
    relevantExtraStats.push({
      name: "Elemental Mastery",
      value: row.stats.elementalMastery.value,
    });
  }
  if (row.stats.energyRecharge?.value >= erThreshold) {
    relevantExtraStats.push({
      name: "Energy Recharge",
      value: row.stats.energyRecharge.value,
    });
  }

  return relevantExtraStats;
};

// export const getRelevantHpOrAtkOrDef = (row: any) => {
//   const relevantExtraStats = [];

//   const hpThreshold = 21000;
//   const atkThreshold = 1100;
//   const defThreshold = 1350;

//   if (row.stats.maxHp?.value >= hpThreshold) {
//     relevantExtraStats.push({
//       name: "HP",
//       value: row.stats.maxHp.value,
//     });
//   } else if (row.stats.atk?.value >= atkThreshold) {
//     relevantExtraStats.push({
//       name: "ATK",
//       value: row.stats.atk.value,
//     });
//   } else if (row.stats.def?.value >= defThreshold) {
//     relevantExtraStats.push({
//       name: "DEF",
//       value: row.stats.def.value,
//     });
//   }

//   return relevantExtraStats;
// };

export const getRelevantStatFromRvFilter = (row: any) => {
  const rvFilter = getDefaultRvFilters(row.name);
  const formattedRvFilter = rvFilter
    .filter((x) => !(x.startsWith("Crit") || x.startsWith("Flat"))) // no crits, no flats
    .map((x) => x.replace("%", "")); // format properly

  const relevantExtraStats = [];

  for (const filter of formattedRvFilter) {
    const statKey = {
      ATK: "atk",
      DEF: "def",
      HP: "maxHp",
      "Energy Recharge": "energyRecharge",
      "Elemental Mastery": "elementalMastery",
    }[filter];

    if (!statKey) continue;

    relevantExtraStats.push({
      name: filter,
      value: row.stats[statKey].value,
    });
  }

  return relevantExtraStats;
};

export const fillUpToFourStats = (stats: any[], row: any) => {
  while (stats.length < 4) {
    const hasER = stats.findIndex((x: any) =>
      x.name.includes("Energy Recharge")
    );
    if (hasER === -1) {
      stats.push({
        name: "Energy Recharge",
        value: row.stats.energyRecharge?.value,
      });
      continue;
    }

    const hasHP = stats.findIndex((x: any) => x.name.includes("HP"));
    if (hasHP === -1) {
      stats.push({
        name: "HP",
        value: row.stats.maxHp?.value,
      });
      continue;
    }

    const hasATK = stats.findIndex((x: any) => x.name.includes("ATK"));
    if (hasATK === -1) {
      stats.push({
        name: "ATK",
        value: row.stats.atk?.value,
      });
      continue;
    }

    const hasDEF = stats.findIndex((x: any) => x.name.includes("DEF"));
    if (hasDEF === -1) {
      stats.push({
        name: "DEF",
        value: row.stats.def?.value,
      });
      continue;
    }

    const hasEM = stats.findIndex((x: any) =>
      x.name.includes("Elemental Mastery")
    );
    if (hasEM === -1) {
      stats.push({
        name: "Elemental Mastery",
        value: row.stats.elementalMastery?.value,
      });
      continue;
    }

    // to be safe
    stats.push({
      name: "x",
      value: null,
    });
  }
  return stats;
};

export const getRelevantCharacterStats = (row: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mainDmgBonus, ...otherDmgBonuses] = getRelevantDmgBonuses(row);

  const prepStats = [
    mainDmgBonus, // only get 1st?
    ...getRelevantMainStats(row),
    ...getRelevantStatFromRvFilter(row),
    ...getRelevantEmErHb(row),
    // ...getRelevantHpOrAtkOrDef(row),
    // get relevant from substats ?? (hp?)
    // ...otherDmgBonuses,
  ].filter((x) => x);

  // remove dupes part 1
  const _noDupesObj = prepStats.reduce((acc, val) => {
    acc[val.name] = val.value;
    return acc;
  }, {});

  // remove dupes part 2
  let relevantStats = Object.keys(_noDupesObj).reduce((acc: any, key: any) => {
    acc.push({
      name: key,
      value: _noDupesObj[key],
    });
    return acc;
  }, []);

  // fill remaining columns if needed
  relevantStats = fillUpToFourStats(relevantStats, row);

  // reorder stats
  relevantStats = getCharacterStatsInOrder(relevantStats);

  return relevantStats;
};

export const domainRedirect = () => {
  const currentHref = window.location.href;

  // let _from = "!@#$%!@#$";
  let _from = "mimee.ovh";

  switch (currentHref) {
    case "peacerekam.github.io":
      _from = "peacerekam.github.io";
      break;
    case "146.59.86.233":
      _from = "146.59.86.233";
      break;
    case "148.113.178.222":
      _from = "148.113.178.222";
      break;
    case "54.39.29.82":
      _from = "54.39.29.82";
      break;
  }

  if (currentHref.includes(_from) || currentHref.startsWith("www.")) {
    // startsWith ?? includes ??
    const _to = "akasha.cv";
    // const _to = "ns5032948.ip-148-113-178.net";

    const newHref = currentHref
      .replace("www.", "")
      .replace(_from, _to) // change domain
      .replace("/#/", "/"); // HashRouter to BrowserRouter
    window.location.href = newHref;
  }
};

export const getSummedArtifactRolls = (artifact: any) => {
  const counted: {
    [statName: string]: {
      count: number;
      sum: number;
      rv: number;
      // rvList: {
      //   name: string;
      //   value: number;
      // }[];
    };
  } = {};
  for (const id of artifact.substatsIdList) {
    const { value, type } = REAL_SUBSTAT_VALUES[id];
    const statName = STAT_NAMES[type];
    const _rv = getSubstatEfficiency(value, statName);
    // const _rvEntry = {
    //   name: "statName",
    //   value: _rv,
    // };

    counted[statName] = {
      count: (counted[statName]?.count ?? 0) + 1,
      sum: (counted[statName]?.sum ?? 0) + value,
      rv: (counted[statName]?.rv ?? 0) + _rv,
      // rvList: [...(counted[statName]?.rvList ?? []), _rvEntry],
    };
  }
  return counted;
};

function getFormattedDate(
  date: any,
  prefomattedDate?: string,
  hideYear?: boolean
) {
  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  let minutes = date.getMinutes();

  if (minutes < 10) {
    // Adding leading zero to minutes
    minutes = `0${minutes}`;
  }

  if (prefomattedDate) {
    // Today at 10:20
    // Yesterday at 10:20
    return `${prefomattedDate} at ${hours}:${minutes}`;
  }

  if (hideYear) {
    // 10. January at 10:20
    return `${day} ${month} at ${hours}:${minutes}`;
  }

  // 10. January 2017. at 10:20
  return `${day} ${month} ${year}. at ${hours}:${minutes}`;
}

// --- Main function
export const timeAgo = (dateParam: any) => {
  if (!dateParam) {
    return "";
  }

  const date = typeof dateParam === "object" ? dateParam : new Date(dateParam);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today = new Date();
  const yesterday = new Date(+today - DAY_IN_MS);
  const seconds = Math.round((+today - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();

  if (seconds < 5) {
    return "now";
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 90) {
    return "about a minute ago";
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (isToday) {
    return getFormattedDate(date, "Today"); // Today at 10:20
  } else if (isYesterday) {
    return getFormattedDate(date, "Yesterday"); // Yesterday at 10:20
  } else if (isThisYear) {
    return getFormattedDate(date, undefined, true); // 10. January at 10:20
  }

  return getFormattedDate(date); // 10. January 2017. at 10:20
};

// bad practice hurr durr
// (Array.prototype as any).cssJoin = function () {
//   return this.filter((name: any) => name).join(" ");
// };

export const cssJoin = (classes: Record<string, any> | string[]) => {
  const isArray = Array.isArray(classes);
  if (isArray) return classes.filter((name) => name).join(" ");

  return Object.keys(classes)
    .filter((name) => classes[name])
    .join(" ");
};

export const isBuildNew = (lastBuildUpdate?: number) => {
  if (!lastBuildUpdate) return false;

  const now = new Date().getTime();
  const minutesSince = lastBuildUpdate
    ? (now - lastBuildUpdate) / 1000 / 60
    : null;

  const isNew = !!minutesSince && minutesSince < 30;
  return isNew;
};

export const getRelativeCoords = (event: React.MouseEvent<HTMLElement>) => {
  const { innerWidth, innerHeight } = window;
  const offsetX = event.clientX - innerWidth / 2;
  const offsetY = event.clientY - innerHeight / 2;
  return { offsetY, offsetX };
};

export const applyModalBodyStyle = ({ offsetX, offsetY }: any) => {
  const _body = document.querySelector("body");
  if (!_body) return; // lol

  _body.style.setProperty("--modal-offset-x", `${offsetX}px`);
  _body.style.setProperty("--modal-offset-y", `${offsetY}px`);
  _body?.classList.add("overflow-hidden");

  // const _tableWrapper = document.querySelectorAll(".custom-table-wrapper");
  // _tableWrapper.forEach((el: any, index) => {
  //   el.style = `z-index: -${index}`;
  // });
};

export const revertModalBodyStyle = () => {
  const _body = document.querySelector("body");
  if (!_body) return; // lol

  _body?.classList.remove("overflow-hidden");

  // const _tableWrapper = document.querySelectorAll(".custom-table-wrapper");
  // _tableWrapper.forEach((el: any, index) => {
  //   el.style = ``;
  // });
};
