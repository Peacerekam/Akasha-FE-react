import React, { useState, createContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

// import { Ramp } from "@playwire/pw-react-component";
const { Ramp } = require("@playwire/pw-react-component");

type AdProviders = null | "google" | "venatus" | "playwire";

type AdProviderContextType = {
  adProvider: AdProviders;
  setAdProvider: (_: AdProviders) => void;
  reloadAds: boolean;
  adsDisabled: boolean;
  disableAdsForThisPage: () => void;
  isMobile: boolean;
  screenWidth: number;
};

const defaultValue = {
  adProvider: "google",
  setAdProvider: () => {},
  reloadAds: false,
  adsDisabled: false,
  disableAdsForThisPage: () => {},
  isMobile: false,
  screenWidth: 1024,
} as AdProviderContextType;

const AdProviderContext = createContext(defaultValue);

const PLAYWIRE_PUBLISHER_ID = "1025066";
const PLAYWIRE_WEBSITE_ID = "74554";

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

    // @TODO: possibly lower this? or maybe change entire logic when adProvider === "playwire"
    // 2.g.
    if (adProvider === "playwire") {
      // (window as any).ramp?.triggerRefresh();
    }

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

    if (location.search.includes("playwire-test")) {
      setAdProvider("playwire");
    } else {
      setAdProvider("venatus");
    }
  }, [location.search]);

  useEffect(() => {
    const _body = document.querySelector("body");
    if (!adProvider) return;
    
    _body?.classList.add(`ad-provider-${adProvider}`);
  }, [adProvider]);

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
    screenWidth: width,
    isMobile,
  };

  return (
    <AdProviderContext.Provider value={value}>
      {/* Only load this component once, at the top most level of your app */}
      {adProvider === "playwire" && (
        <>
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              width: "calc(100% - 25px)",
              padding: 5,
              color: "red",
              fontSize: 12,
              pointerEvents: "none",
            }}
          >
            <div>PLAYWIRE RAMP COMPONENT</div>
            <div>PLAYWIRE_PUBLISHER_ID: {PLAYWIRE_PUBLISHER_ID}</div>
            <div>PLAYWIRE_WEBSITE_ID: {PLAYWIRE_WEBSITE_ID}</div>
          </div>
          <Ramp publisherId={PLAYWIRE_PUBLISHER_ID} id={PLAYWIRE_WEBSITE_ID} />
        </>
      )}
      {children}
    </AdProviderContext.Provider>
  );
};

export { AdProviderContext, AdProviderContextProvider };
