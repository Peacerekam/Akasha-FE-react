import "./style.scss";

import {
  AdsComponentManager,
  CalculationResultWidget,
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
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";

export const SettingsPage: React.FC = () => {
  const { boundAccounts } = useContext(SessionDataContext);
  const { metric, setMetric, topDecimals, setTopDecimals } =
    useContext(SettingsContext);

  const uid = boundAccounts?.[0]?.uid || "700181030";
  const availableMetrics: Metric[] = ["RV", "CV"];
  const availableDecimals = [0, 1, 2, 3];

  return (
    <div className="flex ">
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
              <div className="settings-group">
                <div>
                  <div>Artifact rating metric: {metric}</div>
                  <div className="opacity-5 smaller-font">
                    This can also be toggled by clicking on RV/CV value in the
                    top left corner of artifact display. Neither are perfect but
                    using RV makes you cooler.
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
              <div className="settings-group">
                <div>
                  <div>Build ranking decimals: {topDecimals}</div>
                  <div className="opacity-5 smaller-font">
                    For extra precision, but you shouldn't really care about
                    this as it is for the very few leaderboard chasers.
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
                    <CalculationResultWidget uid={uid} noLinks />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
