import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";
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
      const isBound = boundAccounts.findIndex((acc) => acc.uid === uid) > -1;
      return isBound;
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
    console.log("data", data, "modifyIsFetching", modifyIsFetching);
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

  // read from local storage
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
