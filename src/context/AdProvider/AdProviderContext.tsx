import React, { useState, createContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

type AdProviders = null | "google" | "venatus";

type AdProviderContextType = {
  adProvider: AdProviders;
  setAdProvider: (_: AdProviders) => void;
  reloadAds: boolean;
  adsDisabled: boolean;
  disableAdsForThisPage: () => void;
};

const defaultValue = {
  adProvider: "google",
  setAdProvider: () => {},
  reloadAds: false,
  adsDisabled: false,
  disableAdsForThisPage: () => {},
} as AdProviderContextType;

const AdProviderContext = createContext(defaultValue);

const AdProviderContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [adsDisabled, setAdsDisabled] = useState(false);
  const [adProvider, setAdProvider] = useState<AdProviders>(null);
  const [reloadAds, setReloadAds] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (adProvider) return;

    if (location.search.includes("venatus-test")) {
      setAdProvider("venatus");
    } else {
      setAdProvider("google");
    }
  }, [location.search]);

  useEffect(() => {
    setReloadAds(true);
    setAdsDisabled(false);
    setTimeout(() => setReloadAds(false), 10);
  }, [location.pathname]);

  const disableAdsForThisPage = () => setAdsDisabled(true);

  const value = {
    adProvider,
    setAdProvider,
    reloadAds,
    adsDisabled,
    disableAdsForThisPage,
  };

  return (
    <AdProviderContext.Provider value={value}>
      {children}
    </AdProviderContext.Provider>
  );
};

export { AdProviderContext, AdProviderContextProvider };
