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
  const { pathname } = window.location;

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
          Akasha System
        </span>
      </a>

      {NAVIGATION.map((nav) => (
        <a
          key={nav.name}
          className={
            pathname !== "/" && pathname.startsWith(nav.path)
              ? "active-tab"
              : ""
          }
          href={nav.path}
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
