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

const ANEMO_RV_LIST = {
  Sayu: [EM, ER],
  Venti: [CRate, CDMG, ATK_, EM, ER],
  Xiao: [CRate, CDMG, ATK_, ER],
  Jean: [CRate, CDMG, ATK_, ER],
  Faruzan: [CRate, CDMG, ATK_, ER],
  Wanderer: [CRate, CDMG, ATK_, ER],
  "Kaedehara Kazuha": [CRate, CDMG, ATK_, EM, ER],
  Sucrose: [CRate, CDMG, ATK_, EM, ER],
  Xianyun: [CRate, CDMG, ATK_, ER],
};

const PYRO_RV_LIST = {
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
};

const HYDRO_RV_LIST = {
  Nilou: [CRate, EM, ER, CDMG, HP_, HP],
  Xingqiu: [CRate, CDMG, ATK_, ER],
  Mona: [CRate, CDMG, ER, EM, ATK_],
  Tartaglia: [CRate, CDMG, ATK_, EM, ER],
  "Sangonomiya Kokomi": [HP, HP_, ER, ATK_],
  "Kamisato Ayato": [CRate, CDMG, ER, ATK_],
  Yelan: [CRate, CDMG, HP_, ER],
  Furina: [CRate, CDMG, HP_, ER],
  Neuvillette: [CRate, CDMG, HP_, ER],
  Barbara: [CRate, CDMG, ATK_, HP_, ER],
  Mualani: [CRate, CDMG, HP_, EM],
};

const CRYO_RV_LIST = {
  Diona: [HP_, ER],
  Qiqi: [CRate, CDMG, ATK_],
  Eula: [CRate, CDMG, ER, ATK_],
  Ganyu: [CRate, CDMG, ATK_, EM],
  Shenhe: [ER, ATK, ATK_, CRate, CDMG],
  "Kamisato Ayaka": [CRate, CDMG, ER, ATK_],
  Wriothesley: [CRate, CDMG, EM, ER, ATK_],
  Charlotte: [CRate, CDMG, ER, ATK_],
  Mika: [CRate, CDMG, HP_, ER, ATK_],
};

const GEO_RV_LIST = {
  Albedo: [CRate, CDMG, DEF_],
  Noelle: [CRate, CDMG, DEF_, ATK_, ER],
  Zhongli: [CRate, CDMG, ATK_, HP_],
  "Yun Jin": [CRate, ER, DEF, DEF_],
  "Arataki Itto": [CRate, CDMG, ER, DEF_, ATK_],
  Navia: [CRate, CDMG, ATK_, ER],
  Chiori: [CRate, CDMG, ATK_, DEF_],
};

const ELECTRO_RV_LIST = {
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
};

const DENDRO_RV_LIST = {
  Nahida: [CRate, CDMG, EM],
  Alhaitham: [CRate, CDMG, ATK_, EM, ER],
  Tighnari: [CRate, CDMG, ATK_, EM, ER],
  Yaoyao: [CRate, CDMG, ATK_, EM, ER],
  Collei: [CRate, CDMG, ATK_, EM, ER],
  Emilie: [CRate, CDMG, ATK_],
  Kinich: [CRate, CDMG, ATK_],
};

const defaultRvFilter = [CRate, CDMG];

export const allRvFilters: Record<string, string[]> = {
  ...ANEMO_RV_LIST,
  ...PYRO_RV_LIST,
  ...HYDRO_RV_LIST,
  ...CRYO_RV_LIST,
  ...GEO_RV_LIST,
  ...ELECTRO_RV_LIST,
  ...DENDRO_RV_LIST,
};

export const getDefaultRvFilters = (character: string) => {
  return allRvFilters[character] || defaultRvFilter;
};
