import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.scss";

const NAVIGATION = [
  {
    name: "Users",
    path: "/users",
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
    /* this should be saved from discord auth */
    name: "My Profile",
    path: "/profile/701464050",
  },
  {
    name: "Discord Auth",
    path: "/auth",
  },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  // BrowserRouter
  // const { pathname } = window.location;
  
  // HashRouter
  const hash = window.location.hash.replace('#','');
  const pathname = window.location.pathname.slice(1,window.location.pathname.length-1);

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

      {NAVIGATION.map((nav) => (
        <a
          key={nav.name}
          className={
            hash !== "/" && hash.startsWith(nav.path)
              ? "active-tab"
              : ""
          }
          href={`${pathname}#${nav.path}`}
          onClick={(event) => {
            event.preventDefault();
            navigate(nav.path);
          }}
        >
          {nav.name}
        </a>
      ))}
    </div>
  );
};