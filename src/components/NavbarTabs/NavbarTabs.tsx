import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {LastProfilesContext} from "../../context/LastProfiles/LastProfilesContext";
import "./style.scss";

export const NavbarTabs: React.FC = () => {
  // @TODO: consider LocalStorage  for keeping tabs

  const { lastProfiles, nicknameMap, removeTab, updateLastProfiles } = useContext(LastProfilesContext);
  const navigate = useNavigate();

  // HashRouter
  const hash = window.location.hash.replace("#", "");
  const pathname = window.location.pathname;

  useEffect(() => {
    updateLastProfiles(hash)
  }, [hash]);

  return (
    <div className="navbar-tabs">
      {lastProfiles.map((uid) => {
        if (!nicknameMap[uid]) return null;
        return (
          <div
            key={`tab-${uid}-${nicknameMap[uid]}`}
            className={`navbar-tab ${hash.endsWith(uid) ? "active-tab" : ""}`}
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
