import "./style.scss";

import React, { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

import { Artifact } from "../Artifact";
import { ArtifactDetailsResponse } from "../../types/ArtifactDetailsResponse";
import { FancyBuildBorder } from "../FancyBuildBorder";
import { FollowCursor } from "../FollowCursor";
import { GenshinUserCard } from "../GenshinUserCard";
import { StatList } from "../StatList";
import { cssJoin } from "../../utils/helpers";
import { useParams } from "react-router-dom";

type TableHoverElementProps = {
  row?: any;
  hide?: boolean;
  strikethrough?: boolean;
};

export const TableHoverElement: React.FC<TableHoverElementProps> = ({
  row,
  hide,
  strikethrough = false,
}) => {
  const [hiddenTimer, setHiddenTimer] = useState<any>();
  const [hidden, setHidden] = useState<boolean>(false);
  const [rowData, setRowData] = useState<any>({});
  const [artifactDetails, setArtifactDetails] = useState<{
    [id: string]: ArtifactDetailsResponse;
  }>({});

  const { uid } = useParams();
  const isCombined = uid?.startsWith("@");

  const getArtifactDetails = async () => {
    const md5 = isCombined ? rowData.universal_md5 || rowData._id : rowData._id;
    const artDetailsURL = `/api/artifacts/${md5}`;

    const opts: AxiosRequestConfig<any> = {};
    if (isCombined) opts.params = { queryVariant: "isCombined" };

    const { data } = await axios.get(artDetailsURL, opts);
    setArtifactDetails((prev) => ({
      ...prev,
      [rowData._id]: data.data,
    }));
  };

  const isArtifact = !!rowData.mainStatKey;
  const isAccount = !!rowData.playerInfo;

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
    const wrapperClassNames = cssJoin([
      "hover-element row-hover-artifact-preview",
      hide ? "fade-out" : "fade-in",
    ]);

    const equippedOn = artifactDetails?.[rowData._id]?.builds;
    return (
      <FollowCursor
        data={{
          offsetX: 150,
          offsetY: 165,
        }}
      >
        <div className={wrapperClassNames}>
          <Artifact artifact={rowData} width={275} equipped={equippedOn} />
        </div>
      </FollowCursor>
    );
  }

  if (isAccount) {
    const roundedAR = Math.round(rowData?.playerInfo?.level || 0);

    const borderColorClass = roundedAR
      ? `ar-${Math.floor(roundedAR / 5) * 5}-badge`
      : "ar-60-badge";

    const wrapperClassNames = cssJoin([
      "hover-element row-hover-artifact-preview account-hover-wrapper",
      hide ? "fade-out" : "fade-in",
      borderColorClass,
    ]);

    return (
      <FollowCursor
        data={{
          offsetX: 230,
          offsetY: 50,
        }}
      >
        <div className={wrapperClassNames}>
          <GenshinUserCard
            accountData={{ account: rowData }}
            isAccountOwner
            showBackgroundImage
          />
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
          // currentCategory={currentCategory}
          strikethrough={strikethrough}
          showCharacter
          showWeapon
        />
      </FancyBuildBorder>
    </FollowCursor>
  );
};
