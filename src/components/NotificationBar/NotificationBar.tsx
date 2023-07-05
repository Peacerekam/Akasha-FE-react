// import axios from "axios";
import React, { useContext } from "react";
import { NotificationsContext } from "../../context/Notifications/NotificationsContext";
import "./style.scss";

// type AkashaNotification = {
//   color: string;
//   message: string;
// };

export const NotificationBar: React.FC = () => {
  // const [notification, setNotification] = useState<AkashaNotification>();
  // const [hide, setHide] = useState(false);

  // const getNotification = async (abortController: AbortController) => {
  //   const notificationURL = `/api/notifications/topbar`;
  //   const opts = { signal: abortController?.signal };

  //   const { data } = await axios.get(notificationURL, opts);
  //   if (!data) return;

  //   const lastMessage = localStorage.getItem("seenNotification");
  //   const shouldHide = lastMessage === data.message;

  //   setHide(shouldHide);
  //   setNotification(data);

  //   if (!shouldHide) return;
  //   localStorage.setItem("seenNotification", data.message);
  // };

  // const handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  //   event.preventDefault();
  //   setHide(true);
  //   if (notification?.message) {
  //     localStorage.setItem("seenNotification", notification?.message);
  //   }
  // };

  // useEffect(() => {
  //   const abortController = new AbortController();
  //   getNotification(abortController);
  //   return () => {
  //     abortController.abort();
  //   };
  // }, []);

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

  return (
    <div className={classNames} onClick={handleClose}>
      {/* {isLoading ? (
        <>
          <Spinner />
        </>
      ) : ( */}
      <>
        <span className="notification-text">{notification?.message}</span>
        <span className="close-notification">×</span>
      </>
      {/* )} */}
    </div>
  );
};
