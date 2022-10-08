import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { BACKEND_URL } from "../../utils/helpers";

type LastProfiles = {
  lastProfiles: string[];
  nicknameMap: { [uid: string | number]: string };
  removeTab: (uid: string) => void;
  updateLastProfiles: (hash: string) => void;
};

const defaultValue = {
  lastProfiles: [],
  nicknameMap: {},
  removeTab: () => {},
  updateLastProfiles: () => {},
} as LastProfiles;

const LastProfilesContext = createContext(defaultValue);

const LastProfilesContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [lastProfiles, setLastProfiles] = useState<any[]>([]);
  const [nicknameMap, setNicknameMap] = useState<{ [key: string]: string }>({});
  const [_timeout, _setTimeout] = useState<any>();

  useEffect(() => {
    const combined = JSON.parse(localStorage.getItem("navbarTabs") ?? "{}");
    if (combined.lastProfiles) {
      setLastProfiles(combined.lastProfiles);
    }
    if (combined.nicknameMap) {
      setNicknameMap(combined.nicknameMap);
    }
  }, []);

  useEffect(() => {
    const combined = {
      lastProfiles,
      nicknameMap,
    };
    localStorage.setItem("navbarTabs", JSON.stringify(combined));
  }, [JSON.stringify(lastProfiles), JSON.stringify(nicknameMap)]);

  const updateLastProfiles = (hash: string) => {
    if (_timeout) clearTimeout(_timeout);

    const profileURL = "/profile/";
    if (!hash.includes(profileURL)) return;

    const uid = hash.replace(profileURL, "");
    if (lastProfiles.includes(uid)) return;

    if (!nicknameMap[uid]) {
      getNickname(uid);
    }

    setLastProfiles((prev) => Array.from(new Set([...prev.slice(-12), uid])));
  };

  const getNickname = async (uid: string) => {
    const getNicknameURL = `${BACKEND_URL}/api/nickname/${uid}`;
    const { data } = await axios.get(getNicknameURL);
    if (data.data.nickname === null) {
      const _t = setTimeout(() => getNickname(uid), 1000);
      _setTimeout(_t);
    } else {
      setNicknameMap((prev: any) => ({
        ...prev,
        [uid]: data.data.nickname,
      }));
    }
  };

  const removeTab = (uid: string) => {
    setLastProfiles((prev) => {
      const arr = [...prev];
      const index = arr.indexOf(uid);
      if (index > -1) {
        arr.splice(index, 1);
      }
      return arr;
    });
  };

  const value = {
    lastProfiles,
    nicknameMap,
    removeTab,
    updateLastProfiles,
  };

  return (
    <LastProfilesContext.Provider value={value}>
      {children}
    </LastProfilesContext.Provider>
  );
};

export { LastProfilesContext, LastProfilesContextProvider };
