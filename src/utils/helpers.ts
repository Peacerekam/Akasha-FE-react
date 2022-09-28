const urls = {
  localhost: "http://localhost:5033",
  vps: "http://149.57.165.73:5033",
  proxy: "http://localhost:3100/akasha",
  prod: "https://www.mimee.ovh/akasha",
  heroku: "https://akasha-backend.herokuapp.com"
};

export const BACKEND_URL = urls["heroku"];

export const FETCH_ARTIFACTS_URL = `${BACKEND_URL}/api/artifacts`;
export const FETCH_BUILDS_URL = `${BACKEND_URL}/api/builds/`;
export const FETCH_LEADERBOARDS_URL = `${BACKEND_URL}/api/leaderboards`;
export const FETCH_CATEGORIES_URL = `${BACKEND_URL}/api/getCategories`;

export const FETCH_CHARACTER_FILTERS_URL = `${BACKEND_URL}/api/getTableCharacterFilters/`;
export const FETCH_ARTIFACT_FILTERS_URL = `${BACKEND_URL}/api/getTableArtifactFilters/`;

export const normalizeText = (test: string) => {
  const regex = /[^A-Za-z0-9%]/g;
  return test.replace(regex, "").replace(/%/g, "_").toLowerCase();
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

  // @KM: cool feature but wont work in my case
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
  const filters: any[] = [];
  const _tmp = value.split("[").slice(1);
  _tmp.forEach((str) => {
    const _vals = str.split("]");
    let key = _vals[0];
    let value = isNaN(+_vals[1]) ? _vals[1] : +_vals[1];
    if (key === undefined || value === undefined) return;

    filters.push({
      name: key,
      value: value,
    });
  });
  return filters;
};
