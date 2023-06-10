import React, { useState, createContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

type AdProviders = null | "google" | "venatus";

type AdProviderContextType = {
  adProvider: AdProviders;
  setAdProvider: (_: AdProviders) => void;
};

const defaultValue = {
  adProvider: "google",
  setAdProvider: () => {},
} as AdProviderContextType;

const AdProviderContext = createContext(defaultValue);

const AdProviderContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [adProvider, setAdProvider] = useState<AdProviders>(null);
  const location = useLocation();

  useEffect(() => {
    if (adProvider) return;

    if (location.search.includes("venatus-test")) {
      setAdProvider("venatus");
    } else {
      setAdProvider("google");
    }
  }, [location.search]);

  const value = {
    adProvider,
    setAdProvider,
  };

  return (
    <AdProviderContext.Provider value={value}>
      {children}
    </AdProviderContext.Provider>
  );
};

export { AdProviderContext, AdProviderContextProvider };
