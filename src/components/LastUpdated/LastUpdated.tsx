import "./style.scss";

import React, { useEffect, useState } from "react";

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
  const [timestamp, setTimestamp] = useState<(string | number)[]>([0, ""]);

  const getLastProfileUpdate = () => {
    if (!lastProfileUpdate) return [0, ""];
    const now = new Date().getTime();
    const then = Math.abs(lastProfileUpdate - now);

    const secondsCount = +(then / 1000).toFixed(0);
    const minutesCount = +(secondsCount / 60).toFixed(0);
    const hoursCount = +(minutesCount / 60).toFixed(0);
    const daysCount = +(hoursCount / 24).toFixed(0);

    const oneMinute = 1000 * 60;
    if (then < oneMinute) {
      const _s = secondsCount > 1 ? "s" : "";
      return [secondsCount, `second${_s} ago`];
    }

    const oneHour = oneMinute * 60;
    if (then < oneHour) {
      const _s = minutesCount > 1 ? "s" : "";
      return [minutesCount, `minute${_s} ago`];
    }

    const oneDay = oneHour * 24;
    if (then < oneDay) {
      const _s = hoursCount > 1 ? "s" : "";
      return [hoursCount, `hour${_s} ago`];
    }

    const _s = daysCount > 1 ? "s" : "";

    return [daysCount, `day${_s} ago`];
  };

  useEffect(() => {
    // initial set
    setTimestamp(getLastProfileUpdate());

    // and every second afterwards
    const updateTimer = setInterval(() => {
      const _t = getLastProfileUpdate();
      setTimestamp(_t);
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [lastProfileUpdate]);

  if (!timestamp[0]) return null;

  if (format === "rawText") {
    const text = [label, ...timestamp].join(" ");
    return <span className="white-space-nowrap">{text}</span>;
  }

  return (
    <span className="last-profile-update">
      <span>{label}</span> <span className="value">{timestamp[0]}</span>
      <span>{timestamp[1]}</span>
    </span>
  );
};
