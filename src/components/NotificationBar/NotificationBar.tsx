import "./style.scss";

import React, { useContext } from "react";

import { NotificationsContext } from "../../context/Notifications/NotificationsContext";

export const NotificationBar: React.FC = () => {
  const {
    notification,
    hideNotification: hide,
    handleCloseNotification: handleClose,
  } = useContext(NotificationsContext);

  // const isHidden = hide || !notification;
  const isHidden = hide || !notification;
  // const isLoading = !notification && !isHidden;

  const classNames = [
    notification?.color ? `notification-color-${notification?.color}` : "",
    "notification-bar",
    isHidden ? "hide" : "reveal",
    // isLoading ? "is-loading" : ""
  ]
    .join(" ")
    .trim();

  const messageContent = notification?.message
    ?.split("\n")
    .map((x) => <div key={x}>{x}</div>);

  return (
    <div className={classNames} onClick={handleClose}>
      {/* {isLoading ? (
        <>
          <Spinner />
        </>
      ) : ( */}
      <div className="grid-inner">
        <span className="notification-text">{messageContent}</span>
        <span className="close-notification">×</span>
      </div>
      {/* )} */}
    </div>
  );
};
