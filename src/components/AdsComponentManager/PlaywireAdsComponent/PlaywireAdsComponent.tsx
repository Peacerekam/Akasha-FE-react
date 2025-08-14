import "./index.scss";

import { AdProviderContext } from "../../../context/AdProvider/AdProviderContext";
import { cssJoin } from "../../../utils/helpers";
import { useContext } from "react";

export type PlaywireAdsComponentProps = {
  adType: PlaywireAdTypes;
  hybrid?: "desktop" | "mobile";
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
};

type PlaywireAdTypes =
  | "LeaderboardATF"
  | "LeaderboardBTF"
  | "RichMedia"
  | "Video";

const AD_TYPE_TO_KEY: { [key: string]: string } = {
  LeaderboardATF: "leaderboard_atf",
  LeaderboardBTF: "leaderboard_btf",
  Video: "med_rect_atf",
};

export const PlaywireAdsComponent: React.FC<PlaywireAdsComponentProps> = ({
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
    "pw-container",
    adType === "Video" ? "video-ad-container" : "",
  ]);

  const classNamesAd = cssJoin(["playwire-ad-unit", `ad-${adID}`]);

  return (
    <div className={classNamesContainer}>
      <span className="ad-debug">{adID || adType}</span>
      {/* old */}
      {/* <RampUnit type={adID} cssClass={classNamesAd} /> */}

      {/* new */}
      <div id={`pw-${adID}`} className={classNamesAd} />
    </div>
  );
};
