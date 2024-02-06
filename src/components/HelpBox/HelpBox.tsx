import "./style.scss";

import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { helpContentAccounts } from "./helpContentAccounts";
import { helpContentArtifacts } from "./helpContentArtifacts";
import { helpContentBuilds } from "./helpContentBuilds";
import { helpContentLeaderboards } from "./helpContentLeaderboards";

type HelpBoxProps = {
  page: "builds" | "leaderboards" | "artifacts" | "accounts";
};

const helpBoxContents = {
  builds: helpContentBuilds,
  leaderboards: helpContentLeaderboards,
  artifacts: helpContentArtifacts,
  accounts: helpContentAccounts,
};

export const HelpBox: React.FC<HelpBoxProps> = ({ page }) => {
  const [isClosed, setIsClosed] = useState(false);

  const lsKey = "helpBox";

  // read from local storage
  useEffect(() => {
    // const obj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
    // setIsClosed(!!obj[page]);

    setIsClosed(false);
  }, []);

  // save to local storage
  useEffect(() => {
    const oldObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
    const newObj = { ...oldObj, [page]: isClosed };
    localStorage.setItem(lsKey, JSON.stringify(newObj));
  }, [isClosed]);

  const handleToggleHelpBox = () => setIsClosed((prev) => !prev);

  const content = helpBoxContents[page];

  if (isClosed) {
    return (
      <div className="relative no-paddings">
        <div
          className="help-box-btn help-box-floating-button"
          onClick={handleToggleHelpBox}
          title="Show help"
        >
          <FontAwesomeIcon icon={faQuestionCircle} size="1x" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative block-highlight page-description-wrapper">
      {/* <div
        className="help-box-btn close-help-box"
        onClick={handleToggleHelpBox}
        title="Close"
      >
        <FontAwesomeIcon icon={faX} size="1x" />
      </div> */}
      <div className={isClosed ? "hide-help-box" : "open-help-box"}>
        {content}
      </div>
    </div>
  );
  // <FontAwesomeIcon icon={faCheck} size="1x" />
};
