import React, { useContext, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faPatreon } from "@fortawesome/free-brands-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { DISCORD_URL, PATREON_URL } from "../../utils/helpers";
import { applyModalBodyStyle, getRelativeCoords } from "../CustomTable/Filters";
import { LogInModal } from "./LogInModal";
import "./style.scss";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { Spinner } from "../Spinner";
import AkashaLogo from "../../assets/images/favicon.svg";

type NavElement = {
  name: string;
  path?: string;
  icon?: JSX.Element;
  external?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

export const Navbar: React.FC = () => {
  const { profileObject, isAuthenticated, isFetching } =
    useContext(SessionDataContext);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleModal = (event: React.MouseEvent<HTMLElement>) => {
    setShowLoginModal((prev) => !prev);

    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
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
      // {
      //   name: "FAQ",
      //   path: "/faq",
      // },
      {
        name: "spacer",
        path: "spacer",
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
              <img className="navbar-img" src={profilePicture} />
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

  return (
    <div className="navbar">
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
          <img src={AkashaLogo} className="tilted-logo" />
          <span className="logo-text">Akasha System</span>
        </span>
      </a>

      <LogInModal isOpen={showLoginModal} toggleModal={handleToggleModal} />

      {NAVIGATION.map((nav, i) =>
        nav.name === "spacer" ? (
          <div key={nav.name} className="navbar-spacer" />
        ) : (
          displayNavElement(nav, i)
        )
      )}
    </div>
  );
};
