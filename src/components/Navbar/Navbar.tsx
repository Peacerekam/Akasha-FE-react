import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faPatreon } from "@fortawesome/free-brands-svg-icons";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DISCORD_URL, PATREON_URL } from "../../utils/helpers";
import "./style.scss";

const NAVIGATION = [
  // {
  //   name: "Users",
  //   path: "/users",
  // },
  {
    /* this should be saved from discord auth */
    name: "Profiles",
    path: "/profile",
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
  // {
  //   name: "Discord Auth",
  //   path: "/auth",
  // },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // console.log(location)
  // BrowserRouter
  // const { pathname } = window.location;

  // HashRouter
  const hash = window.location.hash.replace("#", "");
  const pathname = window.location.pathname;

  return (
    <div className="navbar">
      <a
        href={`${pathname}#`}
        className="logo-wrapper"
        onClick={(event) => {
          event.preventDefault();
          navigate("/");
        }}
      >
        <span className="logo">
          <span className="annotation">Work in progress</span>
          Akasha System
        </span>
      </a>

      {NAVIGATION.map((nav, i) =>
        nav.name === "spacer" ? (
          <div key={nav.name} className="navbar-spacer" />
        ) : (
          <a
            key={`${nav.name}-${i}`}
            className={
              hash !== "/" && location.pathname === nav.path ? "active-tab" : ""
            }
            target={nav.external ? "_blank" : undefined}
            rel="noreferrer"
            href={nav.external ? nav.path : `${pathname}#${nav.path}`}
            onClick={(event) => {
              if (nav.external) return;
              event.preventDefault();
              navigate(nav.path);
            }}
          >
            {nav.icon ? <span>{nav.icon}</span> : ""} {nav.name}
          </a>
        )
      )}
    </div>
  );
};
