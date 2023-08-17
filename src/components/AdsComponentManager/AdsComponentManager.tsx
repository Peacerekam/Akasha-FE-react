import React, { useContext, useEffect } from "react";
import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { AdsComponent, AdsComponentProps } from "../AdsComponent";
import {
  // VenatusAdsComponent,
  VenatusAdsComponentProps,
} from "../VenatusAdsComponent";
import VenatusAdsComponent from "../VenatusAdsComponent/VenatusAdsComponent";
import { showAds } from "../../App";

type AdsComponentManagerProps = VenatusAdsComponentProps & AdsComponentProps;

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
    document.querySelector("body")?.classList.add("a-h-0");
  } else {
    document.querySelector("body")?.classList.remove("a-h-0");
  }

  if (!showAds || reloadAds || adsDisabled || profileObject.isPatreon) {
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

  return <></>;
};
