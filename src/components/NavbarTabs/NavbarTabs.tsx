import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import "./style.scss";

export const NavbarTabs: React.FC = () => {
  const [animationStagger, setAnimationStagger] = useState(200);
  const { lastProfiles, nicknameMap, removeTab, updateLastProfiles } =
    useContext(LastProfilesContext);
  const navigate = useNavigate();

  // HashRouter
  const hash = window.location.hash.replace("#", "");
  const pathname = window.location.pathname;

  useEffect(() => {
    updateLastProfiles(hash);
    if (lastProfiles.length > 0) setAnimationStagger(0);
  }, [hash]);

  return (
    <div className="navbar-tabs">
      {lastProfiles.map((uid, index) => {
        if (!nicknameMap[uid]) return null;

        const style = {
          "--slideDelay": `${index * animationStagger}ms`,
        } as React.CSSProperties;

        return (
          <div
            key={`tab-${uid}-${nicknameMap[uid]}`}
            className={`navbar-tab ${hash.endsWith(uid) ? "active-tab" : ""}`}
            style={style}
          >
            <a
              href={`${pathname}#/profile/${uid}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${uid}`);
              }}
            >
              {nicknameMap[uid] ?? uid}
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
