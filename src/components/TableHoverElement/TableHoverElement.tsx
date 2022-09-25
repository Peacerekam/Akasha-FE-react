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
  listingType?: "table" | "custom";
};

export const TableHoverElement = ({
  row,
  hide,
  currentCategory,
  listingType = "table",
}: TableHoverElementProps) => {
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
    const wrapperClassNames = [
      hide ? "fade-out" : "fade-in",
      listingType === "custom" ? "flex hover-preview-for-artifact-table" : "",
    ].join(" ").trim();

    if (listingType === "custom") {
      const buildsList = artifactDetails?.[rowData.md5]?.builds.map((build) => {
        const cv = build?.critValue || 0;
        const style = {
          borderRadius: 50,
          width: 35,
          boxShadow: `0 0 0 2px ${getCharacterCvColor(cv)}`,
        } as React.CSSProperties;

        return (
          <div
            className="flex gap-10"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <img style={style} src={build.icon} />
            <CritRatio stats={build.stats} overrideCV={build.critValue} />
          </div>
        );
      });

      return (
        <FollowCursor
          data={{
            offsetX: 125,
            offsetY:
              (buildsList?.length ?? 0) * 20 +
              15 +
              (rowData.adventureRank ? 15 : 0),
          }}
        >
          <div className={wrapperClassNames}>
            {/* <Artifact artifact={rowData} width={270} /> */}
            <div className="data-listing">
              {rowData.adventureRank && (
                <div className="flex">
                  <div
                    className={`ar-badge ar-${
                      Math.floor(rowData.adventureRank / 5) * 5
                    }-badge`}
                  >
                    AR{rowData.adventureRank}
                  </div>{" "}
                  {rowData.nickname}
                </div>
              )}
              <div>
                <div className="flex gap-10">
                  {buildsList
                    ? buildsList.length > 0
                      ? buildsList
                      : "Not equipped"
                    : "Loading..."}
                </div>
                {/* <div>artifact overview?</div>
                  <div>artifact rankings results?</div>
                  <div>achievements</div>
                  <div>profile overview</div> */}
              </div>
            </div>
          </div>
        </FollowCursor>
      );
    } else {
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
  }

  if (listingType === "custom") {
    const wrapperClassNames = ["fade-in", hide ? "fade-out" : ""].join(" ").trim();

    return (
      <FollowCursor
        data={{
          offsetX: 130,
          offsetY: 40,
        }}
      >
        <div className={wrapperClassNames}>
          aaaaaaaaaaaaaaaaaa {rowData?.nickname} - {rowData?.uid}
        </div>
      </FollowCursor>
    );
  } else {
    const cv = rowData?.critValue || 0;
    const style = {
      "--name-card-url": `url(${rowData?.nameCardLink})`,
      border: `2px solid ${getCharacterCvColor(cv)}`,
    } as React.CSSProperties;

    const wrapperClassNames = [
      "row-hover-build-preview",
      hide ? "fade-out" : "fade-in",
    ].join(" ").trim();
    
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
  }
};
