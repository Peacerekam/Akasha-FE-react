import "./style.scss";

import {
  ARBadge,
  CustomTable,
  HelpBox,
  LastUpdated,
  RegionBadge,
  StylizedContentBlock,
} from "../../components";
import {
  FETCH_ACCOUNTS_FILTERS_URL,
  FETCH_ACCOUNTS_URL,
} from "../../utils/helpers";
import React, { useContext, useMemo } from "react";

import { AbyssRankText } from "../../components/AbyssRankText";
import Achievevement from "../../assets/icons/Achievement.webp";
import { AdsComponentManager } from "../../components/AdsComponentManager";
import { BuildsColumns } from "../BuildsPage";
import DomainBackground from "../../assets/images/Grand_Narukami_Shrine_Concept_Art.webp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FriendshipIcon from "../../assets/icons/Item_Companionship_EXP.png";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { LookupUID } from "./LookupUID";
import { TableColumn } from "../../types/TableColumn";
import { TheaterRankTextText } from "../../components/TheaterRankText";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hoverElement } = useContext(HoverElementContext);
  const { language, translate } = useContext(TranslationContext);

  const ACCOUNTS_COLUMNS: TableColumn<BuildsColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <div>{row.index}</div>;
        },
      },
      {
        name: "Nickname",
        sortField: "playerInfo.nickname",
        // width: "180px",
        sortable: false,
        cell: (row) => {
          // if (!row.playerInfo?.level) return <></>;
          const isEnkaProfile = isNaN(+row.uid);

          return (
            <a
              className={`row-link-element ${
                isEnkaProfile ? "enka-profile" : ""
              }`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${row.uid}`);
              }}
              href={`/profile/${row.uid}`}
            >
              {/* <ARBadge adventureRank={row.owner.adventureRank} /> */}
              <RegionBadge region={row.playerInfo.region} />
              {/* {isEnkaProfile ? <EnkaBadge /> : ""} */}

              <div className="table-icon-text-pair">
                {row.profilePictureLink ? (
                  <img
                    alt=" "
                    className="table-icon"
                    src={row.profilePictureLink}
                    title={row.playerInfo.nickname}
                  />
                ) : (
                  <FontAwesomeIcon
                    className="default-pfp-icon"
                    icon={faUser}
                    size="1x"
                  />
                )}
              </div>

              {row.playerInfo.nickname}
            </a>
          );
        },
      },
      {
        name: "Signature",
        sortable: false,
        sortField: "playerInfo.signature",
        width: "285px",
        cell: (row) => {
          const signature = row?.playerInfo?.signature || "";
          return (
            <div
              style={{
                width: 285,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {signature}
            </div>
          );
        },
      },
      {
        name: "",
        sortable: true,
        sortField: "playerInfo.level",
        width: "50px",
        cell: (row) => {
          const adventureRank = row?.playerInfo.level || 0;
          return (
            <div>
              <ARBadge adventureRank={adventureRank} />
            </div>
          );
        },
      },
      {
        name: "Achievements",
        sortable: true,
        sortField: "playerInfo.finishAchievementNum",
        cell: (row) => {
          const finishAchievementNum =
            Math.round(row.playerInfo?.finishAchievementNum) ?? 0;

          return (
            // <div>
            //   <AchievementsBadge count={finishAchievementNum} />
            // </div>
            <div style={{ display: "flex", gap: 3 }}>
              <img
                style={{ width: 20 }}
                alt="Achievements"
                src={Achievevement}
              />
              {finishAchievementNum}
            </div>
          );
        },
      },
      // {
      //   name: "Characters",
      //   sortable: false,
      //   sortField: "ownedCharacters",
      //   width: "80px",
      //   cell: (row) => {
      //     const ownedCharacters = row?.ownedCharacters || "";
      //     return (
      //       <div style={{ color: ownedCharacters?.length === 0 ? "gray" : "" }}>
      //         {ownedCharacters?.length || "-"}
      //       </div>
      //     );
      //   },
      // },
      {
        name: "",
        sortable: false,
        sortField: "playerInfo.towerFloorIndex",
        width: "80px",
        cell: (row) => {
          return <AbyssRankText row={row} />;
        },
      },
      {
        name: "",
        sortable: false,
        sortField: "playerInfo.theater.stars",
        width: "55px",
        cell: (row) => {
          return <TheaterRankTextText row={row} />;
        },
      },
      {
        name: "",
        sortable: true,
        sortField: "playerInfo.maxFriendshipCount",
        width: "35px",
        cell: (row) => {
          const count = row?.playerInfo?.maxFriendshipCount || 0;

          return (
            <span
              className="abyss-cell"
              title={
                translate("Characters at maximum Friendship Level") +
                ` - ${count}`
              }
            >
              {count ? (
                <img alt="F." width={16} height={16} src={FriendshipIcon} />
              ) : (
                ""
              )}
              {count || <span style={{ color: "gray" }}>-</span>}
            </span>
          );
        },
      },
      {
        name: "Last update",
        sortable: true,
        sortField: "lastProfileUpdate",
        cell: (row) => {
          if (!row?.lastProfileUpdate) return <></>;

          return (
            <LastUpdated
              lastProfileUpdate={row.lastProfileUpdate}
              format="rawText"
            />
          );
        },
      },
      // {
      //   name: "Badges",
      //   sortable: false,
      //   sortField: "---",
      //   cell: (row) => {
      //     const achievements = row.achievements ?? [];
      //     const badges = achievements
      //       // .map((a: any) => `${a.count}× "${a.name}"`)
      //       .map((a: any) => `${a.count}× ...`)
      //       .join(", ");

      //     return <div style={{ whiteSpace: "nowrap" }}>{badges}</div>;
      //   },
      // },
      // {
      //   name: "Akasha Score",
      //   sortable: true,
      //   sortField: "---",
      //   cell: (row) => {
      //     console.log(row);
      //     const score = "" + Math.random();
      //     return <div>{score.slice(2, 8)}</div>;
      //   },
      // },
    ],
    [language, translate]
  );

  return (
    <div className="flex">
      {hoverElement}
      <div className="content-block w-100" id="content-container">
        {/* <NotificationBar /> */}
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="flex-special-container">
          <AdsComponentManager adType="Video" />
          <HelpBox page="accounts" />
        </div>
        {/* <AdsComponentManager
          adType="LeaderboardBTF"
          dataAdSlot="6204085735"
          hybrid="mobile"
          hideOnDesktop
        /> */}
        <div>
          <LookupUID />

          {/* spacer */}
          <div style={{ marginTop: "30px" }} />

          <CustomTable
            fetchURL={FETCH_ACCOUNTS_URL}
            filtersURL={FETCH_ACCOUNTS_FILTERS_URL}
            columns={ACCOUNTS_COLUMNS}
            defaultSort="playerInfo.finishAchievementNum"
            // expandableRows
            projectParamsToPath
            expandableRows
          />
        </div>
      </div>
    </div>
  );
};
