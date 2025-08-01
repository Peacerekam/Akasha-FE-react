import React, { createContext, useEffect, useState } from "react";

import Ramp from "../../components/PlaywireAdsComponent/Ramp";
import { useLocation } from "react-router-dom";

type AdProviders = null | "google" | "venatus" | "playwire" | "snigel";

type AdProviderContextType = {
  adProvider: AdProviders;
  setAdProvider: (_: AdProviders) => void;
  adsDisabled: boolean;
  disableAdsForThisPage: () => void;
  isMobile: boolean;
  screenWidth: number;
  contentWidth: number;
  setContentWidth: (_: number) => void;
  setPreventContentShrinking: (_: string, mode: "add" | "remove") => void;
};

const defaultValue = {
  adProvider: "google",
  setAdProvider: () => {},
  adsDisabled: false,
  disableAdsForThisPage: () => {},
  isMobile: false,
  screenWidth: 1024,
  contentWidth: 1100,
  setContentWidth: () => {},
  setPreventContentShrinking: () => {},
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
  const [contentWidth, _setContentWidth] = useState<number>(1100);
  const [_preventContentShrinking, _setPreventContentShrinking] = useState<
    string[]
  >([]);

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
    if (adProvider) return;

    // if (location.search.includes("test-page")) {
    //   setAdProvider("snigel");
    // } else {
    //   setAdProvider("playwire");
    // }

    setAdProvider("snigel");
    setContentWidth(1100);
  }, [location.search]);

  useEffect(() => {
    const _body = document.querySelector("body");
    if (!adProvider) return;

    _body?.classList.add(`ad-provider-${adProvider}`);
  }, [adProvider]);

  useEffect(() => {
    setAdsDisabled(false); // reset disable state -> used on patreon profiles for now
    _setContentWidth(1100);
    _setPreventContentShrinking([]);

    if (adProvider === "snigel") {
      try {
        (window as any).AdSlots.disableAds = false;
        (window as any)?.reloadAdSlots?.();
      } catch (err) {
        console.log(err);
      }
    }
  }, [location.pathname]);

  const disableAdsForThisPage = () => {
    setAdsDisabled(true);
    if (adProvider === "snigel") {
      (window as any).AdSlots.disableAds = true;
    }
  };

  const setPreventContentShrinking = (key: string, mode: "add" | "remove") => {
    _setPreventContentShrinking((arr) => {
      const index = arr.indexOf(key);
      if (mode === "remove" && index > -1) {
        arr.splice(index, 1);
      } else if (mode === "add" && index === -1) {
        arr.push(key);
      }
      return arr;
    });
  };

  const setContentWidth = (num: number) => {
    const preventContentShrinking = _preventContentShrinking.length > 0;

    if (preventContentShrinking && num <= contentWidth) {
      return;
    }

    _setContentWidth(num);
  };

  const value = {
    adProvider,
    setAdProvider,
    adsDisabled,
    disableAdsForThisPage,
    screenWidth: width,
    isMobile,
    contentWidth,
    setContentWidth,
    setPreventContentShrinking,
  };

  return (
    <AdProviderContext.Provider value={value}>
      {adProvider === "playwire" && (
        <>
          {/* <div
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
          </div> */}
          {/* Only load this component once, at the top most level of your app */}

          {/* this used to work... */}
          {/* <Ramp publisherId={PLAYWIRE_PUBLISHER_ID} id={PLAYWIRE_WEBSITE_ID} /> */}

          <Ramp
            PUB_ID={PLAYWIRE_PUBLISHER_ID}
            WEBSITE_ID={PLAYWIRE_WEBSITE_ID}
          />
        </>
      )}
      {children}
      {adProvider === "snigel" && (
        <>
          <div id="nn_skinl" />
          <div id="nn_skinr" />
          <div id="nn_player" />
        </>
      )}
    </AdProviderContext.Provider>
  );
};

export { AdProviderContext, AdProviderContextProvider };
