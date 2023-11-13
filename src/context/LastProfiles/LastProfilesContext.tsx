import React, { createContext, useState, useEffect } from "react";

export type NicknameUidPair = {
  uid: string;
  nickname: string;
  priority?: number;
};

type LastProfilesContextType = {
  lastProfiles: NicknameUidPair[];
  addTab: (uid: string, nickname: string) => void;
  favouriteTab: (uid: string, nickname: string) => void;
  removeTab: (uid: string) => void;
};

const defaultValue = {
  lastProfiles: [],
  addTab: () => {},
  favouriteTab: () => {},
  removeTab: () => {},
} as LastProfilesContextType;

const LastProfilesContext = createContext(defaultValue);

const LastProfilesContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [lastProfiles, setLastProfiles] = useState<NicknameUidPair[]>([]);

  const tabLimit = 10;

  // read from local storage
  useEffect(() => {
    const obj = JSON.parse(localStorage.getItem("navbarTabs") ?? "{}");

    // reset localStorage if old object is present
    if (obj.nicknameMap) {
      setLastProfiles([]);
      return;
    }

    // otherwise just do as usual
    if (obj.lastProfiles) {
      setLastProfiles(obj.lastProfiles);
    }
  }, []);

  // save to local storage
  useEffect(() => {
    const obj = { lastProfiles };
    localStorage.setItem("navbarTabs", JSON.stringify(obj));
  }, [lastProfiles]);

  const findUID = (elements: NicknameUidPair[], uid: string) => {
    return elements.findIndex((a) => {
      const newUID = ("" + uid).trim().toLowerCase();
      const comparedUID = ("" + a.uid).trim().toLowerCase();
      return newUID === comparedUID;
    });
  };

  // const sortByPriority = (a: NicknameUidPair, b: NicknameUidPair) =>
  //   (a?.priority || 1) < (b?.priority || 1) ? 1 : -1;

  // add tab to state
  const addTab = (uid: string, nickname: string) => {
    setLastProfiles((prev) => {
      const index = findUID(prev, uid);
      if (index > -1) return prev;

      const favourites = prev.filter((a) => (a.priority || 1) > 1);
      if (favourites.length >= 10) return prev;

      const rest = prev.filter((a) => (a.priority || 1) === 1);
      const sliceFrom = -tabLimit + favourites.length;
      const newProfile = { uid, nickname, priority: 1 };
      return favourites.concat([...rest, newProfile].slice(sliceFrom));
    });
  };

  // favourite tab
  const favouriteTab = (uid: string, nickname: string) => {
    setLastProfiles((prev) => {
      const priority = 2;
      const index = findUID(prev, uid);

      if (index > -1) {
        const newPriority = prev[index].priority === priority ? 1 : priority;
        prev[index] = {
          ...prev[index],
          priority: newPriority,
        };

        const favourites = prev.filter((a) => (a.priority || 1) > 1);
        const rest = prev.filter((a) => (a.priority || 1) === 1);

        return [...favourites, ...rest];
      }

      const newProfile = { uid, nickname, priority };
      const _prev = [...prev, newProfile];
      const favourites = _prev.filter((a) => (a.priority || 1) > 1);

      if (favourites.length >= tabLimit) return prev;

      const rest = _prev.filter((a) => (a.priority || 1) === 1);
      const sliceFrom = -tabLimit + favourites.length;

      return [...favourites, ...rest.slice(sliceFrom)];

      // return favourites
      //   .concat([...rest, newProfile].slice(sliceFrom))
      //   .sort(sortByPriority);
    });
  };

  // remove tab from state
  const removeTab = (uid: string) => {
    setLastProfiles((prev) => {
      const arr = [...prev];
      const index = arr.findIndex((a) => a.uid === uid);
      if (index > -1) arr.splice(index, 1);
      return arr;
    });
  };

  const value = {
    lastProfiles,
    addTab,
    favouriteTab,
    removeTab,
  };

  return (
    <LastProfilesContext.Provider value={value}>
      {children}
    </LastProfilesContext.Provider>
  );
};

export { LastProfilesContext, LastProfilesContextProvider };
