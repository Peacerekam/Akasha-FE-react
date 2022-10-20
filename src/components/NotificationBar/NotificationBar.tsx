import axios from "axios";
import React, { useEffect, useState } from "react";
import "./style.scss";

type Notification = {
  color: string;
  message: string;
};

export const NotificationBar: React.FC = () => {
  const [notification, setNotification] = useState<Notification>();
  const [hide, setHide] = useState(false);

  const getNotification = async () => {
    const notificationURL = `/api/notifications/topbar`;
    const { data } = await axios.get(notificationURL);
    if (data) {
      setNotification(data);
    }
  };

  useEffect(() => {
    getNotification();
  }, []);

  const isHidden = hide || !notification;
  const classNames = [
    notification?.color ? `notification-color-${notification?.color}` : "",
    "notification-bar",
    isHidden ? "hide" : "reveal",
  ]
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
      <span className="notification-text">{notification?.message}</span>
      <span className="close-notification">×</span>
    </div>
  );
};
