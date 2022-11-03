import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";

type SessionProfile = {
  username?: string;
  profilePicture?: string;
};

type SessionDataContextType = {
  boundAccounts: any[];
  profileObject: SessionProfile;
  isAuthenticated: boolean;
  isFetching: boolean;
  isBound: (uid?: string) => boolean;
};

const defaultValue = {
  boundAccounts: [],
  profileObject: {},
  isAuthenticated: false,
  isBound: () => false,
  isFetching: false,
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

  const fetchSessionData = useCallback(async () => {
    setIsFetching(true);
    const getSessionURL = "/auth/status/";
    const response = await axios.get(getSessionURL);
    const { data } = response.data;
    setBoundAccounts(data.accounts);
    if (data.username) {
      setIsAuthenticated(true);
      const { username, profilePicture } = data;
      setProfileObject({
        username,
        profilePicture,
      });
    }
    setIsFetching(false);
  }, []);

  // read from local storage
  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const value = {
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
