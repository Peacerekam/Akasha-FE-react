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

import Achievevement from "../../assets/icons/Achievement.webp";
import { AdsComponentManager } from "../../components/AdsComponentManager";
import { BuildsColumns } from "../BuildsPage";
import DomainBackground from "../../assets/images/Grand_Narukami_Shrine_Concept_Art.webp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { LookupUID } from "./LookupUID";
import { TableColumn } from "../../types/TableColumn";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export const abyssProgressToColor = (floor: number, chamber: number) => {
  if (floor === 10) {
    return "rgb(102, 163, 255)";
  }
  if (floor === 11) {
    return "rgb(194, 102, 255)";
  }
  if (floor === 11 && chamber === 3) {
    return "orange";
  }
  if (floor === 12) {
    return "rgb(255, 217, 0)";
  }
  if (floor === 12 && chamber === 3) {
    return "cyan";
  }

  return "gray";
};

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hoverElement } = useContext(HoverElementContext);
  const { language } = useContext(TranslationContext);

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
        name: "Adventure Rank",
        sortable: true,
        sortField: "playerInfo.level",
        width: "100px",
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
      {
        name: "Characters",
        sortable: false,
        sortField: "ownedCharacters",
        width: "80px",
        cell: (row) => {
          const ownedCharacters = row?.ownedCharacters || "";
          return (
            <div style={{ color: ownedCharacters?.length === 0 ? "gray" : "" }}>
              {ownedCharacters?.length || "-"}
            </div>
          );
        },
      },
      {
        name: "Spiral Abyss",
        sortable: false,
        sortField: "playerInfo.towerFloorIndex",
        width: "70px",
        cell: (row) => {
          const floor = row?.playerInfo?.towerFloorIndex || "";
          const chamber = row?.playerInfo?.towerLevelIndex || "";

          const abyssProgress = floor && chamber ? `${floor}-${chamber}` : "";
          const color = abyssProgressToColor(floor, chamber)

          return <div style={{ color }}>{abyssProgress}</div>;
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
    [language]
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
