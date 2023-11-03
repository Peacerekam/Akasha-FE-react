import React, { useContext } from "react";
import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { AdsComponent, AdsComponentProps } from "../AdsComponent";
import { VenatusAdsComponentProps } from "../VenatusAdsComponent";
import VenatusAdsComponent from "../VenatusAdsComponent/VenatusAdsComponent";
import PlaywireAdsComponent, {
  PlaywireAdsComponentProps,
} from "../PlaywireAdsComponent/PlaywireAdsComponent";
import { SHOW_ADS } from "../../utils/maybeEnv";

type AdsComponentManagerProps = VenatusAdsComponentProps &
  AdsComponentProps &
  PlaywireAdsComponentProps;

export const AdsComponentManager: React.FC<AdsComponentManagerProps> = (
  props
) => {
  const { profileObject } = useContext(SessionDataContext);
  const { adProvider, reloadAds, adsDisabled } = useContext(AdProviderContext);

  // console.log({
  //   adProvider,
  //   reloadAds,
  //   adsDisabled,
  //   profileObject,
  //   "return null?": (!showAds || reloadAds || adsDisabled || profileObject.isPatreon)
  // });

  if (profileObject.isPatreon || adsDisabled) {
    document.querySelector("body")?.classList.add("ads-disabled");
  } else {
    document.querySelector("body")?.classList.remove("ads-disabled");
  }

  if (!SHOW_ADS || reloadAds || adsDisabled || profileObject.isPatreon) {
    return <></>;
  }

  if (adProvider === "google" && props.dataAdSlot) {
    if (props.hideOnDesktop) return <></>; // dont even bother if its adsense tbh
    return <AdsComponent dataAdSlot={props.dataAdSlot} />;
  }

  if (adProvider === "venatus" && props.adType) {
    return (
      <VenatusAdsComponent
        adType={props.adType}
        hybrid={props.hybrid}
        hideOnDesktop={props.hideOnDesktop}
        hideOnMobile={props.hideOnMobile}
      />
    );
  }

  if (adProvider === "playwire") {
    return (
      <PlaywireAdsComponent
        adType={props.adType}
        hybrid={props.hybrid}
        hideOnDesktop={props.hideOnDesktop}
        hideOnMobile={props.hideOnMobile}
      />
    );
  }

  return <></>;
};
