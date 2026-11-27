import "./style.scss";

import { Link, useLocation } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { cssJoin } from "../../utils/helpers";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export const NavbarTabs: React.FC = () => {
  const [animationStagger, setAnimationStagger] = useState(75);
  const { lastProfiles, removeTab } = useContext(LastProfilesContext);
  const location = useLocation();

  useEffect(() => {
    if (lastProfiles.length > 0) setAnimationStagger(0);
  }, [location.pathname]);

  return (
    <div className="navbar-tabs" translate="no">
      {lastProfiles.map((profile, index) => {
        const { uid, nickname, priority, profilePictureLink } = profile;

        const style = {
          "--slideDelay": `${index * animationStagger}ms`,
        } as React.CSSProperties;

        const isFav = priority === 2;
        const pageUID = location.pathname.replace("/profile/", "");
        const isActive = pageUID.toLowerCase() === uid.toLowerCase();

        const classNames = cssJoin([
          "navbar-tab",
          isActive ? "active-tab" : "",
          isFav ? "is-favourited" : "",
        ]);

        const isEnkaProfile = isNaN(+uid);
        const isCombined = uid.startsWith("@");

        return (
          <div
            key={`tab-${uid}-${nickname}`}
            className={classNames}
            style={style}
          >
            <Link to={`/profile/${uid}`}>
              {profilePictureLink && <img alt="" src={profilePictureLink} />}
              {nickname ?? uid}
              {!isCombined && isEnkaProfile && (
                <span
                  className={`enka-profile-tab ${
                    !isEnkaProfile ? "" : ""
                  }`}
                  title={
                    isEnkaProfile ? "Enka.Network Profile" : "Akasha Profile"
                  }
                />
              )}
              {isCombined && (
                <>
                  <span
                    className={`enka-profile-tab akasha-icon`}
                    title="Akasha Profile"
                  />
                  <span
                    className={`enka-profile-tab`}
                    title="Enka.Network Profile"
                  />
                </>
              )}
              {isFav && <FontAwesomeIcon icon={faStar} size="1x" />}
              {/* {isCombined ? "[C]" : ""} */}
            </Link>
            {!isFav && (
              <span
                title="Close tab"
                className="close-tab"
                onClick={(event) => {
                  event.preventDefault();
                  removeTab(uid);
                }}
              >
                ×
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
