import "./style.scss";

import { DISCORD_URL, PATREON_URL } from "../../utils/helpers";
import React, { useContext, useMemo, useState } from "react";
import { applyModalBodyStyle, getRelativeCoords } from "../CustomTable/Filters";
import { faBars, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faPatreon } from "@fortawesome/free-brands-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import AkashaLogo from "../../assets/images/favicon.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HamburgerMenu } from "./HamburgerMenu";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { LogInModal } from "./LogInModal";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { Spinner } from "../Spinner";

export type NavElement = {
  name: string;
  path?: string;
  icon?: JSX.Element;
  external?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

export const Navbar: React.FC = () => {
  const { screenWidth } = useContext(AdProviderContext);
  const { profileObject, isAuthenticated, isFetching } =
    useContext(SessionDataContext);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleModal = (event: React.MouseEvent<HTMLElement>) => {
    setShowLoginModal((prev) => !prev);

    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const handleToggleHamburger = () => {
    setShowHamburger((prev) => !prev);

    const _body = document.querySelector("body");
    _body?.classList.add("overflow-hidden");
  };

  // BrowserRouter
  // const { pathname } = window.location;

  // HashRouter
  // const hash = window.location.hash.replace("#", "");
  const { username, profilePicture } = profileObject;

  const NAVIGATION: NavElement[] = useMemo(
    () => [
      {
        name: "Profiles",
        path: "/profiles",
      },
      {
        name: "Artifacts",
        path: "/artifacts",
      },
      {
        name: "Builds",
        path: "/builds",
      },
      {
        name: "Leaderboards",
        path: "/leaderboards",
      },
      {
        name: "Settings",
        path: "/settings",
      },
      // {
      //   name: "FAQ",
      //   path: "/faq",
      // },
      {
        name: "spacer",
        path: "spacer",
      },
      {
        name: "language",
        path: "language",
      },
      {
        icon: <FontAwesomeIcon icon={faPatreon} size="1x" />,
        name: "Patreon",
        path: PATREON_URL,
        external: true,
      },
      {
        icon: <FontAwesomeIcon icon={faDiscord} size="1x" />,
        name: "Discord",
        path: DISCORD_URL,
        external: true,
      },
      isFetching
        ? { icon: <Spinner />, name: "", path: "" }
        : {
            icon: isAuthenticated ? (
              <img alt="avatar" className="navbar-img" src={profilePicture} />
            ) : (
              <FontAwesomeIcon icon={faRightFromBracket} size="1x" />
            ),
            name: isAuthenticated ? username ?? "..." : "Log in",
            onClick: handleToggleModal,
            path: "",
          },
    ],
    [profileObject, isAuthenticated, isFetching]
  );

  const displayNavElement = (nav: NavElement, i: number) => {
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
        }}
      >
        {nav.icon ? <>{nav.icon}</> : ""} {nav.name}
      </a>
    );
  };

  const getNavElement = (nav: NavElement, i: number) => {
    if (nav.name === "spacer") {
      return <div key={nav.name} className="navbar-spacer" />;
    }

    if (nav.name === "language") {
      return <LanguageSwitcher key={nav.name} />;
    }

    return displayNavElement(nav, i);
  };

  const desktopNav = (
    <>
      <a
        href="/"
        className="logo-wrapper"
        onClick={(event) => {
          event.preventDefault();
          navigate("/");
        }}
      >
        <span className="logo">
          <span className="annotation">Work in progress</span>
          <img alt="Akasha" src={AkashaLogo} className="tilted-logo" />
          <span className="logo-text">Akasha System</span>
        </span>
      </a>

      <LogInModal isOpen={showLoginModal} toggleModal={handleToggleModal} />

      {NAVIGATION.map((nav, i) => getNavElement(nav, i))}
    </>
  );

  const mobileNav = (
    <>
      <a
        href="/"
        className="logo-wrapper"
        onClick={(event) => {
          event.preventDefault();
          navigate("/");
        }}
      >
        <span className="logo">
          <span className="annotation">Work in progress</span>
          <img alt="Akasha" src={AkashaLogo} className="tilted-logo" />
          <span className="logo-text">Akasha System</span>
        </span>
      </a>

      <div className="navbar-spacer" />

      <LogInModal isOpen={showLoginModal} toggleModal={handleToggleModal} />
      <HamburgerMenu
        isOpen={showHamburger}
        toggleHamburger={handleToggleHamburger}
        navigation={NAVIGATION}
      />

      <a
        className="hamburger-wrapper"
        onClick={(event) => {
          event.preventDefault();
          handleToggleHamburger();
        }}
      >
        <FontAwesomeIcon
          className="hamburger-icon"
          icon={faBars}
          size="1x"
          title="Menu"
        />
      </a>
    </>
  );

  const isTablet = screenWidth < 1000;

  return <div className="navbar">{isTablet ? mobileNav : desktopNav}</div>;
};
