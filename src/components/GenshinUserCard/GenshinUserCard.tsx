import "./style.scss";

import React, { useContext } from "react";
import { faStar, faUser } from "@fortawesome/free-solid-svg-icons";

import { ARBadge } from "../ARBadge";
import { AbyssRankText } from "../AbyssRankText";
import { AchievementsBadge } from "../AchievementsBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { RegionBadge } from "../RegionBadge";
import { SettingsContext } from "../../context/SettingsProvider/SettingsProvider";
import { Spinner } from "../Spinner";
import { TheaterRankText } from "../TheaterRankText";
import { cssJoin } from "../../utils/helpers";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { useParams } from "react-router-dom";

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
  hoyolab?: {
    avatar_url?: string;
    pendant?: string;
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
  const { showcaseState } = useContext(SettingsContext);
  const { favouriteTab, lastProfiles } = useContext(LastProfilesContext);
  const playerInfo = accountData.account?.playerInfo;

  const { uid: _uid } = useParams();
  const uid = _uid || accountData.account.uid;
  const isCombined = uid.startsWith("@");

  if (!playerInfo) {
    return (
      <div className="genshin-user-card-wrapper">
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
      </div>
    );
  }

  const relatedProfile = lastProfiles.find(
    (a) => a.uid?.toLowerCase() === uid?.toLowerCase()
  );
  const favourites = lastProfiles.filter((a) => (a.priority || 1) > 1);
  const disableNewFavs = favourites.length >= 10;
  const favourited = (relatedProfile?.priority || 1) > 1;
  const isHoyolab = uid.startsWith("!");
  const isEnkaProfile = !isHoyolab && isNaN(+uid);

  const style = {
    backgroundImage: `url(${accountData.account.nameCardLink})`,
  } as React.CSSProperties;

  const handleMarkAsFavourite = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    favouriteTab(uid, playerInfo?.nickname || uid);
  };

  // @TODO: accountData.account.hoyolab?.pendant === border image
  // @TODO: accountData.account.hoyolab?.pendant === border image
  // @TODO: accountData.account.hoyolab?.pendant === border image
  // @TODO: accountData.account.hoyolab?.pendant === border image
  // @TODO: accountData.account.hoyolab?.pendant === border image
  // @TODO: accountData.account.hoyolab?.bg_url === hoyo bg?

  const displayPfp = accountData.account.profilePictureLink ? (
    <img
      alt=""
      className="profile-picture"
      style={
        isHoyolab ? { borderRadius: 999, scale: "0.8", aspectRatio: "1/1" } : {}
      }
      src={
        isHoyolab
          ? accountData.account.hoyolab?.avatar_url
          : accountData.account.profilePictureLink
      }
    />
  ) : (
    <FontAwesomeIcon className="default-picture" icon={faUser} size="1x" />
  );

  const displayFavBtn = (
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
      onClick={handleMarkAsFavourite}
    >
      <FontAwesomeIcon
        icon={favourited ? faStar : (faStarRegular as IconProp)}
        size="2x"
      />
    </div>
  );

  const displayPendant = isHoyolab ? (
    <div className="relative">
      <img
        alt=""
        className="absolute profile-picture"
        src={accountData.account.hoyolab?.pendant}
        style={{ zIndex: 1 }}
      />
    </div>
  ) : (
    ""
  );

  return (
    <div
      className={cssJoin([
        "genshin-user-card-wrapper",
        isAccountOwner ? "pointer clickable-card" : "",
        isHoyolab ? "hoyolab-card" : "",
        showcaseState ? "expanded" : "",
      ])}
    >
      {displayFavBtn}
      {showBackgroundImage && <div className="card-background" style={style} />}
      <div
        className="genshin-user-card"
        onClick={handleToggleModal}
        title={isAccountOwner ? "Open build settings" : ""}
      >
        <div
          style={{
            display: "flex",
            alignItems: isHoyolab ? "center" : "initial",
          }}
        >
          {isHoyolab ? (
            <div>
              {displayPendant}
              {displayPfp}
            </div>
          ) : (
            displayPfp
          )}
        </div>

        <div className="genshin-card-content">
          <div className="genshin-card-top-row">
            <div>
              <div className="card-big-text">
                {playerInfo.nickname}
                {isEnkaProfile && !isCombined ? (
                  <span className="enka-icon" title="Enka.Network Profile" />
                ) : (
                  ""
                )}
              </div>
              <div className="card-signature">{playerInfo.signature || ""}</div>
            </div>
            <div className="badges-container-outer">
              <div className="badges-container">
                <RegionBadge region={playerInfo.region} />
                <AchievementsBadge count={playerInfo.finishAchievementNum} />
                <ARBadge adventureRank={playerInfo.level} />
              </div>
              <div className="badges-container endgame">
                <TheaterRankText row={accountData.account} badge />
                <AbyssRankText row={accountData.account} badge />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
