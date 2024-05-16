import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LookupUID } from "../AccountsPage/LookupUID";
import { NewsDisplay } from "./NewsDisplay";
import { NotificationBar } from "../../components";
import React from "react";
import { StylizedContentBlock } from "../../components/StylizedContentBlock";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";

// import { useNavigate } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  // const navigate = useNavigate();
  // const pathname = window.location.pathname;

  const newsHeader = (
    <div className="news-header">
      <FontAwesomeIcon icon={faHashtag} size="1x" title="#akasha-news" />
      akasha-news
      <span className="ch-desc">
        <span className="ch-spacer">|</span>fetched via Discord
      </span>
    </div>
  );

  return (
    <div className="flex">
      <div className="content-block w-100" id="content-container">
        <NotificationBar />
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="relative">
          <LookupUID />
          
          <div className="block-highlight news-section">
            {newsHeader}
            <NewsDisplay />
          </div>
        </div>
      </div>
    </div>
  );
};
