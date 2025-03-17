import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

type RampProps = {
  PUB_ID: string;
  WEBSITE_ID: string;
};

const Ramp: React.FC<RampProps> = ({ PUB_ID, WEBSITE_ID }) => {
  const [rampComponentLoaded, setRampComponentLoaded] = useState(false);
  const location = useLocation(); // React Router hook to get the current location

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
          (window as any).ramp.spaNewPage(location.pathname);
        });
      };
    }

    // Handle page navigation
    (window as any).ramp.que.push(() => {
      (window as any).ramp.spaNewPage(location.pathname);
    });

    // Cleanup function to handle component unmount
    return () => {
      (window as any).ramp.que.push(() => {
        (window as any).ramp.spaNewPage(location.pathname);
      });
    };
  }, [rampComponentLoaded, location.pathname, PUB_ID, WEBSITE_ID]);

  return null;
};

export default Ramp;
