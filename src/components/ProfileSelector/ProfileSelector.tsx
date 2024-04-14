import "./style.scss";

import { Link, useLocation } from "react-router-dom";

import { LastUpdated } from "../LastUpdated";
import { PatreonBorderInside } from "../FancyBuildBorder";
import React from "react";
import { Spinner } from "../Spinner";
import { cssJoin } from "../../utils/helpers";

type ProfileSelectorProps = {
  uid?: string;
  profiles: any[];
  isFetchingProfiles: boolean;
};

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  uid,
  profiles,
  isFetchingProfiles,
}) => {
  const { state } = useLocation();

  const renderLink = (profile: any) => {
    const handle = profile?.uid; // ??
    const label = profile?.uid; // ??

    const profileUID = ("" + profile?.uid).toLowerCase();
    const pageUID = ("" + uid).toLowerCase();
    const defaultUID = profile?.defaultProfile?.toLowerCase();

    const isActive = profileUID === pageUID;
    const isDefault = profileUID === defaultUID;

    const isCombined = ("" + handle).startsWith("@");
    const isEnkaProfile = !isCombined && isNaN(+handle);
    const isAkashaProfile = !isEnkaProfile && !isCombined;
    const isPatreon = profile?.patreon?.active;

    const classNamesItemWrapper = cssJoin([
      "profile-selection-item-wrapper",
      isActive ? "current-profile" : "",
      isPatreon ? "is-patreon" : "",
    ]);

    const classNamesItem = cssJoin([
      "profile-selection-item",
      isActive ? "current-profile" : "",
      isPatreon ? "is-patreon" : "",
    ]);

    const classNamesLabel = cssJoin([
      "profile-type",
      isEnkaProfile ? "enka-profile" : "",
      isAkashaProfile ? "enka-profile akasha-icon" : "",
      // isActive ? "current-profile" : "",
    ]);

    const _count = profile.buildsCount || 0;
    const _buildsStr = `${_count} build${_count === 1 ? "" : "s"}`;

    const displayAvatarLink = profile?.displayAvatarLink;

    const styleObj = {
      "--name-card-url": `url(${profile?.namecardURL})`,
    } as React.CSSProperties;

    return (
      <Link
        key={profile.uid}
        to={`/profile/${handle}`}
        className="profile-selector-tile"
        state={{ preventSpinner: true }}
      >
        <div className={classNamesItemWrapper} style={styleObj}>
          <div className="responsive-p1">
            <div
              className="profile-label"
              title="Combined Profile will prioritize builds from this profile"
            >
              {isDefault ? "main" : ""}
            </div>
            <div className={classNamesItem}>
              {displayAvatarLink && (
                <div className="relative">
                  {isPatreon && isActive && (
                    <PatreonBorderInside
                      classNames={[profile?.patreon?.active ? "" : "hide"]}
                      style={{
                        transform: "translate(-10px, -10px)",
                        width: "calc(100%)",
                        height: "calc(100% - 5px)",
                      }}
                      animationSpeedMultiplier={1}
                    />
                  )}
                  {isCombined ? (
                    <div className="combined-pfp">
                      <img
                        alt="pfp"
                        className="profile-pfp"
                        src={profile?.uidAvatar || displayAvatarLink}
                      />
                      <img
                        alt="pfp"
                        className="profile-pfp"
                        src={profile?.enkaAvatar || displayAvatarLink}
                      />
                    </div>
                  ) : (
                    <img
                      alt="pfp"
                      className="profile-pfp"
                      src={displayAvatarLink}
                    />
                  )}
                </div>
              )}
              {label}
            </div>
          </div>
          <div className="responsive-p2">
            <LastUpdated
              lastProfileUpdate={profile?.lastProfileUpdate}
              // label="last update"
              // format="rawText"
            />
            <div className={classNamesLabel}>
              {isCombined ? "Combined" : ""}
              {isEnkaProfile ? "Enka.Network" : ""}
              {!isEnkaProfile && !isCombined ? "Akasha System" : ""}
            </div>
            <div className="profile-type">{_buildsStr}</div>
            {/* <div className="profile-type">99 artifacts</div> */}
          </div>
          {/* @TODO: */}
          {/* <div className="responsive-p3">TOGGLE HIDE/SHOW</div> */}
        </div>
      </Link>
    );
  };

  if (profiles.length <= 1) {
    return null;
  }

  return (
    <div className="flex">
      <div className="profile-selection-wrapper">
        {isFetchingProfiles && !state?.preventSpinner ? (
          <Spinner />
        ) : (
          profiles.map(renderLink)
        )}
      </div>
    </div>
  );
};
