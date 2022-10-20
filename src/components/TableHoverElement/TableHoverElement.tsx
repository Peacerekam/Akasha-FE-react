import axios from "axios";
import React, { useEffect, useState } from "react";

import { Artifact } from "../Artifact";
import { FollowCursor } from "../FollowCursor";
import { StatList } from "../StatList";
import { ArtifactDetailsResponse } from "../../types/ArtifactDetailsResponse";

import "./style.scss";
import { FancyBuildBorder } from "../FancyBuildBorder";

type TableHoverElementProps = {
  row?: any;
  hide?: boolean;
  currentCategory?: string;
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
    const artDetailsURL = `/api/artifacts/${rowData._id}`;
    const { data } = await axios.get(artDetailsURL);
    setArtifactDetails((prev) => ({
      ...prev,
      [rowData._id]: data.data,
    }));
  };

  const isArtifact = !!rowData.mainStatKey;

  useEffect(() => {
    if (!isArtifact || artifactDetails?.[rowData._id]) return;
    getArtifactDetails();
  }, [rowData._id]);

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
      "row-hover-artifact-preview",
      hide ? "fade-out" : "fade-in",
    ].join(" ");

    const equippedOn = artifactDetails?.[rowData._id]?.builds;
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

  // @TODO: patreon
  const patreonObj = rowData?.owner?.patreon;

  return (
    <FollowCursor
      data={{
        offsetX: 170,
        offsetY: 165,
      }}
    >
      <FancyBuildBorder
        hide={hide ?? false}
        rowData={rowData}
        patreonObj={patreonObj}
      >
        <StatList
          row={rowData}
          currentCategory={currentCategory}
          showCharacter
          showWeapon
        />
      </FancyBuildBorder>
    </FollowCursor>
  );
};
