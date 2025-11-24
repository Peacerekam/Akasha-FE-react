const EM = "Elemental Mastery";
const ER = "Energy Recharge";
const CRate = "Crit RATE";
const CDMG = "Crit DMG";
const ATK_ = "ATK%";
const DEF_ = "DEF%";
const HP_ = "HP%";
const ATK = "Flat ATK";
const DEF = "Flat DEF";
const HP = "Flat HP";

type Stats =
  | "Elemental Mastery"
  | "Energy Recharge"
  | "Crit RATE"
  | "Crit DMG"
  | "ATK%"
  | "DEF%"
  | "HP%"
  | "Flat ATK"
  | "Flat DEF"
  | "Flat HP";

type OverrideRV = {
  [characterName: string]: {
    lbs?: number[]; // string?
    rv?: Stats[];
  };
};

type CharacterRVs = {
  [characterName: string]: Stats[];
};

type OverrideRVs = {
  [calculationId: number | string]: Stats[];
};

const OVERRIDE_RV_LIST: OverrideRV = {
  Klee: {},
  Fischl: {},
  Yoimiya: {},
  Mavuika: {},
  Xiangling: {},
  Arlecchino: {
    lbs: [
      // overload
      // mono pyro
    ],
    rv: [CRate, CDMG, ATK_],
  },
  "Furina Vape": {
    lbs: [
      // vape
      1000008910, 1000008911, 1000008912, 1000008913, 1000008914, 1000008915,
      1000008916, 1000008917, 1000008918, 1000008919,
    ],
    rv: [CRate, CDMG, HP_, EM, ER],
  },
  "Beidou Aggravate": {
    lbs: [
      // aggravate
      1000002412, 1000002413, 1000002414, 1000002415, 1000002416, 1000002417,
    ],
    rv: [CRate, CDMG, ATK_, EM, ER],
  },
  "Ganyu Freeze": {
    lbs: [
      // freeze
      1000003701, 1000003703, 1000003705, 1000003707, 1000003709,
    ],
    rv: [CRate, CDMG, ATK_],
  },
  "Wriothesley Freeze": {
    lbs: [
      // solo?
      // 1000008600, 1000008601, 1000008602,
      // freeze
      1000008603, 1000008604, 1000008605,
    ],
    rv: [CRate, CDMG, ATK_, ER],
  },
};

const overrideRvFilter: OverrideRVs = Object.keys(OVERRIDE_RV_LIST).reduce(
  (acc, val) => {
    const lbs = OVERRIDE_RV_LIST[val].lbs;
    const rv = OVERRIDE_RV_LIST[val].rv;
    if (!lbs || !rv) return acc;

    for (const calcId of lbs) {
      acc[calcId] = rv;
    }

    return acc;
  },
  {} as OverrideRVs
);

const ANEMO_RV_LIST: CharacterRVs = {
  Sayu: [CRate, CDMG, EM, ER],
  Venti: [CRate, CDMG, ATK_, EM, ER],
  Xiao: [CRate, CDMG, ATK_, ER],
  Jean: [CRate, CDMG, ATK_, EM, ER],
  Faruzan: [CRate, CDMG, ATK_, ER],
  Wanderer: [CRate, CDMG, ATK_, ER],
  "Kaedehara Kazuha": [CRate, CDMG, ATK_, EM, ER],
  Sucrose: [CRate, CDMG, ATK_, EM, ER],
  Xianyun: [CRate, CDMG, ATK_, ER],
  Chasca: [CRate, CDMG, ATK_, EM],
  "Yumemizuki Mizuki": [CRate, CDMG, ATK_, EM, ER],
  Ifa: [CRate, CDMG, ATK_, EM, ER],
  Jahoda: [CRate, CDMG, ER], // @TODO: ??
};

const PYRO_RV_LIST: CharacterRVs = {
  Klee: [CRate, CDMG, ATK_, EM],
  Diluc: [CRate, CDMG, ATK_, EM],
  Dehya: [CRate, CDMG, ATK_, ER, HP_],
  Bennett: [ER, HP_, CRate, CDMG],
  Yanfei: [CRate, CDMG, ATK_, EM, ER],
  Yoimiya: [CRate, CDMG, ATK_, EM],
  Xiangling: [CRate, CDMG, ATK_, EM, ER],
  "Hu Tao": [CRate, CDMG, HP_, EM],
  Lyney: [CRate, CDMG, ATK_, ER],
  Xinyan: [CRate, CDMG, ATK_, ER],
  Thoma: [CRate, CDMG, ATK_, ER],
  Amber: [CRate, CDMG, ATK_, ER],
  Chevreuse: [CRate, CDMG, ATK_, HP_, ER],
  Gaming: [CRate, CDMG, ATK_, EM],
  Arlecchino: [CRate, CDMG, ATK_, EM],
  Mavuika: [CRate, CDMG, ATK_, EM],
  Durin: [CRate, CDMG, ATK_], // @TODO: ??
};

