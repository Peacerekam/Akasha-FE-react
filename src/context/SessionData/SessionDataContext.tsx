import React, { createContext, useCallback, useEffect, useState } from "react";

import axios from "axios";
import { optsHeadersSessionID } from "../../utils/helpers";

type SessionProfile = {
  username?: string;
  profilePicture?: string;
  isPatreon?: boolean;
  isEnkaPatreon?: boolean;
  disableDbUpdates?: boolean;
};

type SessionDataContextType = {
  boundAccounts: any[];
  profileObject: SessionProfile;
  isAuthenticated: boolean;
  isFetching: boolean;
  isBound: (uid?: string) => boolean;
  fetchSessionData: (modifyIsFetching?: boolean) => void;
  sessionFetched: boolean;
};

const defaultValue = {
  boundAccounts: [],
  profileObject: {},
  isAuthenticated: false,
  isFetching: false,
  isBound: () => false,
  fetchSessionData: () => {},
  sessionFetched: false,
} as SessionDataContextType;

const SessionDataContext = createContext(defaultValue);

const SessionDataContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [isFetching, setIsFetching] = useState(true);
  const [boundAccounts, setBoundAccounts] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionFetched, setSessionFetched] = useState(false);
  const [profileObject, setProfileObject] = useState<SessionProfile>({});

  const isBound = useCallback(
    (uid?: string) => {
      const _uid = uid?.startsWith("@") ? uid.slice(1) : uid;
      if (!_uid) return false;

      const index = boundAccounts.findIndex((acc) => {
        const compare_A = (acc?.uid + "").toLowerCase();
        const compare_B = (_uid + "")?.toLowerCase();
        return compare_A === compare_B;
      });
      return index > -1;
    },
    [boundAccounts]
  );

  const setIsFetchingIfTrue = (modifyIsFetching: boolean, value: boolean) =>
    modifyIsFetching && setIsFetching(value);

  const fetchSessionData = useCallback(async (modifyIsFetching = false) => {
    setIsFetchingIfTrue(modifyIsFetching, true);

    try {
      const getSessionURL = "/auth/status/";
      const response = await axios.get(getSessionURL, optsHeadersSessionID());
      const { data } = response.data;
      setBoundAccounts(data.accounts);

      const debugDisplay = {
        ...data,
        accounts: data.accounts.map((x: any) => x.uid).join(", ") || null,
      };

      delete debugDisplay.disableDbUpdates;
      console.table(debugDisplay);
      setSessionFetched(true);

      if (data.username) {
        setIsAuthenticated(true);

        const {
          username,
          profilePicture,
          isPatreon,
          isEnkaPatreon,
          disableDbUpdates,
        } = data;

        setProfileObject({
          username,
          profilePicture,
          isPatreon,
          isEnkaPatreon,
          disableDbUpdates,
        });
      } else {
        setProfileObject({ disableDbUpdates: data.disableDbUpdates });
      }
      setIsFetchingIfTrue(modifyIsFetching, false);
    } catch (e) {
      // ...
      setIsFetchingIfTrue(modifyIsFetching, false);
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
    sessionFetched,
  };

  return (
    <SessionDataContext.Provider value={value}>
      {children}
    </SessionDataContext.Provider>
  );
};

export { SessionDataContext, SessionDataContextProvider };
