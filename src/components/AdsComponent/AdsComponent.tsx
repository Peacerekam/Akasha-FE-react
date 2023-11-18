import "./index.scss";

import React, { useEffect } from "react";

import { IS_PRODUCATION } from "../../utils/maybeEnv";

export type AdsComponentProps = {
  dataAdSlot?: string;
};

export const AdsComponent: React.FC<AdsComponentProps> = ({ dataAdSlot }) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (e) {}
  }, []);

  const adStyle = {} as React.CSSProperties;

  if (!IS_PRODUCATION) {
    adStyle.boxShadow = "cyan 0px 0px 0 2px";
    adStyle.height = 280;
  }

  return (
    <>
      <ins
        className="adsbygoogle horizontal"
        style={adStyle}
        data-ad-client="ca-pub-2549208085698993"
        data-ad-slot={dataAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest={IS_PRODUCATION ? "off" : "on"}
      />
    </>
  );
};
