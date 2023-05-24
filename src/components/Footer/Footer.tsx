import React from "react";
import { Link } from "react-router-dom";
import PoweredByEnka from "../../assets/images/enka.png";
import AkashaLogo from "../../assets/images/favicon.svg";
import "./style.scss";

export const Footer: React.FC = () => {
  return (
    <div className="footer">
      <div className="footer-main">
        <span style={{ cursor: "default", paddingLeft: 30 }}>
          <span className="annotation">Work in progress</span>
          <img src={AkashaLogo} className="tilted-logo" />
          <span className="logo-text">Akasha System</span>
        </span>
        <a target="_blank" rel="noreferrer" href="https://enka.network/">
          <img src={PoweredByEnka} />
        </a>
        <Link to="/privacy-policy">Privacy Policy</Link>
      </div>
    </div>
  );
};
