import { useEffect, useState } from "react";

export type UseState<T> = React.Dispatch<React.SetStateAction<T | undefined>>;

type CardSettings = {
  displayBuildName?: boolean;
  simplifyColors?: boolean;
  adaptiveBgColor?: boolean;
  namecardBg?: boolean;
  privacyFlag?: boolean;
  weaponSkin?: boolean;
  setDisplayBuildName: UseState<boolean>;
  setSimplifyColors: UseState<boolean>;
  setAdaptiveBgColor: UseState<boolean>;
  setNamecardBg: UseState<boolean>;
  setPrivacyFlag: UseState<boolean>;
  setWeaponSkin: UseState<boolean>;
};

// this could be a context instead but doesn't quite fit 100%
export const useCardSettings = (): CardSettings => {
  const [namecardBg, setNamecardBg] = useState<boolean>();
  const [simplifyColors, setSimplifyColors] = useState<boolean>();
  const [adaptiveBgColor, setAdaptiveBgColor] = useState<boolean>();
  const [displayBuildName, setDisplayBuildName] = useState<boolean>();
  const [privacyFlag, setPrivacyFlag] = useState<boolean>();
  const [weaponSkin, setWeaponSkin] = useState<boolean>();

  const lsKey = "cardSettings";

  // load from local storage
  useEffect(() => {
    const savedObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");

    const setIfDifferent = (
      setFunc: any,
      key: string,
      value: any,
      defaultValue: any = false,
    ) => {
      if (savedObj[key] === false) {
        setFunc(false);
      } else {
        setFunc(savedObj[key] || value || defaultValue);
      }
    };

    setIfDifferent(
      setDisplayBuildName,
      "displayBuildName",
      displayBuildName,
      true,
    );
    setIfDifferent(setSimplifyColors, "simplifyColors", simplifyColors);
    setIfDifferent(setAdaptiveBgColor, "adaptiveBgColor", adaptiveBgColor);
    setIfDifferent(setNamecardBg, "namecardBg", namecardBg);
    setIfDifferent(setPrivacyFlag, "privacyFlag", privacyFlag);
    setIfDifferent(setWeaponSkin, "weaponSkin", weaponSkin, true);

    console.log("\nLoading Character Card settings from Local Storage:");
    console.table(savedObj);
  }, [localStorage]);

  // save to local storage
  useEffect(() => {
    const oldObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
    let dirty = false;

    const assignIfDiffAndNotUndefined = (key: string, value: any) => {
      if (oldObj[key] !== value && value !== undefined) {
        console.log(`${key}: ${oldObj[key]} -> ${value}`);
        oldObj[key] = value;
        dirty = true;
      }
    };

    assignIfDiffAndNotUndefined("displayBuildName", displayBuildName);
    assignIfDiffAndNotUndefined("simplifyColors", simplifyColors);
    assignIfDiffAndNotUndefined("adaptiveBgColor", adaptiveBgColor);
    assignIfDiffAndNotUndefined("namecardBg", namecardBg);
    assignIfDiffAndNotUndefined("privacyFlag", privacyFlag);
    assignIfDiffAndNotUndefined("weaponSkin", weaponSkin);

    if (!dirty) return;

    const newObj = { ...oldObj };
    localStorage.setItem(lsKey, JSON.stringify(newObj));
  }, [
    displayBuildName,
    simplifyColors,
    adaptiveBgColor,
    namecardBg,
    privacyFlag,
    weaponSkin,
  ]);

  return {
    displayBuildName,
    simplifyColors,
    adaptiveBgColor,
    namecardBg,
    privacyFlag,
    weaponSkin,
    setDisplayBuildName,
    setSimplifyColors,
    setAdaptiveBgColor,
    setNamecardBg,
    setPrivacyFlag,
    setWeaponSkin,
  };
};