const HYDRO_RV_LIST: CharacterRVs = {
  Nilou: [CRate, EM, ER, CDMG, HP_, HP],
  Xingqiu: [CRate, CDMG, ATK_, ER],
  Mona: [CRate, CDMG, ER, EM, ATK_],
  Tartaglia: [CRate, CDMG, ATK_, EM, ER],
  "Sangonomiya Kokomi": [HP, HP_, ER, ATK_],
  "Kamisato Ayato": [CRate, CDMG, ER, ATK_],
  Yelan: [CRate, CDMG, HP_, ER],
  Furina: [CRate, CDMG, HP_, ER],
  Candace: [CRate, CDMG, HP_, ER],
  Neuvillette: [CRate, CDMG, HP_, ER],
  Barbara: [CRate, CDMG, ATK_, HP_, ER],
  Mualani: [CRate, CDMG, HP_, EM],
  Aino: [CRate, CDMG, ATK_, ER],
};

const CRYO_RV_LIST: CharacterRVs = {
  Diona: [CRate, CDMG, HP_, ER],
  Qiqi: [CRate, CDMG, ATK_],
  Eula: [CRate, CDMG, ER, ATK_],
  Ganyu: [CRate, CDMG, ATK_, EM],
  Shenhe: [ER, ATK, ATK_, CRate, CDMG],
  "Kamisato Ayaka": [CRate, CDMG, ER, ATK_],
  Wriothesley: [CRate, CDMG, EM, ER, ATK_],
  Charlotte: [CRate, CDMG, ER, ATK_],
  Mika: [CRate, CDMG, HP_, ER, ATK_],
  Citlali: [CRate, CDMG, ATK_, EM, ER],
  Escoffier: [CRate, CDMG, ATK_, ER],
  Skirk: [CRate, CDMG, ATK_],
};

const GEO_RV_LIST: CharacterRVs = {
  Albedo: [CRate, CDMG, DEF_],
  Noelle: [CRate, CDMG, DEF_, ATK_, ER],
  Zhongli: [CRate, CDMG, ATK_, HP_],
  "Yun Jin": [CRate, CDMG, ER, DEF, DEF_],
  "Arataki Itto": [CRate, CDMG, ER, DEF_, ATK_],
  Navia: [CRate, CDMG, ATK_, ER],
  Chiori: [CRate, CDMG, ATK_, DEF_],
  Xilonen: [CRate, CDMG, ER, DEF_],
};

const ELECTRO_RV_LIST: CharacterRVs = {
  Razor: [CRate, CDMG, ATK_],
  Lisa: [CRate, CDMG, ATK_, EM],
  Fischl: [ATK_, EM, CRate, CDMG],
  Keqing: [CRate, CDMG, ATK_, EM],
  Clorinde: [CRate, CDMG, ATK_, EM],
  Beidou: [ER, ATK_, CRate, CDMG],
  "Yae Miko": [ER, ATK_, CRate, CDMG, EM],
  "Raiden Shogun": [CRate, CDMG, ATK_, ER],
  "Kuki Shinobu": [CRate, CDMG, ATK_, EM, ER],
  Cyno: [CRate, CDMG, ATK_, EM, ER],
  "Kujou Sara": [CRate, CDMG, ATK_, ER],
  Dori: [CRate, CDMG, HP_, ATK_, ER],
  Varesa: [CRate, CDMG, ATK_, ER],
  Iansan: [CRate, CDMG, ATK_, ER],
  Ororon: [CRate, CDMG, ATK_, ER],
  Ineffa: [CRate, CDMG, ATK_, EM, ER],
  Flins: [CRate, CDMG, ATK_, EM, ER],
};

const DENDRO_RV_LIST: CharacterRVs = {
  Nahida: [CRate, CDMG, ATK_, EM],
  Alhaitham: [CRate, CDMG, ATK_, EM, ER],
  Tighnari: [CRate, CDMG, ATK_, EM, ER],
  Yaoyao: [CRate, CDMG, ATK_, EM, ER],
  Collei: [CRate, CDMG, ATK_, EM, ER],
  Emilie: [CRate, CDMG, ATK_],
  Kinich: [CRate, CDMG, ATK_],
  Lauma: [CRate, CDMG, EM, ER],
  Nefer: [CRate, CDMG, EM],
};

const defaultRvFilter = [CRate, CDMG];

export const allRvFilters: CharacterRVs = {
  ...ANEMO_RV_LIST,
  ...PYRO_RV_LIST,
  ...HYDRO_RV_LIST,
  ...CRYO_RV_LIST,
  ...GEO_RV_LIST,
  ...ELECTRO_RV_LIST,
  ...DENDRO_RV_LIST,
  Traveler: [CRate, CDMG, ER, ATK_], // Traveler can have different RV filter depending on the element?
};

export const getDefaultRvFilters = (characterName: string) => {
  return allRvFilters[characterName] || defaultRvFilter;
};

export const getOverrideRvFilters = (calculationId?: string | number) => {
  if (!calculationId) return;

  if (calculationId) {
    calculationId = (calculationId + "").slice(0, 10);
  }

  const override = overrideRvFilter[calculationId];
  return override;
};
