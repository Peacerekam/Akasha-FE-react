import React, { useEffect } from "react";
import "./index.scss";
import { isProduction } from "../../App";

type AdsComponentProps = {
  provider?: "google" | "ezoic";
  dataAdSlot?: string; // if google
  ezoicId?: string; // if ezoic
  sticky?: boolean;
};

export const AdsComponent: React.FC<AdsComponentProps> = ({
  dataAdSlot,
  provider = "google",
  ezoicId,
}) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (e) {}
  }, []);

  const adStyle = {} as React.CSSProperties;

  if (!isProduction) {
    adStyle.backgroundColor = "#2c3333";
    adStyle.height = 280;
  }

  const renderHorizontalAd = (className: string = "") => {
    return (
      <ins
        className={`ads-by-google ${className}`.trim()}
        style={adStyle}
        data-ad-client="ca-pub-2549208085698993"
        data-ad-slot={dataAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest={isProduction ? "off" : "on"}
      />
    );
  };

  const renderEzoicAd = () => {
    return (
      <div className="???" id={`ezoic-pub-ad-placeholder-${ezoicId}`}></div>
    );
  };

  if (provider === "google" && dataAdSlot) {
    return (
      <div className="ads-container horizontal">
        {renderHorizontalAd()}
        {/* @TODO: see if this is ok */}
        {renderHorizontalAd("hide-on-mobile")}
      </div>
    );
  }

  if (provider === "ezoic" && ezoicId) {
    return (
      <div className="ads-container horizontal">Ezoic{renderEzoicAd()}</div>
    );
  }

  const missingProps = [
    !dataAdSlot ? "'dataAdSlot'" : null,
    !ezoicId ? "'ezoicId'" : null,
  ]
    .filter((p) => p !== null)
    .join(" or ");

  return (
    <div className="ads-container horizontal">
      You must provide {missingProps}
    </div>
  );
};
