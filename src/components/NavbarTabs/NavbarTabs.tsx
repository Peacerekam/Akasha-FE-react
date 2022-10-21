import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import "./style.scss";

export const NavbarTabs: React.FC = () => {
  const [animationStagger, setAnimationStagger] = useState(200);
  const { lastProfiles, removeTab } = useContext(LastProfilesContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (lastProfiles.length > 0) setAnimationStagger(0);
  }, [location.pathname]);

  return (
    <div className="navbar-tabs">
      {lastProfiles.map((profile, index) => {
        const { uid, nickname } = profile;

        const style = {
          "--slideDelay": `${index * animationStagger}ms`,
        } as React.CSSProperties;

        return (
          <div
            key={`tab-${uid}-${nickname}`}
            className={`navbar-tab ${
              location.pathname.endsWith(uid) ? "active-tab" : ""
            }`}
            style={style}
          >
            <a
              href={`${window.location.pathname}#/profile/${uid}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${uid}`);
              }}
            >
              {nickname ?? uid}
            </a>
            <span
              className="close-tab"
              onClick={(event) => {
                event.preventDefault();
                removeTab(uid);
              }}
            >
              ×
            </span>
          </div>
        );
      })}
    </div>
  );
};
