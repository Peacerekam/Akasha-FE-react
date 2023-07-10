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
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [reloadAds, setReloadAds] = useState(false);
  const location = useLocation();

  const isMobile = width <= 800; // 768;

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    setReloadAds(true);
    setTimeout(() => setReloadAds(false), 100);
  }, [isMobile])

  useEffect(() => {
    if (adProvider) return;
    setAdProvider("venatus");

    // if (location.search.includes("venatus-test")) {
    //   setAdProvider("venatus");
    // } else {
    //   setAdProvider("google");
    // }
  }, [location.search]);

  useEffect(() => {
    // reset disable state -> used on patreon profiles for now
    setAdsDisabled(false);
    // reload ads -> used all pages
    setReloadAds(true);
    setTimeout(() => setReloadAds(false), 100);
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
