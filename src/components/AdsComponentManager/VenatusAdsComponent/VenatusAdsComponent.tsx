import "./index.scss";

import * as React from "react";

export type VenatusAdsComponentProps = {
  adType: VenatusAdTypes;
  hybrid?: "desktop" | "mobile";
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
};

type VenatusAdTypes =
  | "LeaderboardATF"
  | "LeaderboardBTF"
  | "RichMedia"
  | "Video";

export default class VenatusAdsComponent extends React.Component<
  VenatusAdsComponentProps,
  { width: number }
> {
  private adRef = React.createRef<HTMLDivElement>();

  constructor(props: VenatusAdsComponentProps) {
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

    console.log(
      `%c\n\n > ${this.props.adType}: MOUNT `,
      "color: green; font-size: 16px;"
    );
    if (adType !== "Video") {
      (window as any).__vm_add = (window as any).__vm_add || [];
      (window as any).__vm_add.push(this.adRef.current);
      console.log(`%c > ${adType}: VM_ADD `, "color: green; font-size: 16px;");
      console.log(this.adRef.current);
    } else {
      console.log(
        `%c > ${adType}: .........`,
        "color: green; font-size: 16px;"
      );
    }
  }

  componentWillUnmount() {
    const { adType, hideOnDesktop, hideOnMobile } = this.props;
    const { width } = this.state;
    const isMobile = width <= 800; // 768;
    if (!isMobile && hideOnDesktop) return;
    if (isMobile && hideOnMobile) return;

    console.log(
      `%c\n\n > ${this.props.adType}: UNMOUNT `,
      "color: red; font-size: 16px;"
    );

    if (adType === "RichMedia") {
      console.log(
        `%c > ${adType}: VM_REMOVE_CATEGORY `,
        "color: red; font-size: 16px;"
      );
      console.log(this.adRef.current);
      (window as any).top.__vm_remove_category = ["richmedia_all"];
      return;
    } else if (adType !== "Video") {
      (window as any).top.__vm_remove = (window as any).top.__vm_remove || [];
      (window as any).top.__vm_remove.push(this.adRef.current);
      console.log(`%c > ${adType}: VM_REMOVE `, "color: red; font-size: 16px;");
      console.log(this.adRef.current);
    } else {
      console.log(`%c > ${adType}: .........`, "color: red; font-size: 16px;");
    }
  }

  render() {
    const { adType, hideOnDesktop, hideOnMobile } = this.props;
    if (!adType) return null;
    if (adType === "Video") return; // quick and dirty

    const { width } = this.state;
    const isMobile = width <= 800; // 768;
    if (!isMobile && hideOnDesktop) return null;
    if (isMobile && hideOnMobile) return null;

    const mobileAdType: string = isMobile ? `Mobile${adType}` : adType;

    const AD_TYPE_TO_ID: { [key: string]: string } = {
      LeaderboardATF: "647dac63cf4d572f0c0f54f3",
      LeaderboardBTF: "647dac76cf4d572f0c0f54f5",
      MobileLeaderboardATF: "647dac8af97ba856bd4b7f5d",
      MobileLeaderboardBTF: "647dac98cf4d572f0c0f54f7",
      RichMedia: "647dacddcf4d572f0c0f54f9", // display: none; ??
    };

    const adID = AD_TYPE_TO_ID[mobileAdType] || AD_TYPE_TO_ID[adType];

    // const isHybridBanner =
    //   mobileAdType === "MobileLeaderboardBTF" ||
    //   mobileAdType === "LeaderboardATF";

    const isHybridBanner = isMobile
      ? this.props.hybrid === "mobile"
      : this.props.hybrid === "desktop";

    return (
      <div
        className={`vm-container ${
          adType === "RichMedia"
            ? // || adType === "Video" // quick and dirty
              "shrink-ad"
            : ""
        }`}
      >
        <span className="ad-debug">
          {AD_TYPE_TO_ID[mobileAdType] ? mobileAdType : adType} - {adID} -{" "}
          {isHybridBanner ? "hybrid banner" : ""}
        </span>
        <div
          ref={this.adRef}
          className="vm-placement"
          {...{
            "data-id": adID,
            style: { display: adType === "RichMedia" ? "none" : "block" },
            "data-display-type": isHybridBanner ? "hybrid-banner" : "",
          }}
          // quick and dirty
          // {...(adType === "Video"
          //   ? {
          //       id: "vm-av",
          //       "data-format": "isvideo",
          //     }
          //   : {
          //       "data-id": adID,
          //       style: { display: adType === "RichMedia" ? "none" : "block" },
          //       "data-display-type": isHybridBanner ? "hybrid-banner" : "",
          //     })}
        />
      </div>
    );
  }
}
