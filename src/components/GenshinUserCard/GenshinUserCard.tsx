import React from "react";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spinner } from "../Spinner";
import "./style.scss";

export type AccountDataForUserCard = {
  uid: string;
  profilePictureLink?: string;
  nameCardLink?: string;
  playerInfo: {
    level?: number;
    nickname?: string;
    signature?: string;
  };
};

type GenshinUserCardProps = {
  showBackgroundImage?: boolean;
  isAccountOwner?: boolean;
  handleToggleModal?: any;
  accountData: {
    account: AccountDataForUserCard;
  };
};

export const GenshinUserCard: React.FC<GenshinUserCardProps> = ({
  showBackgroundImage = false,
  isAccountOwner = false,
  handleToggleModal,
  accountData,
}) => {
  const playerInfo = accountData.account?.playerInfo;

  if (!playerInfo) {
    return (
      <div className="genshin-user-card">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Spinner />
        </div>
      </div>
    );
  }

  const arBadgeClassNames = [
    "float-top-right ar-badge",
    `ar-${Math.floor((playerInfo?.level ?? 60) / 5) * 5}-badge`,
  ].join(" ");

  const style = {
    backgroundImage: `url(${accountData.account.nameCardLink})`,
  } as React.CSSProperties;

  return (
    <>
      {showBackgroundImage && <div className="card-background" style={style} />}
      <div
        className={[
          "genshin-user-card",
          isAccountOwner ? "pointer clickable-card" : "",
        ]
          .join(" ")
          .trim()}
        onClick={handleToggleModal}
      >
        {accountData.account.profilePictureLink ? (
          <img
            className="profile-picture"
            src={accountData.account.profilePictureLink}
          />
        ) : (
          <FontAwesomeIcon
            style={{ opacity: 0.33 }}
            className="profile-picture"
            icon={faQuestion}
            size="1x"
          />
        )}

        <div className="genshin-card-content">
          <div className="card-big-text">{playerInfo.nickname}</div>
          <div className="card-signature">{playerInfo.signature}</div>
        </div>
        <div className={arBadgeClassNames}>AR{playerInfo.level ?? " ?"}</div>
      </div>
    </>
  );
};
