import "./style.scss";

import React, { useContext } from "react";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import AkashaLogo from "../../assets/images/favicon.svg";
import { Link } from "react-router-dom";
import PoweredByEnka from "../../assets/images/enka.png";

// import DomainBackground from "../../assets/images/Grand_Narukami_Shrine_Concept_Art.webp";
// import { StylizedContentBlock } from "../StylizedContentBlock";

export const Footer: React.FC = () => {
  const { adProvider } = useContext(AdProviderContext);

  const playwireBadge =
    adProvider === "playwire" ? (
      <div className="pw-badge">
        <a href="http://www.playwire.com" rel="noreferrer" target="_blank">
          <img
            src="https://www.playwire.com/hubfs/Powered-by-Playwire-Badges/Ads-Powered-by-playwire-2021-standalone-small-white-300px.png"
            alt="Playwire"
            width="150"
            loading="lazy"
            style={{
              width: 150,
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
            }}
          />
        </a>
        <a
          href="https://www.playwire.com/contact-direct-sales"
          rel="noreferrer"
          target="_blank"
        >
          Advertise on this site.
        </a>
      </div>
    ) : null;

  const snigelBadge =
    adProvider === "snigel" ? (
      <div className="cookies-badge">
        <a className="nn-cmp-show" href="?cmpscreen">
          Manage Cookie Settings
        </a>
      </div>
    ) : null;

  return (
    <div className="footer-wrapper">
      <div className="footer">
        {/* <StylizedContentBlock overrideImage={DomainBackground} /> */}
        <div className="footer-main">
          <span style={{ cursor: "default", paddingLeft: 30 }}>
            <img alt="Akasha" src={AkashaLogo} className="tilted-logo" />
            <span className="logo-text">
              Akasha System
              <span className="annotation">Genshin Leaderboards</span>
            </span>
          </span>
          <a target="_blank" rel="noreferrer" href="https://enka.network/">
            <img alt="Enka Network" src={PoweredByEnka} />
          </a>
          <Link to="/privacy-policy">Privacy Policy</Link>
          {playwireBadge}
          {snigelBadge}
        </div>
      </div>
    </div>
  );
};
