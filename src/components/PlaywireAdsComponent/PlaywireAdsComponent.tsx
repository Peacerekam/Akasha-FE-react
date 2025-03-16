import "./index.scss";

import * as React from "react";

import RampUnit from "../../utils/PlaywireRamp/RampUnit";
import { cssJoin } from "../../utils/helpers";

// const { RampUnit } = require("@playwire/pw-react-component");

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
  Video: "med_rect_atf", // not video?
  // MobileLeaderboardATF: "647dac8af97ba856bd4b7f5d",
  // MobileLeaderboardBTF: "647dac98cf4d572f0c0f54f7",
  // RichMedia: "richmedia??", // display: none; ??
};

export default class PlaywireAdsComponent extends React.Component<
  PlaywireAdsComponentProps,
  { width: number }
> {
  constructor(props: PlaywireAdsComponentProps) {
    super(props);
    this.state = {
      width: window.innerWidth,
    };
  }

  componentDidMount() {
    const { adType, hideOnDesktop, hideOnMobile } = this.props;
    const { width } = this.state;
    const isMobile = width <= 800; // 768;
    if (!isMobile && hideOnDesktop) return;
    if (isMobile && hideOnMobile) return;

    const adID = AD_TYPE_TO_KEY[adType];
    if (!adID) return;

    // console.log(`%c  > Mount: ${adID}`, "color: green;");
  }

  componentWillUnmount() {
    const { adType, hideOnDesktop, hideOnMobile } = this.props;
    const { width } = this.state;
    const isMobile = width <= 800; // 768;
    if (!isMobile && hideOnDesktop) return;
    if (isMobile && hideOnMobile) return;

    const adID = AD_TYPE_TO_KEY[adType];
    if (!adID) return;

    // console.log(`%c  > Unmount: ${adID}`, "color: red;");
  }

  render() {
    const { adType, hideOnDesktop, hideOnMobile } = this.props;
    if (!adType) return null;

    const { width } = this.state;
    const isMobile = width <= 800; // 768;
    if (!isMobile && hideOnDesktop) return null;
    if (isMobile && hideOnMobile) return null;

    // const mobileAdType: string = isMobile ? `Mobile${adType}` : adType;

    // const adID = AD_TYPE_TO_KEY[mobileAdType] || AD_TYPE_TO_KEY[adType];
    const adID = AD_TYPE_TO_KEY[adType];
    if (!adID) return null;

    // const isHybridBanner =
    //   mobileAdType === "MobileLeaderboardBTF" ||
    //   mobileAdType === "LeaderboardATF";

    const classNamesContainer = cssJoin([
      "pw-container",
      adType === "Video" ? "video-ad-container" : "",
    ]);

    const classNamesAd = cssJoin(["playwire-ad-unit", `ad-${adID}`]);

    return (
      <div className={classNamesContainer}>
        <span className="ad-debug">{adID || adType}</span>
        <RampUnit type={adID} cssClass={classNamesAd} />
      </div>
    );
  }
}
