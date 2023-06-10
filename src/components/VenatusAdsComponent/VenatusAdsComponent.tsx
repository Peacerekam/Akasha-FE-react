import React, { useEffect, useRef, useState } from "react";
import "./index.scss";

export type VenatusAdsComponentProps = {
  adType: VenatusAdTypes;
};

type VenatusAdTypes =
  | "LeaderboardATF"
  | "LeaderboardBTF"
  | "RichMedia"
  | "Video";

export const VenatusAdsComponent: React.FC<VenatusAdsComponentProps> = ({
  adType,
}) => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  const adRef = useRef<HTMLDivElement>(null);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  const mountAd = () => {
    (window as any).top.__vm_add = (window as any).top.__vm_add || [];
    (window as any).top.__vm_add.push(adRef.current);
  };

  const unmountAd = () => {
    (window as any).top.__vm_remove = (window as any).top.__vm_remove || [];
    (window as any).top.__vm_remove.push(adRef.current);
  };

  useEffect(() => {
    mountAd();
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      unmountAd();
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 800; // 768;
  const mobileAdType: string = isMobile ? `Mobile${adType}` : adType;

  const AD_TYPE_TO_ID: { [key: string]: string } = {
    LeaderboardATF: "647dac63cf4d572f0c0f54f3",
    LeaderboardBTF: "647dac76cf4d572f0c0f54f5",
    MobileLeaderboardATF: "647dac8af97ba856bd4b7f5d",
    MobileLeaderboardBTF: "647dac98cf4d572f0c0f54f7",
    RichMedia: "647dacddcf4d572f0c0f54f9", // display: none; ??
  };

  const adID = AD_TYPE_TO_ID[mobileAdType] || AD_TYPE_TO_ID[adType];

  const isHybridBanner =
    mobileAdType === "MobileLeaderboardBTF" ||
    mobileAdType === "LeaderboardATF";

  return (
    <div
      className={`vm-container ${
        adType === "RichMedia" || adType === "Video" ? "shrink-ad" : ""
      }`}
    >
      <span className="ad-debug">
        {AD_TYPE_TO_ID[mobileAdType] ? mobileAdType : adType} - {adID}
      </span>
      {adType === "Video" ? (
        <div
          ref={adRef}
          className="vm-placement"
          id="vm-av"
          data-format="isvideo"
        />
      ) : (
        <div
          ref={adRef}
          className="vm-placement"
          data-id={adID}
          style={{ display: adType === "RichMedia" ? "none" : "block" }}
          data-display-type={isHybridBanner ? "hybrid-banner" : ""}
        />
      )}
    </div>
  );
};
