import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { debounce } from "lodash";

import {
  CustomTable,
  StylizedContentBlock,
  RegionBadge,
  ARBadge,
  HelpBox,
  AchievementsBadge,
  NotificationBar,
  EnkaBadge,
} from "../../components";
import { TableColumn } from "../../types/TableColumn";
import Achievevement from "../../assets/icons/Achievement.webp";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import {
  FETCH_ACCOUNTS_FILTERS_URL,
  FETCH_ACCOUNTS_URL,
  uidsToQuery,
} from "../../utils/helpers";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { BuildsColumns } from "../BuildsPage";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { AdsComponentManager } from "../../components/AdsComponentManager";
import "./style.scss";

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hoverElement } = useContext(HoverElementContext);
  const { lastProfiles } = useContext(LastProfilesContext);

  const [inputUID, setInputUID] = useState<string>("");
  const [lookupUID, setLookupUID] = useState<string>("");
  const debouncedSetLookupUID = useCallback(debounce(setLookupUID, 350), []);

  useEffect(() => {
    debouncedSetLookupUID(inputUID);
  }, [inputUID]);

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
        width: "180px",
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
              {row.playerInfo.nickname}
            </a>
          );
        },
      },
      {
        name: "Signature",
        sortable: false,
        sortField: "playerInfo.signature",
        width: "350px",
        cell: (row) => {
          const signature = row?.playerInfo?.signature || "";
          return (
            <div
              style={{
                width: 350,
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
        name: "Saved Characters",
        sortable: false,
        sortField: "ownedCharacters",
        width: "120px",
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
        name: "Abyss",
        sortable: false,
        sortField: "playerInfo.worldLevel",
        width: "50px",
        cell: (row) => {
          const floor = row?.playerInfo?.towerFloorIndex || "";
          const chamber = row?.playerInfo?.towerLevelIndex || "";

          const abyssProgress = floor && chamber ? `${floor}-${chamber}` : "";
          let color = "gray";

          if (floor === 10) {
            color = "rgb(102, 163, 255)";
          }
          if (floor === 11) {
            color = "rgb(194, 102, 255)";
          }
          if (floor === 11 && chamber === 3) {
            color = "orange";
          }
          if (floor === 12) {
            color = "rgb(255, 217, 0)";
          }
          if (floor === 12 && chamber === 3) {
            color = "cyan";
          }

          return <div style={{ color }}>{abyssProgress}</div>;
        },
      },
      {
        name: "Last profile update",
        sortable: true,
        sortField: "lastProfileUpdate",
        cell: (row) => {
          if (!row?.lastProfileUpdate) return <></>;

          const lastProfileUpdate = new Date(row?.lastProfileUpdate || "");
          const strDate = lastProfileUpdate.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          return <div>{strDate}</div>;
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
    [lookupUID]
  );

  return (
    <div className="flex">
      {hoverElement}
      <div className="content-block w-100" id="content-container">
        <NotificationBar />
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
        <div className="relative search-input-wrapper">
          UID / nickname
          <div>
            <div className="search-input relative">
              <input
                defaultValue={inputUID}
                onChange={(event) => {
                  setInputUID(event.target.value);
                }}
              />
              {!inputUID && (
                <span className="fake-placeholder">type here...</span>
              )}
            </div>
          </div>
        </div>
        {lookupUID && (
          <div className="lookup-not-found-prompt">
            <div>
              Don't see <i>"{lookupUID}"</i> on the list? Click{" "}
              <Link to={`/profile/${lookupUID}`}>here</Link> to load the profile
              into Akasha System.
            </div>{" "}
            Make sure your data is available on Enka.Network first:{" "}
            <a href={`https://enka.network/u/${lookupUID}/`}>
              https://enka.network/u/{lookupUID}/
            </a>
          </div>
        )}
        <div>
          <CustomTable
            fetchURL={FETCH_ACCOUNTS_URL}
            filtersURL={FETCH_ACCOUNTS_FILTERS_URL}
            fetchParams={{
              uids: uidsToQuery(lastProfiles.map((a) => a.uid)),
              uid: lookupUID,
              // variant,
              // filter: "[all]1",
              // calculationId: currentCategory,
            }}
            columns={ACCOUNTS_COLUMNS}
            defaultSort="playerInfo.finishAchievementNum"
            ignoreEmptyUidsArray
            alwaysShowIndexColumn
            expandableRows
            // hidePagination
          />

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
