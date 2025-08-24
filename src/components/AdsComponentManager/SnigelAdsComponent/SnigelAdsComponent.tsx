import "./index.scss";

import { AdProviderContext } from "../../../context/AdProvider/AdProviderContext";
import { cssJoin } from "../../../utils/helpers";
import { useContext } from "react";

type SnigelAdsComponentProps = {
  adType: SnigelAdTypes;
  hybrid?: "desktop" | "mobile";
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
};

type SnigelAdTypes =
  | "LeaderboardATF"
  | "LeaderboardBTF"
  | "RichMedia"
  | "Video";

const AD_TYPE_TO_KEY: { [key: string]: string } = {
  LeaderboardATF: "lb1",
  LeaderboardBTF: "lb3",
  Video: "mpu1",
};

// <!-- Desktop Tags -->
// <div id="nn_lb1"></div>
// <div id="nn_lb2"></div>
// <div id="nn_lb3"></div>
// <div id="nn_mpu1"></div>
// <div id="nn_skinl"></div> <- anywhere in <body> tag
// <div id="nn_skinr"></div> <- anywhere in <body> tag
// <div id="nn_player"></div> <- anywhere in <body> tag

// <!-- Mobile Tags -->
// <div id="nn_mobile_lb1"></div>
// <div id="nn_mobile_lb2"></div>
// <div id="nn_mobile_lb3"></div>
// <div id="nn_mobile_mpu1"></div>
// <div id="nn_mobile_mpu2"></div>

export const SnigelAdsComponent: React.FC<SnigelAdsComponentProps> = ({
  adType,
  hideOnDesktop,
  hideOnMobile,
}) => {
  const { isMobile } = useContext(AdProviderContext);

  if (!adType) return null;
  if (!isMobile && hideOnDesktop) return null;
  if (isMobile && hideOnMobile) return null;

  const adID = AD_TYPE_TO_KEY[adType];
  if (!adID) return null;

  const classNamesContainer = cssJoin([
    "snigel-container",
    adType === "Video" ? "video-ad-container" : "",
  ]);

  const classNamesAd = cssJoin(["snigel-ad-unit", `ad-${adID}`]);

  return (
    <div className={classNamesContainer}>
      <span className="ad-debug">{adID || adType}</span>

      {/* desktop */}
      <div id={`nn_${adID}`} className={classNamesAd} />

      {/* lb1 is the top ad on Desktop */}
      {/* lb2 is the top ad on Mobile */}
      {adID === "lb1" && isMobile ? (
        <div id={`nn_mobile_lb2`} className={classNamesAd} />
      ) : null}

      {/* mobile lb1 is auto-injected, do not place it */}
      {adID !== "lb1" && (
        <div id={`nn_mobile_${adID}`} className={classNamesAd} />
      )}
    </div>
  );
};
