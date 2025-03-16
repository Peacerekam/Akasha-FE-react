import React, { createContext, useEffect, useState } from "react";

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
  contentWidth: number;
  setContentWidth: (_: number) => void;
  setPreventContentShrinking: (_: string, mode: "add" | "remove") => void;
};

const defaultValue = {
  adProvider: "google",
  setAdProvider: () => {},
  reloadAds: false,
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
  const [reloadAds, setReloadAds] = useState(false);
  const [rails, setRails] = useState<HTMLElement[]>([]);

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

    setAdProvider("playwire");
    setContentWidth(1100);

    // if (location.search.includes("playwire-test")) {
    //   setAdProvider("playwire");
    //   setContentWidth(1100);
    // } else {
    //   setAdProvider("venatus");
    //   setContentWidth(1100); // embrace new site width early
    //   // setContentWidth(1280);
    // }
  }, [location.search]);

  const setRailsElement = (id: string) => {
    const divElement = document.getElementById(id);
    if (divElement) {
      setRails((prev) => [...prev, divElement]);
    } else {
      const observer = new MutationObserver(() => {
        const iframeElement = document.querySelector(`#${id} iframe`);
        const divElement = document.getElementById(id);

        if (iframeElement && divElement) {
          setRails((prev) => [...prev, divElement]);
          observer.disconnect();
        }
      });

      observer.observe(document, { subtree: true, childList: true });
    }
  };

  useEffect(() => {
    const _body = document.querySelector("body");
    if (!adProvider) return;

    _body?.classList.add(`ad-provider-${adProvider}`);

    if (adProvider === "playwire") {
      setRailsElement("pw-oop-left_rail");
      setRailsElement("pw-oop-right_rail");
    }
  }, [adProvider]);

  useEffect(() => {
    if (rails.length === 0) return;

    const spaceForRail = Math.max(
      0,
      Math.floor((width - contentWidth) / 2) - 10
    );

    rails.forEach((r) => {
      const styleArr = r.getAttribute("style")?.split(";");
      let newStyle = "";
      let hasOverflow = false;

      styleArr?.forEach((x) => {
        const [key, val] = x.split(":");
        if (!key || !val) return;

        const keyTrim = key?.trim();
        const valTrim = val?.trim();

        if (keyTrim === "overflow") {
          hasOverflow = true;
        }

        if (keyTrim === "max-width") {
          newStyle += `max-width:${spaceForRail}px;`;
        } else {
          newStyle += `${keyTrim}:${valTrim};`;
        }
      });

      if (!hasOverflow) {
        newStyle +=
          "overflow:hidden !important; display: flex; justify-content: center;";
      }

      r.setAttribute("style", newStyle);
    });
  }, [rails, width, contentWidth]);

  useEffect(() => {
    setAdsDisabled(false); // reset disable state -> used on patreon profiles for now
    handleReloadAds(); // reload ads -> used all pages

    _setContentWidth(1100);
    _setPreventContentShrinking([]);
  }, [location.pathname]);

  const disableAdsForThisPage = () => setAdsDisabled(true);

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
    reloadAds,
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
          <Ramp publisherId={PLAYWIRE_PUBLISHER_ID} id={PLAYWIRE_WEBSITE_ID} />
        </>
      )}
      {children}
    </AdProviderContext.Provider>
  );
};

export { AdProviderContext, AdProviderContextProvider };
