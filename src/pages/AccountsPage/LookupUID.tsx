import "./style.scss";

import {
  ARBadge,
  AdsComponentManager,
  CustomTable,
  GenshinUserCard,
  LastUpdated,
  RegionBadge,
  RowIndex,
} from "../../components";
import {
  FETCH_ACCOUNTS_FILTERS_URL,
  FETCH_ACCOUNTS_URL,
  uidToRegion,
  uidsToQuery,
} from "../../utils/helpers";
import { Link, useNavigate } from "react-router-dom";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AbyssRankText } from "../../components/AbyssRankText";
import Achievevement from "../../assets/icons/Achievement.webp";
import { BuildsColumns } from "../BuildsPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FriendshipIcon from "../../assets/icons/Item_Companionship_EXP.png";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import PerfectScrollbar from "react-perfect-scrollbar";
import { TableColumn } from "../../types/TableColumn";
import { TheaterRankText } from "../../components/TheaterRankText";
import { TitleAndDescription } from "../ProfilePage/PageTypes/AkashaProfile";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import axios from "axios";
import debounce from "lodash/debounce";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const getEmptyAccountObj = (region?: string) => {
  return {
    uid: "",
    profilePictureLink: undefined,
    nameCardLink: undefined,
    playerInfo: {
      region: region || undefined,
      level: undefined,
      nickname: undefined,
      signature: undefined,
      finishAchievementNum: undefined,
    },
    achievements: undefined,
    hoyolab: undefined,
  };
};

type LookupUIDProps = { disableAd?: boolean };

export const LookupUID: React.FC<LookupUIDProps> = ({ disableAd }) => {
  const navigate = useNavigate();
  const { lastProfiles } = useContext(LastProfilesContext);
  const { language, translate } = useContext(TranslationContext);

  const [inputUID, setInputUID] = useState<string>("");
  const [lookupUID, setLookupUID] = useState<string>("");
  const [queryUID, setQueryUID] = useState<string>("");
  const debouncedSetLookupUID = useCallback(debounce(setLookupUID, 350), []);
  const [accountData, setAccountData] = useState<any>(getEmptyAccountObj());
  const [error, setError] = useState<TitleAndDescription | null>(null);

  useEffect(() => {
    debouncedSetLookupUID(inputUID);
  }, [inputUID]);

  const ACCOUNTS_COLUMNS: TableColumn<BuildsColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <RowIndex index={row.index} />;
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
        width: "60px",
        cell: (row) => {
          return <TheaterRankText row={row} />;
        },
      },
      {
        name: "",
        sortable: true,
        sortField: "playerInfo.maxFriendshipCount",
        width: "20px",
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
    [lookupUID, language, translate]
  );

  const uidsQuery = useMemo(
    () => uidsToQuery(lastProfiles.map((a) => a.uid)),
    [lastProfiles.length]
  );

  const validRegion = uidToRegion(lookupUID);

  const handleRefreshData = async (uid: string) => {
    const refreshURL = `/api/user/refresh/${uid}`;
    return await axios.get(refreshURL);
  };

  const _setErrorFromData = (data: any) => {
    if (!data?.data?.error) {
      setError(null);
      return;
    }
    setError(
      data.data.error?.title
        ? data.data.error
        : { title: data.data.error, description: "" }
    );
  };

  const fetchAccountData = async () => {
    if (!validRegion) return;

    const url = `/api/user/${lookupUID}`;
    const { data } = await axios.get(url);

    if (!data?.data?.account?.playerInfo?.region && !data?.data.error) {
      const { data: refreshData } = await handleRefreshData(lookupUID);

      if (refreshData.data?.error) {
        _setErrorFromData(refreshData);
      } else {
        fetchAccountData();
      }
    } else if (data?.data?.error) {
      _setErrorFromData(data);
      setAccountData(getEmptyAccountObj());
    } else if (data?.data?.account?.playerInfo?.region) {
      setAccountData(data?.data?.account);
      setError(null);
    }
    setQueryUID(lookupUID);
  };

  useEffect(() => {
    setError(null);
    const emptyAccountObj = getEmptyAccountObj(validRegion);

    if (!validRegion) {
      setQueryUID(lookupUID);
      setAccountData(emptyAccountObj);
      return;
    }

    setAccountData(emptyAccountObj);
    fetchAccountData();
  }, [validRegion, lookupUID]);

  const inputAndCardResult = (
    <div className="input-and-card-result">
      <div className="relative search-input-wrapper">
        Enter UID / nickname
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
      {error && (
        <div className="lookup-not-found-prompt">
          <div>{error?.title}</div>
          {error?.description}
        </div>
      )}
      {lookupUID && !error && (
        <div className="justify-content-center">
          {accountData.playerInfo.region && (
            <div className="uid-lookup-result expanded-row block-highlight">
              <PerfectScrollbar>
                <a
                  className="uid-result"
                  href={`/profile/${lookupUID}`}
                  onClick={(event) => event.preventDefault()}
                >
                  <GenshinUserCard
                    isAccountOwner
                    showBackgroundImage
                    handleToggleModal={(event: any) => {
                      event.preventDefault();
                      navigate(`/profile/${lookupUID}`);
                    }}
                    showcaseOverride={true}
                    accountData={{ account: accountData }}
                  />
                </a>
              </PerfectScrollbar>
            </div>
          )}
          {!validRegion && (
            <div className="lookup-not-found-prompt">
              <div>
                "<code>{lookupUID}</code>" doesn't appear to be a valid in-game UID.
              </div>
              <div>
                If you're trying to load Enka profile into Akasha then click{" "}
                <Link to={`/profile/${lookupUID}`}>here</Link>.
              </div>
              <div>If it's a nickname search then check the table below.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="lookup-uid-wrapper">
      <div className="flex-special-container">
        {!disableAd && <AdsComponentManager adType="Video" />}
        {inputAndCardResult}
      </div>
      <div>
        <CustomTable
          fetchURL={FETCH_ACCOUNTS_URL}
          filtersURL={FETCH_ACCOUNTS_FILTERS_URL}
          fetchParams={{
            uids: uidsQuery,
            uid: queryUID,
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
      </div>
    </div>
  );
};
