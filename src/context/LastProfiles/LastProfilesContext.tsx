import React, { createContext, useState, useEffect } from "react";

export type NicknameUidPair = {
  uid: string;
  nickname: string;
};

type LastProfilesContext = {
  lastProfiles: NicknameUidPair[];
  addTab: (uid: string, nickname: string) => void;
  removeTab: (uid: string) => void;
};

const defaultValue = {
  lastProfiles: [],
  addTab: () => {},
  removeTab: () => {},
} as LastProfilesContext;

const LastProfilesContext = createContext(defaultValue);

const LastProfilesContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [lastProfiles, setLastProfiles] = useState<NicknameUidPair[]>([]);

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
  }, [JSON.stringify(lastProfiles)]);

  // add tab to state
  const addTab = (uid: string, nickname: string) => {
    setLastProfiles((prev) => {
      const index = prev.findIndex((a) => a.uid === uid);
      if (index > -1) return prev;
      const newProfile = { uid, nickname };
      return [...prev, newProfile];
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
    removeTab,
  };

  return (
    <LastProfilesContext.Provider value={value}>
      {children}
    </LastProfilesContext.Provider>
  );
};

export { LastProfilesContext, LastProfilesContextProvider };
