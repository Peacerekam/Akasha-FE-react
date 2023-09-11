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

  const handleReloadAds = () => {
    setReloadAds(true);

    // if (location.pathname.startsWith("/leaderboards/1000000603")) { 
    //   console.log(`%c\n\n [!] DISABLED AD-TAKEOVER WORKAROUND`, "color: red; font-size: 20px;");
    // } else {
    //   document.querySelector("#top-of-the-page")?.classList.remove("anim");
    //   document.querySelector(".navbar-tabs")?.classList.remove("anim");
    // }

    setTimeout(() => {
      setReloadAds(false);

      // if (location.pathname.startsWith("/leaderboards/1000000603")) {
      //   // ... lisa
      // } else {
      //   document.querySelector("#top-of-the-page")?.classList.add("anim");
      //   document.querySelector(".navbar-tabs")?.classList.add("anim");
      // }
    }, 100);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    handleReloadAds();
  }, [isMobile]);

  useEffect(() => {
    if (adProvider) return;
    setAdProvider("venatus");

    // @TODO: 
    // if (location.search.includes("venatus-test")) {
    //   setAdProvider("venatus");
    // } else {
    //   setAdProvider("google");
    // }
  }, [location.search]);

  useEffect(() => {
    setAdsDisabled(false); // reset disable state -> used on patreon profiles for now
    handleReloadAds(); // reload ads -> used all pages
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
