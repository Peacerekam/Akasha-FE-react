import "./style.scss";

import React, { useEffect, useState } from "react";

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
    const minutes = Math.floor(then / 60000);
    const seconds = Math.floor((then - minutes * 60000) / 1000);
    const displaySecs = `${seconds}`.padStart(2, "0");
    const timeLeft = `${minutes}:${displaySecs}`;
    return timeLeft;
  };

  const classNames = removeStyling
    ? ""
    : ["refresh-timer", label ? "" : "no-label"].join(" ").trim();

  return (
    <span className={classNames}>
      {label && <span>{label}</span>} <span className="value">{getFormattedText(timestamp)}</span>
    </span>
  );
};
