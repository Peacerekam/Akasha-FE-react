import { useContext, useEffect, useMemo, useState } from "react";

import { AdProviderContext } from "../../../context/AdProvider/AdProviderContext";
import { useLocation } from "react-router-dom";

type RampProps = {
  PUB_ID: string;
  WEBSITE_ID: string;
};

const Ramp: React.FC<RampProps> = ({ PUB_ID, WEBSITE_ID }) => {
  const [rampComponentLoaded, setRampComponentLoaded] = useState(false);
  const location = useLocation(); // React Router hook to get the current location

  const { contentWidth, screenWidth } = useContext(AdProviderContext);

  useEffect(() => {
    if (!PUB_ID || !WEBSITE_ID) {
      console.log("Missing Publisher Id and Website Id");
      return;
    }

    if (!rampComponentLoaded) {
      setRampComponentLoaded(true);
      (window as any).ramp = (window as any).ramp || {};
      (window as any).ramp.que = (window as any).ramp.que || [];
      (window as any).ramp.passiveMode = true;

      // Load the Ramp configuration script
      const configScript = document.createElement("script");
      configScript.src = `https://cdn.intergient.com/${PUB_ID}/${WEBSITE_ID}/ramp.js`;
      document.body.appendChild(configScript);

      configScript.onload = () => {
        (window as any).ramp.que.push(() => {
          console.log(
            `%c[onload] window.ramp.spaNewPage("${location.pathname}")`,
            "color: green;"
          );
          (window as any).ramp.spaNewPage(location.pathname);
        });
      };

      configScript.onerror = () => {
        console.error("[onerror] Ramp.js loading error");
        document.querySelector("body")?.classList.add("ramp-js-error");
      };
    }

    // Handle page navigation
    // (window as any).ramp.que.push(() => {
    //   (window as any).ramp.spaNewPage(location.pathname);
    // });

    // Cleanup function to handle component unmount
    return () => {
      (window as any).ramp.que.push(() => {
        console.log(
          `%c[unmount] window.ramp.spaNewPage("${location.pathname}")`,
          "color: red;"
        );
        (window as any).ramp.spaNewPage(location.pathname);
      });
    };
  }, [
    // rampComponentLoaded,
    // location.pathname,
    PUB_ID,
    WEBSITE_ID,
  ]);

  useEffect(() => {
    if (!rampComponentLoaded) return;

    // Handle page navigation
    (window as any).ramp.que.push(() => {
      console.log(
        `%c[navigation] window.ramp.spaNewPage("${location.pathname}")`,
        "color: orange;"
      );
      (window as any).ramp.spaNewPage(location.pathname);
    });
  }, [location.pathname]);

  useEffect(() => {
    const _railsOffset = Math.ceil(screenWidth / 2 + contentWidth / 2 + 10);
    const _html = document.querySelector("html") as HTMLElement;
    _html!.style.setProperty("--rails-offset", `${_railsOffset}px`);
  }, [screenWidth, contentWidth]);

  return null;
};

export default Ramp;
