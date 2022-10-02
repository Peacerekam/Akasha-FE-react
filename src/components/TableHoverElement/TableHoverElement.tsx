import axios from "axios";
import React, { useEffect, useState } from "react";

import { BACKEND_URL, getCharacterCvColor } from "../../utils/helpers";
import { Artifact } from "../Artifact";
import { CritRatio } from "../CritRatio";
import { FollowCursor } from "../FollowCursor";
import { StatList } from "../StatList";
import { ArtifactDetailsResponse } from "../../types/ArtifactDetailsResponse";

import "./style.scss";

type TableHoverElementProps = {
  row?: any;
  hide?: boolean;
  currentCategory: string;
};

export const TableHoverElement: React.FC<TableHoverElementProps> = ({
  row,
  hide,
  currentCategory,
}) => {
  const [hiddenTimer, setHiddenTimer] = useState<any>();
  const [hidden, setHidden] = useState<boolean>(false);
  const [rowData, setRowData] = useState<any>({});
  const [artifactDetails, setArtifactDetails] = useState<{
    [id: string]: ArtifactDetailsResponse;
  }>({});

  const getArtifactDetails = async () => {
    const artDetailsURL = `${BACKEND_URL}/api/artifact/${rowData.md5}`;
    const { data } = await axios.get(artDetailsURL);
    setArtifactDetails((prev) => ({
      ...prev,
      [rowData.md5]: data.data,
    }));
  };

  const isArtifact = !!rowData.mainStatKey;

  useEffect(() => {
    if (!isArtifact || artifactDetails?.[rowData.md5]) return;
    getArtifactDetails();
  }, [rowData.md5]);

  useEffect(() => {
    if (!row) return;
    setRowData(row);
  }, [row]);

  useEffect(() => {
    if (hiddenTimer) {
      clearTimeout(hiddenTimer);
    }
    if (hide) {
      const timer = setTimeout(() => setHidden(hide ?? false), 400);
      setHiddenTimer(timer);
    } else {
      setHidden(false);
    }
  }, [hide]);

  if (hidden) return null;

  if (isArtifact) {
    const wrapperClassNames = [hide ? "fade-out" : "fade-in"].join(" ").trim();

    const equippedOn = artifactDetails?.[rowData.md5]?.builds;
    return (
      <FollowCursor
        data={{
          offsetX: 135,
          offsetY: 150,
        }}
      >
        <div className={wrapperClassNames}>
          <Artifact artifact={rowData} width={250} equipped={equippedOn} />
        </div>
      </FollowCursor>
    );
  }

  const cv = rowData?.critValue || 0;
  const style = {
    "--name-card-url": `url(${rowData?.nameCardLink})`,
    border: `2px solid ${getCharacterCvColor(cv)}`,
  } as React.CSSProperties;

  const wrapperClassNames = [
    "row-hover-build-preview",
    hide ? "fade-out" : "fade-in",
  ]
    .join(" ")
    .trim();

  return (
    <FollowCursor
      data={{
        offsetX: 170,
        offsetY: 165,
      }}
    >
      <div className="flex">
        <div style={style} className={wrapperClassNames}>
          {/* some wrapper with nice bg i guess */}
          <div className="above-darken">
            <StatList
              row={rowData}
              currentCategory={currentCategory}
              showCharacter
              showWeapon
            />
          </div>
          <div className="darken" />
          {/* <div>
              Calculation result:{" "}
              {currentCategory &&
                row.calculations[currentCategory].result.toFixed(0)}
            </div> */}
        </div>
      </div>
    </FollowCursor>
  );
};
