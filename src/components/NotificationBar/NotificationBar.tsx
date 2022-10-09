import axios from "axios";
import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "../../utils/helpers";
import "./style.scss";

export const NotificationBar: React.FC = () => {
  const [notificationText, setNotificationText] = useState<string>();
  const [hide, setHide] = useState(false);

  const getNotificationText = async () => {
    const notificationURL = `${BACKEND_URL}/api/getNotificationText`;
    const { data } = await axios.get(notificationURL);
    if (data?.message) {
      setNotificationText(data.message);
    }
  };

  useEffect(() => {
    getNotificationText();
  }, []);

  const isHidden = hide || !notificationText;
  const classNames = ["notification-bar", isHidden ? "hide" : "reveal"]
    .join(" ")
    .trim();

  return (
    <div
      className={classNames}
      onClick={(event) => {
        event.preventDefault();
        setHide(true);
      }}
    >
      <span className="notification-text">{notificationText}</span>
      <span className="close-notification">×</span>
    </div>
  );
};
