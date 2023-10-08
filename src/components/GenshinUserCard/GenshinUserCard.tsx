import React, { useContext } from "react";
import { faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spinner } from "../Spinner";
import { ARBadge } from "../ARBadge";
import { RegionBadge } from "../RegionBadge";
import { AchievementsBadge } from "../AchievementsBadge";
import "./style.scss";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";

type AkashaAchievement = {
  id: number;
  score: number;
  type: string;
  name: string;
  description: string;
  count: number;
};

export type AccountDataForUserCard = {
  uid: string;
  profilePictureLink?: string;
  nameCardLink?: string;
  playerInfo: {
    region?: string;
    level?: number;
    nickname?: string;
    signature?: string;
    finishAchievementNum?: number;
  };
  achievements?: AkashaAchievement[];
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
  const { favouriteTab, lastProfiles } = useContext(LastProfilesContext);
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

  const style = {
    backgroundImage: `url(${accountData.account.nameCardLink})`,
  } as React.CSSProperties;

  const uid = accountData.account.uid;
  const relatedProfile = lastProfiles.find((a) => a.uid === uid);
  const favourites = lastProfiles.filter((a) => (a.priority || 1) > 1);
  const disableNewFavs = favourites.length >= 10;
  const favourited = (relatedProfile?.priority || 1) > 1;

  const handleMarkAdFavourite = () => {
    favouriteTab(uid, playerInfo?.nickname || uid);
  };

  return (
    <>
      <div
        className={`fav-btn ${favourited ? "favourited" : ""} ${
          disableNewFavs && !favourited ? "disabled" : ""
        }`}
        title={
          favourited
            ? "Unmark as favourite"
            : disableNewFavs
            ? "Favourites tab limit (10) reached"
            : "Mark as favourite"
        }
        onClick={handleMarkAdFavourite}
      >
        <FontAwesomeIcon
          icon={favourited ? faStar : (faStarRegular as IconProp)}
          size="2x"
        />
      </div>
      {showBackgroundImage && <div className="card-background" style={style} />}
      <div
        className={[
          "genshin-user-card",
          isAccountOwner ? "pointer clickable-card" : "",
        ]
          .join(" ")
          .trim()}
        onClick={handleToggleModal}
        title={isAccountOwner ? "Open build settings" : ""}
      >
        {accountData.account.profilePictureLink ? (
          <img
            className="profile-picture"
            src={accountData.account.profilePictureLink}
          />
        ) : (
          <FontAwesomeIcon
            className="default-picture"
            icon={faUser}
            size="1x"
          />
        )}

        <div className="genshin-card-content">
          <div className="genshin-card-top-row">
            <div className="card-big-text">{playerInfo.nickname}</div>
            <div className="badges-container">
              <RegionBadge region={playerInfo.region} />
              <AchievementsBadge count={playerInfo.finishAchievementNum} />
              <ARBadge adventureRank={playerInfo.level} />
            </div>
          </div>
          <div className="card-signature">{playerInfo.signature || ""}</div>
        </div>
      </div>
    </>
  );
};
