import "./style.scss";

import {
  AdsComponentManager,
  CalculationResultWidget,
  CalculationResultWidgetExpander,
  CompactArtifact,
  StylizedContentBlock,
} from "../../components";
import {
  Metric,
  SettingsContext,
} from "../../context/SettingsProvider/SettingsProvider";
import React, { useContext } from "react";
import {
  dummyArtifactResponseData,
  dummyCharacterResponseData,
} from "./dummyData";

import DomainBackground from "../../assets/images/Depths_of_Mt._Yougou_Concept_Art.webp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { cssJoin } from "../../utils/helpers";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export const SettingsPage: React.FC = () => {
  const { boundAccounts } = useContext(SessionDataContext);
  const { metric, setMetric, topDecimals, setTopDecimals, showcaseState } =
    useContext(SettingsContext);

  const uid = boundAccounts?.[0]?.uid || "700181030";
  const availableMetrics: Metric[] = ["RV", "CV"];
  const availableDecimals = [0, 1, 2, 3];

  const artifactRatingSetting = (
    <div className="settings-group">
      <div>
        <div>
          Artifact rating metric:{" "}
          <span className="current-value">{metric}</span>
        </div>
        <div className="opacity-5 smaller-font">
          This can also be toggled by clicking on RV/CV value in the top left
          corner of artifact display. Neither are perfect but using RV makes you
          cooler.
        </div>
      </div>
      <div className="flex rv-or-cv">
        {availableMetrics.map((label) => {
          const isSelected = metric === label;
          const isDefault = label === "RV";
          return (
            <div
              key={label}
              className={isSelected ? "" : "opacity-5 pointer"}
              onClick={() => setMetric(label)}
            >
              <div className="metric-name">
                {label}
                {isDefault && (
                  <span className="default opacity-5">(default)</span>
                )}
              </div>
              <div className="relative">
                {isSelected && <div className="selected-metric" />}
                <CompactArtifact
                  artifact={dummyArtifactResponseData}
                  row={dummyCharacterResponseData}
                  overrideMetric={label}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const rankingDecimalsSetting = (
    <div className="settings-group">
      <div>
        <div>
          Build ranking decimals:{" "}
          <span className="current-value">{topDecimals}</span>
        </div>
        <div className="opacity-5 smaller-font">
          For extra precision, but you shouldn't really care about this as it is
          for the very few leaderboard chasers.
        </div>
        <div style={{ marginTop: 20 }}>
          Profile showcase state:{" "}
          <span className="current-value">
            {/* {isShowcaseExpanded ? "expanded" : "folded"} */}
            <FontAwesomeIcon
              className={cssJoin([
                "chevron-down-icon pointer-events-none",
                showcaseState ? "rotate-180deg" : "",
              ])}
              icon={faChevronDown}
              size="1x"
            />
          </span>
        </div>
        <div className="opacity-5 smaller-font">
          Useful if you want to make a screenshot of all your ranks at once or
          if you find scrolling cringe.
        </div>
      </div>
      <div>
        <div className="pseudo-slider">
          {availableDecimals.map((num) => {
            const isSelected = num === topDecimals;
            const isDefault = num === 0;
            return (
              <div
                key={num}
                onClick={() => setTopDecimals(num)}
                className={isSelected ? "" : "pointer opacity-5"}
              >
                {isSelected && <div className="selected-decimals" />}
                {isDefault && (
                  <span className="default opacity-5">(default)</span>
                )}
                <div>{num}</div>
              </div>
            );
          })}
        </div>
        <div className="highlights-mock-up">
          <div className="w-100">
            <CalculationResultWidget
              uid={uid}
              noLinks
              expanded={showcaseState}
            />
          </div>
          <div className="relative w-100">
            <CalculationResultWidgetExpander style={{ top: 0 }} />
          </div>
        </div>
      </div>
      {/* @TODO: enable/disable hover previews */}
      {/* <div>
        disabled by default
      </div> */}
    </div>
  );

  return (
    <div className="flex">
      <div className="content-block w-100" id="content-container">
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="relative settings-page-content-wrapper">
          <AdsComponentManager adType="Video" />

          <div className="relative block-highlight">
            <div className="settings-page-header">
              <div className="settings-header">Settings</div>
              <p>
                All settings are stored locally in your browser's{" "}
                <b>local storage</b>.
              </p>
            </div>
            <div className="settings-page-body">
              {artifactRatingSetting}
              {rankingDecimalsSetting}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
