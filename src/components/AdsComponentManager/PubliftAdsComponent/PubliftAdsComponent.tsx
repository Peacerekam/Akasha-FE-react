import "./index.scss";

import { useContext, useEffect } from "react";

import { AdProviderContext } from "../../../context/AdProvider/AdProviderContext";
import { cssJoin } from "../../../utils/helpers";

type PubliftAdsComponentProps = {
  adType: PubliftAdTypes;
  hybrid?: "desktop" | "mobile";
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
};

type PubliftAdTypes =
  | "LeaderboardATF"
  | "LeaderboardBTF"
  | "RichMedia"
  | "Video";

const AD_TYPE_TO_KEY: { [key: string]: string } = {
  LeaderboardATF: "header",
  LeaderboardBTF: "incontent_2",
  Video: "incontent_1",
};

// Publift Tags:
//
// <!-- GAM 71161633/AKSHA_akashacv/header -->
// <div data-fuse="header"></div>
//
// <!-- GAM 71161633/AKSHA_akashacv/sidebar_lhs -->
// <div data-fuse="sidebar_lhs"></div>
//
// <!-- GAM 71161633/AKSHA_akashacv/sidebar_rhs -->
// <div data-fuse="sidebar_rhs"></div>
//
// <!-- GAM 71161633/AKSHA_akashacv/incontent_1 -->
// <div data-fuse="incontent_1"></div>
//
// <!-- GAM 71161633/AKSHA_akashacv/incontent_2 -->
// <div data-fuse="incontent_2"></div>

export const PubliftAdsComponent: React.FC<PubliftAdsComponentProps> = ({
  adType,
  hideOnDesktop,
  hideOnMobile,
}) => {
  const { isMobile } = useContext(AdProviderContext);

  const adID = AD_TYPE_TO_KEY[adType];

  useEffect(() => {
    if (!adID || !adType) return;

    try {
      const fusetag =
        (window as any).fusetag || ((window as any).fusetag = { que: [] });

      fusetag.que.push(function () {
        fusetag.registerZone(adID);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  if (!adID || !adType) return null;
  if (!isMobile && hideOnDesktop) return null;
  if (isMobile && hideOnMobile) return null;

  const classNamesContainer = cssJoin([
    "publift-container",
    adType === "Video" ? "video-ad-container" : "",
  ]);

  const classNamesAd = cssJoin(["publift-ad-unit", `ad-${adID}`]);

  return (
    <div className={classNamesContainer}>
      <span className="ad-debug">{adID || adType}</span>
      <div className={classNamesAd} data-fuse={adID} />
    </div>
  );
};
