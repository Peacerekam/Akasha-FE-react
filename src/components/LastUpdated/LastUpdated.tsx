import "./style.scss";

import React, { useCallback, useContext, useEffect, useState } from "react";

import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";

type LastUpdatedProps = {
  lastProfileUpdate?: number;
  label?: string;
  format?: "rawText" | "fancy";
};

export const LastUpdated: React.FC<LastUpdatedProps> = ({
  lastProfileUpdate,
  label,
  format = "fancy",
}) => {
  const [timestamp, setTimestamp] = useState<any[]>([0, ""]);
  const { language } = useContext(TranslationContext);

  const getLastProfileUpdate = useCallback(() => {
    if (!lastProfileUpdate) return [0, []];
    const now = new Date().getTime();
    const then = Math.abs(lastProfileUpdate - now);

    const secondsCount = +(then / 1000).toFixed(0);
    const minutesCount = +(secondsCount / 60).toFixed(0);
    const hoursCount = +(minutesCount / 60).toFixed(0);
    const daysCount = +(hoursCount / 24).toFixed(0);

    const rtf1 = new Intl.RelativeTimeFormat(language, { style: "long" });

    const getRtf = (num: number, type: Intl.RelativeTimeFormatUnit) => {
      const str = rtf1
        .format(-num, type)
        .replace(num.toString(), "<NUMBER>")
        .split(" ");
      return [num, str];
    };

    const oneMinute = 1000 * 60;
    if (then < oneMinute) {
      return getRtf(secondsCount, "second");
      // const _s = secondsCount > 1 ? "s" : "";
      // return [secondsCount, `second${_s} ago`];
    }

    const oneHour = oneMinute * 60;
    if (then < oneHour) {
      return getRtf(minutesCount, "minute");
      // const _s = minutesCount > 1 ? "s" : "";
      // return [minutesCount, `minute${_s} ago`];
    }

    const oneDay = oneHour * 24;
    if (then < oneDay) {
      return getRtf(hoursCount, "hour");
      // const _s = hoursCount > 1 ? "s" : "";
      // return [hoursCount, `hour${_s} ago`];
    }

    return getRtf(daysCount, "day");
    // const _s = daysCount > 1 ? "s" : "";
    // return [daysCount, `day${_s} ago`];
  }, [lastProfileUpdate, language]);

  useEffect(() => {
    // initial set
    setTimestamp(getLastProfileUpdate());

    // and every second afterwards
    const updateTimer = setInterval(() => {
      const _t = getLastProfileUpdate();
      setTimestamp(_t);
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [lastProfileUpdate, language]);

  if (!timestamp[0]) return null;

  const isRawText = format === "rawText";

  return (
    <span
      className={isRawText ? "last-profile-update-raw" : "last-profile-update"}
    >
      {isRawText ? "" : <span>{label}</span>}
      {timestamp[1].map((chunk: string) => {
        const arr = chunk.split("<NUMBER>");
        const isGlued = arr.length > 1 && !!arr[1];

        return (
          <React.Fragment key={chunk}>
            {arr.map((word, index) => {
              const value = word || timestamp[0]; // empty string will default to timestamp[0]
              const isNumber = !word; // numbers show up as empty string
              const removeMargin = isRawText && isGlued && isNumber;

              if (index > 0 && isNumber) return; // do not render non-glued numbers twice

              const classNames = [
                removeMargin ? "no-margin" : "",
                !isRawText && isNumber ? "value" : "",
              ]
                .join(" ")
                .trim();

              return (
                <span className={classNames} key={value}>
                  {value}
                </span>
              );
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};
