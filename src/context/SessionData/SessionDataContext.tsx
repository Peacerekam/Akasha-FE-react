import React, { createContext, useCallback, useEffect, useState } from "react";

import axios from "axios";
import { optsParamsSessionID } from "../../utils/helpers";

type SessionProfile = {
  username?: string;
  profilePicture?: string;
  isPatreon?: boolean;
};

type SessionDataContextType = {
  boundAccounts: any[];
  profileObject: SessionProfile;
  isAuthenticated: boolean;
  isFetching: boolean;
  isBound: (uid?: string) => boolean;
  fetchSessionData: (modifyIsFetching?: boolean) => void;
};

const defaultValue = {
  boundAccounts: [],
  profileObject: {},
  isAuthenticated: false,
  isFetching: false,
  isBound: () => false,
  fetchSessionData: () => {},
} as SessionDataContextType;

const SessionDataContext = createContext(defaultValue);

const SessionDataContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [isFetching, setIsFetching] = useState(true);
  const [boundAccounts, setBoundAccounts] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileObject, setProfileObject] = useState<SessionProfile>({});

  const isBound = useCallback(
    (uid?: string) => {
      if (!uid) return false;
      const index = boundAccounts.findIndex((acc) => {
        const compare_A = (acc?.uid + "").toLowerCase();
        const compare_B = (uid + "")?.toLowerCase();
        return compare_A === compare_B;
      });
      return index > -1;
    },
    [boundAccounts]
  );

  const fetchSessionData = useCallback(async (modifyIsFetching = false) => {
    if (modifyIsFetching) {
      setIsFetching(true);
    }

    const getSessionURL = "/auth/status/";
    const response = await axios.get(getSessionURL, optsParamsSessionID());
    const { data } = response.data;
    setBoundAccounts(data.accounts);

    const debugDisplay = {
      ...data,
      accounts: data.accounts.map((x: any) => x.uid).join(", ") || null,
    };

    console.table(debugDisplay);

    if (data.username) {
      setIsAuthenticated(true);
      const { username, profilePicture, isPatreon } = data;
      setProfileObject({
        username,
        profilePicture,
        isPatreon,
      });
    }

    if (modifyIsFetching) {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchSessionData(true);
  }, [fetchSessionData]);

  const value = {
    fetchSessionData,
    boundAccounts,
    profileObject,
    isAuthenticated,
    isFetching,
    isBound,
  };

  return (
    <SessionDataContext.Provider value={value}>
      {children}
    </SessionDataContext.Provider>
  );
};

export { SessionDataContext, SessionDataContextProvider };
