export type ReliquarySubstats = {
  appendPropId: string;
  statValue: number;
};

export type ReliquaryMainstat = {
  mainPropId: string;
  statValue: number;
};

export type Reliquary = {
  level: number;
  mainPropId: number;
  appendPropIdList: number[];
};

export type Flat = {
  nameTextMapHash: string;
  setNameTextMapHash?: string;
  rankLevel: number;
  reliquaryMainstat?: ReliquaryMainstat;
  reliquarySubstats?: ReliquarySubstats[];
  setId?: number;
  itemType: string;
  icon: string;
  equipType?: string;
  weaponStats?: ReliquarySubstats[];
};

export type Weapon = {
  affixMap: { [key: string]: number };
  level: number;
  promoteLevel: number;
};

export type EquipList = {
  itemId: number;
  reliquary?: Reliquary;
  weapon?: Weapon;
  flat: Flat;
};

export type AvatarInfo = {
  avatarId: number;
  equipList: EquipList[];
  fetterInfo: {
    expLevel: number;
  };
  fightPropMap: {
    [key: string]: number | undefined;
  };
  inherentProudSkillList: number[];
  propMap: {
    [key: string]: {
      val?: string;
      ival: string;
      type: number;
    };
  };
  skillDepotId: number;
  skillLevelMap: {
    [key: string]: number | undefined;
  };
};

export type ShowAvatarInfoList = {
  avatarId: number;
  level: number;
};

export type PlayerInfo = {
  finishAchievementNum: number;
  level: number;
  nameCardId: number;
  nickname: string;
  profilePicture: {
    avatarId: number;
  };
  showAvatarInfoList: ShowAvatarInfoList[];
  showNameCardIdList: number[];
  signature: string;
  towerFloorIndex: number;
  towerLevelIndex: number;
  worldLevel: number;
};

export type EnkaEntity = {
  avatarInfoList: AvatarInfo[];
  playerInfo: PlayerInfo;
};
