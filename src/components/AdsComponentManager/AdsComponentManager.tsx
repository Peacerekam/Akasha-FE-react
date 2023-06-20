import React, { useContext } from "react";
import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
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
  const { adProvider } = useContext(AdProviderContext);

  if (!showAds) {
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
      />
    );
  }

  return <></>;
};
