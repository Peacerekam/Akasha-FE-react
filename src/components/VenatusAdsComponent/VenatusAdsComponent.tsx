import * as React from "react";
import "./index.scss";

export type VenatusAdsComponentProps = {
  adType: VenatusAdTypes;
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
      width: window.innerWidth
    }
  }

  componentDidMount() {
    const { adType } = this.props;
    console.log(`%c\n\n   > ${this.props.adType}: MOUNT `, 'color: green');
    if (adType !== "Video") {
      (window as any).__vm_add = (window as any).__vm_add || [];
      (window as any).__vm_add.push(this.adRef.current);
      console.log(`%c   > ${adType}: VM_ADD `, 'color: green');
      console.log(this.adRef.current);
    } else {
      console.log(`%c   > ${adType}: .........`, 'color: green');
    }
  }

  componentWillUnmount() {
    const { adType } = this.props;
    console.log(`%c\n\n   > ${this.props.adType}: UNMOUNT `, 'color: red');

    if (adType === "RichMedia") {
      console.log(`%c   > ${adType}: VM_REMOVE_CATEGORY `, 'color: red');
      console.log(this.adRef.current);
      (window as any).top.__vm_remove_category = ["richmedia_all"];
      return;
    } else if (adType !== "Video") {
      (window as any).top.__vm_remove = (window as any).top.__vm_remove || [];
      (window as any).top.__vm_remove.push(this.adRef.current);
      console.log(`%c   > ${adType}: VM_REMOVE `, 'color: red');
      console.log(this.adRef.current);
    } else {
      console.log(`%c   > ${adType}: .........`, 'color: red');
    }
  }

  render() {
    const { adType } = this.props;
    if (!adType) return null;

    const { width } = this.state;
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
        <div
          ref={this.adRef}
          className="vm-placement"
          {...(adType === "Video"
            ? {
                id: "vm-av",
                "data-format": "isvideo",
              }
            : {
                "data-id": adID,
                style: { display: adType === "RichMedia" ? "none" : "block" },
                "data-display-type": isHybridBanner ? "hybrid-banner" : "",
              })}
        />
      </div>
    );
  }
}

// import React, { useEffect, useRef, useState } from "react";
// import "./index.scss";

// export type VenatusAdsComponentProps = {
//   adType: VenatusAdTypes;
// };

// type VenatusAdTypes =
//   | "LeaderboardATF"
//   | "LeaderboardBTF"
//   | "RichMedia"
//   | "Video";

// export const VenatusAdsComponent: React.FC<VenatusAdsComponentProps> = ({
//   adType,
// }) => {
//   const [width, setWidth] = useState<number>(window.innerWidth);
//   const adRef = useRef<HTMLDivElement>(null);

//   const handleWindowSizeChange = () => {
//     setWidth(window.innerWidth);
//   };

  // useEffect(() => {
  //   console.log("\n\n!  > MOUNT", adType);
  //   if (adType !== "Video") {
  //     (window as any).top.__vm_add = (window as any).top.__vm_add || [];
  //     (window as any).top.__vm_add.push(adRef.current);
  //     console.log("   > VM_ADD", adType, adRef.current);
  //   }

  //   window.addEventListener("resize", handleWindowSizeChange);

  //   return () => {
  //     console.log("\n\n!  > UNMOUNT", adType);

  //     if (adType === "RichMedia") {
  //       console.log("    > VM_REMOVE_CATEGORY", adType, adRef.current);
  //       (window as any).top.__vm_remove_category = ["richmedia_all"];
  //       return;
  //     } else if (adType !== "Video") {
  //       (window as any).top.__vm_remove = (window as any).top.__vm_remove || [];
  //       (window as any).top.__vm_remove.push(adRef.current);
  //       console.log("   > VM_REMOVE", adType, adRef.current);
  //     }

  //     window.removeEventListener("resize", handleWindowSizeChange);
  //   };
  // }, []);

//   const isMobile = width <= 800; // 768;
//   const mobileAdType: string = isMobile ? `Mobile${adType}` : adType;

//   const AD_TYPE_TO_ID: { [key: string]: string } = {
//     LeaderboardATF: "647dac63cf4d572f0c0f54f3",
//     LeaderboardBTF: "647dac76cf4d572f0c0f54f5",
//     MobileLeaderboardATF: "647dac8af97ba856bd4b7f5d",
//     MobileLeaderboardBTF: "647dac98cf4d572f0c0f54f7",
//     RichMedia: "647dacddcf4d572f0c0f54f9", // display: none; ??
//   };

//   const adID = AD_TYPE_TO_ID[mobileAdType] || AD_TYPE_TO_ID[adType];

//   const isHybridBanner =
//     mobileAdType === "MobileLeaderboardBTF" ||
//     mobileAdType === "LeaderboardATF";

//   return (
//     <div
//       className={`vm-container ${
//         adType === "RichMedia" || adType === "Video" ? "shrink-ad" : ""
//       }`}
//     >
//       <span className="ad-debug">
//         {AD_TYPE_TO_ID[mobileAdType] ? mobileAdType : adType} - {adID}
//       </span>
//       <div
//         ref={adRef}
//         className="vm-placement"
//         {...(adType === "Video"
//           ? {
//               id: "vm-av",
//               "data-format": "isvideo",
//             }
//           : {
//               "data-id": adID,
//               style: { display: adType === "RichMedia" ? "none" : "block" },
//               "data-display-type": isHybridBanner ? "hybrid-banner" : "",
//             })}
//       />
//     </div>
//   );
// };
