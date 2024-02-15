import "./style.scss";

import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export const NavbarTabs: React.FC = () => {
  const [animationStagger, setAnimationStagger] = useState(75);
  const { lastProfiles, removeTab } = useContext(LastProfilesContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (lastProfiles.length > 0) setAnimationStagger(0);
  }, [location.pathname]);

  return (
    <div className="navbar-tabs">
      {lastProfiles.map((profile, index) => {
        const { uid, nickname, priority } = profile;

        const style = {
          "--slideDelay": `${index * animationStagger}ms`,
        } as React.CSSProperties;

        const isFav = priority === 2;

        const classNames = [
          "navbar-tab",
          location.pathname.endsWith(uid) ? "active-tab" : "",
          isFav ? "is-favourited" : "",
        ]
          .join(" ")
          .trim();

        return (
          <div
            key={`tab-${uid}-${nickname}`}
            className={classNames}
            style={style}
          >
            <a
              href={`/profile/${uid}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${uid}`);
              }}
            >
              {isFav && <FontAwesomeIcon icon={faStar} size="1x" />}
              {nickname ?? uid}
            </a>
            {!isFav && (
              <span
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
