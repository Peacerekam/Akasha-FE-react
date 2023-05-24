import React, { useEffect, useState } from "react";
import "./style.scss";
import { showAds } from "../../App";
import { AdsComponent } from "../AdsComponent";
import { useLocation } from "react-router-dom";

export const MobileStickyBar: React.FC = () => {
  const [hide, setHide] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    setHide(false);
  }, [location.pathname]);

  const handleHide = () => {
    setHide(true);
    // setTimeout(() => {
    //   // actual hide
    // }, 2000)
  };

  return (
    <div
      // key={location.pathname} // is this enough to reset the ad on different pages?
      className={`sticky-bar ${hide ? "hide-animation" : ""}`}
    >
      <button onClick={handleHide} className="close-ad-btn">
        ×
      </button>
      {showAds && <AdsComponent dataAdSlot="9021820760" />}
    </div>
  );
};
