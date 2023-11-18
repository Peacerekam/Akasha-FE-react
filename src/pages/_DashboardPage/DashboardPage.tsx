import "./style.scss"

import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import React from "react";
import { StylizedContentBlock } from "../../components/StylizedContentBlock";

// import { useNavigate } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  // const navigate = useNavigate();
  // const pathname = window.location.pathname;

  return (
    <div className="flex">
      <div className="content-block w-100" id="content-container">
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="relative">
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr" }}>
            <div
              style={{
                gridColumn: 1,
                gridRow: "1 / 3",
                backgroundColor: "rgba(255,0,0, 0.1)",
                padding: 10,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <span style={{ opacity: 0.8 }}>Welcome to </span>
                <span style={{ fontFamily: "GenshinFont" }}>
                  {" "}
                  Akasha System
                </span>
              </div>
              <div>Don't mind this page for now</div>
              <div>Currently tracking XXXXX builds from YYYY players</div>
              <div>
                some auto scroll/paning shot with highlighted builds or best
                builds from each category
              </div>
              <div>
                some auto scroll/paning shot with average builds in top 50
              </div>
              <div>graphs/plots</div>
            </div>
            <div
              style={{
                gridColumn: "1 / 3",
                gridRow: "3 / 4",
                backgroundColor: "rgba(255,0,255, 0.1)",
                padding: 10,
              }}
            >
              bbb
            </div>
            <div
              style={{
                gridColumn: 2,
                backgroundColor: "rgba(0,255,0, 0.1)",
                padding: 10,
                minWidth: 200,
              }}
            >
              <div>Last visited</div>
              <div>-</div>
              <div>-</div>
              <div>-</div>
            </div>
            <div
              style={{
                gridColumn: 2,
                backgroundColor: "rgba(255,255,0, 0.1)",
                padding: 10,
                minWidth: 200,
              }}
            >
              <div>Last added</div>
              <div>-</div>
              <div>-</div>
              <div>-</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
