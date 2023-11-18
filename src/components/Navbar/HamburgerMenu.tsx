import { faStar, faX } from "@fortawesome/free-solid-svg-icons";
import { useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { NavElement } from "./Navbar";

type HamburgerMenuProps = {
  isOpen: boolean;
  toggleHamburger: () => void;
  navigation: NavElement[];
};

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  toggleHamburger,
  navigation,
}) => {
  const { lastProfiles } = useContext(LastProfilesContext);
  const navigate = useNavigate();
  const location = useLocation();

  const loginBtn = useMemo(
    () => navigation[navigation.length - 1],
    [navigation]
  );

  const languageBtn = {
    name: "language",
    path: "language",
  };

  const spacerIndex = useMemo(
    () => navigation.findIndex((x) => x.name === "spacer"),
    [navigation]
  );

  const socialsNav = useMemo(
    () => navigation.slice(spacerIndex + 2, navigation.length - 1),
    [spacerIndex, navigation]
  );

  const pageNav = useMemo(
    () => navigation.slice(0, spacerIndex),
    [spacerIndex, navigation]
  );

  if (!isOpen) return null;

  const handleCloseHamburger = (
    event: React.MouseEvent<HTMLElement>,
    allowChildren = false
  ) => {
    if (!allowChildren && event.target !== event.currentTarget) return;
    toggleHamburger();
    const _body = document.querySelector("body");
    _body?.classList.remove("overflow-hidden");
  };

  const closeDelay = 150;

  const displayNavElement = (
    nav: NavElement,
    i: number,
    delayClosing: boolean
  ) => {
    return (
      <a
        key={`${nav.name}-${i}`}
        className={
          // hash !== "/" && location.pathname === nav.path ? "active-tab" : ""
          location.pathname !== "/" && location.pathname === nav.path
            ? "active-tab"
            : ""
        }
        target={nav.external ? "_blank" : undefined}
        rel="noreferrer"
        href={nav.external ? nav.path : `${nav.path}`}
        onClick={(event) => {
          if (nav.external) return;
          event.preventDefault();
          if (nav.path) navigate(nav.path);
          if (nav.onClick) nav.onClick(event);

          // timeout to give user better visual of what happened
          const _event = { ...event };
          const ms = delayClosing ? closeDelay : 0;
          setTimeout(() => {
            handleCloseHamburger(_event);
          }, ms);
        }}
      >
        {nav.icon ? <>{nav.icon}</> : ""} {nav.name}
      </a>
    );
  };

  const getNavElement = (
    nav: NavElement,
    i: number,
    delayClosing: boolean = false
  ) => {
    if (nav.name === "spacer") {
      return <div key={nav.name} className="navbar-spacer" />;
    }

    if (nav.name === "language") {
      return <LanguageSwitcher key={nav.name} />;
    }

    return displayNavElement(nav, i, delayClosing);
  };

  return (
    <div
      className="modal-wrapper justify-flex-end"
      onClick={handleCloseHamburger}
    >
      <div className="hamburger">
        <div className="hamburger-header">
          <button
            className="close-btn"
            onClick={(event) => handleCloseHamburger(event, true)}
          >
            <FontAwesomeIcon className="filter-icon" icon={faX} size="1x" />
          </button>
        </div>
        <div className="hamburger-list">
          <div className="login-auth-nav">
            {getNavElement(loginBtn, 0)}
            {getNavElement(languageBtn, 0)}
          </div>

          <div className="navbar-spacer with-label" data-label="navigation" />

          <div className="page-nav">
            {pageNav.map((nav, i) => getNavElement(nav, i, true))}
          </div>

          <div className="navbar-spacer with-label" data-label="recently viewed" />

          <div className="player-tabs-nav">
            {lastProfiles.map((profile) => {
              const { uid, nickname, priority } = profile;
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
                  key={`hamburger-tab-${uid}-${nickname}`}
                  className={classNames}
                >
                  <a
                    href={`/profile/${uid}`}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(`/profile/${uid}`);

                      // timeout to give user better visual of what happened
                      const _event = { ...event };
                      setTimeout(() => {
                        handleCloseHamburger(_event);
                      }, closeDelay);
                    }}
                  >
                    {isFav && <FontAwesomeIcon icon={faStar} size="1x" />}
                    {nickname ?? uid}
                  </a>
                  {/* <span
                    className="close-tab"
                    onClick={(event) => {
                      event.preventDefault();
                      removeTab(uid);
                    }}
                  >
                    ×
                  </span> */}
                </div>
              );
            })}
          </div>

          <div className="navbar-spacer with-label" data-label="other" />

          <div className="login-auth-nav">
            {socialsNav.map((nav, i) => getNavElement(nav, i))}
          </div>
        </div>
      </div>
    </div>
  );
};
