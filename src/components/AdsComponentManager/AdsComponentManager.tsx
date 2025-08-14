import { GoogleAdsComponent, GoogleAdsComponentProps } from "./GoogleAdsComponent";
import {
  PlaywireAdsComponent,
  PlaywireAdsComponentProps,
} from "./PlaywireAdsComponent/PlaywireAdsComponent";
import React, { useContext } from "react";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { PubliftAdsComponent } from "./PubliftAdsComponent";
import { SHOW_ADS } from "../../utils/maybeEnv";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { SnigelAdsComponent } from "./SnigelAdsComponent/SnigelAdsComponent";
import VenatusAdsComponent from "./VenatusAdsComponent/VenatusAdsComponent";
import { VenatusAdsComponentProps } from "./VenatusAdsComponent";

type AdsComponentManagerProps = VenatusAdsComponentProps &
  GoogleAdsComponentProps &
  PlaywireAdsComponentProps;

export const AdsComponentManager: React.FC<AdsComponentManagerProps> = (
  props
) => {
  const { profileObject } = useContext(SessionDataContext);
  const { adProvider, adsDisabled } = useContext(AdProviderContext);

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

  if (!SHOW_ADS || profileObject.isPatreon) {
    return <></>;
  }

  if (adProvider === "google" && props.dataAdSlot) {
    if (props.hideOnDesktop) return <></>; // dont even bother if its adsense tbh
    return <GoogleAdsComponent dataAdSlot={props.dataAdSlot} />;
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

  if (adProvider === "snigel") {
    return <SnigelAdsComponent adType={props.adType} />;
  }

  if (adProvider === "publift") {
    return <PubliftAdsComponent adType={props.adType} />;
  }

  return <></>;
};
