import { useContext, useEffect, useState } from "react";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { useLocation } from "react-router-dom";

type RampProps = {
  PUB_ID: string;
  WEBSITE_ID: string;
};

const Ramp: React.FC<RampProps> = ({ PUB_ID, WEBSITE_ID }) => {
  const [rampComponentLoaded, setRampComponentLoaded] = useState(false);
  const location = useLocation(); // React Router hook to get the current location

  const { contentWidth, screenWidth } = useContext(AdProviderContext);
  const [rails, setRails] = useState<HTMLElement[]>([]);

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
            `%c\n [onload] window.ramp.spaNewPage("${location.pathname}")`,
            "color: green;"
          );
          (window as any).ramp.spaNewPage(location.pathname);
          setRailsElement("pw-oop-left_rail");
          setRailsElement("pw-oop-right_rail");
        });
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
          `%c\n [unmount] window.ramp.spaNewPage("${location.pathname}")`,
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

  const setRailsElement = (id: string) => {
    const observer = new MutationObserver(() => {
      const iframeElement = document.querySelector(`#${id} iframe`);
      const divElement = document.getElementById(id);

      if (iframeElement && divElement) {
        setRails((prev) => [...prev.filter((x) => x.firstChild), divElement]);
        observer.disconnect();
      }
    });

    observer.observe(document, { subtree: true, childList: true });
  };

  useEffect(() => {
    if (rails.length === 0) return;

    rails.forEach((r) => {
      const styleArr = r.getAttribute("style")?.split(";");
      let newStyle = "";
      let hasOverflow = false;
      let hasOpacity = false;
      let spaceForRail = 0;
      let left = 0;
      let right = 0;

      styleArr?.forEach((x) => {
        const [key, val] = x.split(":");
        if (!key || !val) return;

        const keyTrim = key?.trim();
        let valTrim = val?.trim();

        if (keyTrim === "overflow") {
          hasOverflow = true;
        }

        if (keyTrim === "opacity") {
          hasOpacity = true;
        }

        if (keyTrim === "left") {
          left = +valTrim.replace("px", "");
        }

        if (keyTrim === "right") {
          right = +valTrim.replace("px", "");
        }

        if (keyTrim === "max-width") {
          spaceForRail = Math.max(
            0,
            Math.floor((screenWidth - contentWidth) / 2) - 10 - right - left
          );

          newStyle += `max-width:${spaceForRail}px;`;
        } else {
          newStyle += `${keyTrim}:${valTrim};`;
        }
      });

      if (!hasOpacity && spaceForRail === 0) {
        newStyle += "opacity:0 !important;";
      }

      if (hasOpacity && spaceForRail > 0) {
        newStyle = newStyle.replace("opacity:0 !important;", "");
      }

      if (!hasOverflow) {
        newStyle +=
          "overflow:hidden !important; display:flex; justify-content:center;";
      }

      r.setAttribute("style", newStyle);
    });
  }, [rails, screenWidth, contentWidth]);

  useEffect(() => {
    if (!rampComponentLoaded) return;

    // Handle page navigation
    (window as any).ramp.que.push(() => {
      console.log(
        `%c\n [navigation] window.ramp.spaNewPage("${location.pathname}")`,
        "color: orange;"
      );
      (window as any).ramp.spaNewPage(location.pathname);
      setRailsElement("pw-oop-left_rail");
      setRailsElement("pw-oop-right_rail");
    });
  }, [location.pathname]);

  return null;
};

export default Ramp;
