import "./style.scss";

import React, { useEffect, useState } from "react";

import { cssJoin } from "../../utils/helpers";

type TimerProps = {
  until: number;
  label?: string;
  onFinish?: () => void;
  removeStyling?: boolean;
};

export const Timer: React.FC<TimerProps> = ({
  until,
  label = "",
  onFinish,
  removeStyling = false,
}) => {
  const [timestamp, setTimestamp] = useState<number>(0);

  const getTimestamp = () => {
    const now = new Date().getTime();
    const then = until - now;
    return then;
  };

  useEffect(() => {
    // initial set
    setTimestamp(getTimestamp());

    // and every second afterwards
    const updateTimer = setInterval(() => {
      const _t = getTimestamp();
      setTimestamp(_t);
      if (_t < 0) {
        clearInterval(updateTimer);
        onFinish && onFinish();
      }
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [until, onFinish]);

  if (timestamp <= 0) {
    return null;
  }

  const getFormattedText = (then: number) => {
    const _3600k = 3_600_000;
    const _60k = 60_000;
    const hours = Math.floor(then / _3600k);
    const minutes = Math.floor((then - hours * _3600k) / _60k);
    const seconds = Math.floor((then - hours * _3600k - minutes * _60k) / 1000);
    const displayMins = `${minutes}`.padStart(2, "0");
    const displaySecs = `${seconds}`.padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${displayMins}:${displaySecs}`;
    }

    return `${minutes}:${displaySecs}`;
  };

  const value = getFormattedText(timestamp);

  const classNames = removeStyling
    ? ""
    : cssJoin([
        "refresh-timer",
        label ? "" : "no-label",
        value.length > 5 ? "has-hours" : "",
      ]);

  return (
    <span className={classNames}>
      {label && <span>{label}</span>} <span className="value">{value}</span>
    </span>
  );
};
