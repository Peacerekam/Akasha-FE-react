import "./style.scss";

import React, { useContext, useEffect, useMemo, useState } from "react";

import { AkashaProfile } from "./PageTypes/AkashaProfile";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { HoyolabProfile } from "./PageTypes/HoyolabProfile";
import { ProfileSelector } from "../../components/ProfileSelector";
import { StylizedContentBlock } from "../../components";
import { cssJoin } from "../../utils/helpers";
import { useParams } from "react-router-dom";

type TitleAndDescription = {
  title: string;
  description: string;
};

export type ResponseData = {
  account: any;
  bosses?: any;
  inventory?: any;
  error?: TitleAndDescription;
};

export const ProfilePage: React.FC = () => {
  const [relevantProfiles, setRelevantProfiles] = useState<any[]>([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);
  const [responseData, setResponseData] = useState<ResponseData>({
    account: null,
    bosses: null,
    inventory: null,
  });

  const [enkaErrorMessage, setEnkaErrorMessage] = useState<JSX.Element>();
  const [bindMessage, setBindMessage] = useState<JSX.Element>();

  const { uid } = useParams();
  const { hoverElement } = useContext(HoverElementContext);

  const isHoyolab = uid?.startsWith("!");

  const cssVariables = {
    "--name-card-url": `url(${
      isHoyolab
        ? responseData?.account?.hoyolab?.bg_url
        : responseData?.account?.nameCardLink
    })`,
  } as React.CSSProperties;

  const hideSelector = useMemo(() => {
    const profilesWithBuilds = relevantProfiles.filter((profile) => {
      const _count = profile.buildsCount || 0;
      return _count > 0;
    });

    return profilesWithBuilds.length < 3;
  }, [uid, relevantProfiles]);

  useEffect(() => {
    setEnkaErrorMessage(undefined);
    setBindMessage(undefined);
    setIsFetchingProfiles(false);
    setResponseData({ account: null });
  }, [uid]);

  if (responseData.error) {
    return (
      <div className="error-msg">
        <div className="error-title">{responseData.error.title}</div>
        <div className="error-desc">
          {responseData.error.description
            .split(".")
            .filter((d) => d)
            .map((block) => (
              <div key={block}>{block}</div>
            ))}
        </div>
      </div>
    );
  }

  const contentBlockClassNames = cssJoin([
    "content-block w-100",
    responseData.account?.patreon?.active ? "patreon-profile" : "",
  ]);

  const profilePageProps = {
    setEnkaErrorMessage,
    setBindMessage,
    setRelevantProfiles,
    setIsFetchingProfiles,
    setResponseData,
  };

  return (
    <div style={cssVariables}>
      {hoverElement}
      {enkaErrorMessage}
      {bindMessage}

      {!hideSelector ? (
        <div className={contentBlockClassNames}>
          <StylizedContentBlock
            variant="gradient-reverse"
            revealCondition={!!responseData.account}
          />
          <ProfileSelector
            uid={uid}
            profiles={relevantProfiles}
            isFetchingProfiles={isFetchingProfiles}
          />
        </div>
      ) : (
        <div style={{ marginTop: 30 }} />
      )}

      {isHoyolab ? (
        <HoyolabProfile {...profilePageProps} />
      ) : (
        <AkashaProfile {...profilePageProps} />
      )}
    </div>
  );
};
