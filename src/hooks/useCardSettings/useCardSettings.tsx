import { useEffect, useState } from "react";

type UseState<T> = React.Dispatch<React.SetStateAction<T | undefined>>;

type CardSettings = {
  displayBuildName?: boolean;
  simplifyColors?: boolean;
  adaptiveBgColor?: boolean;
  namecardBg?: boolean;
  privacyFlag?: boolean;
  setDisplayBuildName: UseState<boolean>;
  setSimplifyColors: UseState<boolean>;
  setAdaptiveBgColor: UseState<boolean>;
  setNamecardBg: UseState<boolean>;
  setPrivacyFlag: UseState<boolean>;
};

// this could be a context instead but doesn't quite fit 100%
export const useCardSettings = (): CardSettings => {
  const [namecardBg, setNamecardBg] = useState<boolean>();
  const [simplifyColors, setSimplifyColors] = useState<boolean>();
  const [adaptiveBgColor, setAdaptiveBgColor] = useState<boolean>();
  const [displayBuildName, setDisplayBuildName] = useState<boolean>();
  const [privacyFlag, setPrivacyFlag] = useState<boolean>();

  // load from local storage
  useEffect(() => {
    const savedObj = JSON.parse(localStorage.getItem("cardSettings") ?? "{}");

    const setIfDifferent = (setFunc: any, key: string, value: any) => {
      setFunc(savedObj[key] || value || false);
    };

    setIfDifferent(setDisplayBuildName, "displayBuildName", displayBuildName);
    setIfDifferent(setSimplifyColors, "simplifyColors", simplifyColors);
    setIfDifferent(setAdaptiveBgColor, "adaptiveBgColor", adaptiveBgColor);
    setIfDifferent(setNamecardBg, "namecardBg", namecardBg);
    setIfDifferent(setPrivacyFlag, "privacyFlag", privacyFlag);

    console.log("\nLoading Character Card settings from Local Storage:");
    console.table(savedObj);
  }, [localStorage]);

  // save to local storage
  useEffect(() => {
    const oldObj = JSON.parse(localStorage.getItem("cardSettings") ?? "{}");
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

    if (!dirty) return;

    const newObj = { ...oldObj };
    localStorage.setItem("cardSettings", JSON.stringify(newObj));
  }, [
    displayBuildName,
    simplifyColors,
    adaptiveBgColor,
    namecardBg,
    privacyFlag,
  ]);

  return {
    displayBuildName,
    simplifyColors,
    adaptiveBgColor,
    namecardBg,
    privacyFlag,
    setDisplayBuildName,
    setSimplifyColors,
    setAdaptiveBgColor,
    setNamecardBg,
    setPrivacyFlag,
  };
};
