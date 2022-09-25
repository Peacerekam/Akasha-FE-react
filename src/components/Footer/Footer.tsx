import React from "react";
import PoweredByEnka from "../../assets/images/enka.png";
import "./style.scss";

export const Footer: React.FC = () => {
  return (
    <div className="footer">
      <span style={{ cursor: "default" }}>
        <span className="annotation">Work in progress</span>
        Akasha System
      </span>
      <span>
        <a target="_blank" href="https://enka.network/">
          <img src={PoweredByEnka} />
        </a>
      </span>
    </div>
  );
};
