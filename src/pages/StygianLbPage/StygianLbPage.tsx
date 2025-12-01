import "./style.scss";

import {
  ARBadge,
  AbyssRankText,
  CustomTable,
  HelpBox,
  RegionBadge,
  ReplaceRowDataOnHover,
  RowIndex,
  StygianRankText,
  StylizedContentBlock,
  TheaterRankText,
} from "../../components";
import {
  FETCH_STYGIANLB_FILTERS_URL,
  FETCH_STYGIAN_LB_URL,
  monthDayYear_shortNumNum,
  uidToRegion,
  uidsToQuery,
} from "../../utils/helpers";
import { Link, useNavigate, useParams } from "react-router-dom";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios, { AxiosRequestConfig } from "axios";
import { faChevronLeft, faUser } from "@fortawesome/free-solid-svg-icons";

import Achievevement from "../../assets/icons/Achievement.webp";
import { BuildsColumns } from "../BuildsPage";
import DomainBackground from "../../assets/images/Grand_Narukami_Shrine_Concept_Art.webp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FriendshipIcon from "../../assets/icons/Item_Companionship_EXP.png";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { TableColumn } from "../../types/TableColumn";
import { TitleContext } from "../../context/TitleProvider/TitleProviderContext";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import debounce from "lodash/debounce";

export const StygianLbPage: React.FC = () => {
  // state
  const [inputUID, setInputUID] = useState<string>("");
  const [lookupUID, setLookupUID] = useState<string>("");
  const [stygianData, setStygianData] = useState<any>();

  // context
  const { setTitle } = useContext(TitleContext);
  const { lastProfiles } = useContext(LastProfilesContext);
  const { hoverElement } = useContext(HoverElementContext);
  const { translate, language } = useContext(TranslationContext);

  // hooks
  const navigate = useNavigate();
  const { version } = useParams();

  const _version = version?.replace("_", ".");
  const apiVer = stygianData?.schedule?.version;
  const isRealVersion = !_version || !isNaN(+_version);

  const fetchStygianInfo = async () => {
    const opts: AxiosRequestConfig<any> = { params: { version } };
    const stygianDataUrl = "/api/leaderboards/getStygianDetails";
    const response = await axios.get(stygianDataUrl, opts);
    const { data } = response.data;
    setStygianData(data);
  };

  useEffect(() => {
    const invalidVer = !version || !isRealVersion;
    const needsNewData = apiVer !== _version;

    if (!invalidVer && !needsNewData) return;
    fetchStygianInfo();
  }, [version]);

  useEffect(() => {
    if ((!version || !isRealVersion) && apiVer) {
      navigate(`/leaderboards/stygian/${apiVer.replace(".", "_")}`);
    }
  }, [stygianData]);

  const debouncedSetLookupUID = useCallback(debounce(setLookupUID, 350), []);

  useEffect(() => {
    debouncedSetLookupUID(inputUID);
  }, [inputUID]);

  useEffect(() => {
    setTimeout(() => {
      if (!_version) return;
      setTitle(`${_version} ${translate("Stygian Onslaught")} | Akasha System`);
    }, 0);
  }, [_version]);

  const STYGIAN_COLUMNS: TableColumn<BuildsColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          if (row.susLevel > 0) {
            return (
              <ReplaceRowDataOnHover
                data={<RowIndex index={row.index} />}
                onHoverData={<div className="opacity-5">-</div>}
              />
            );
          }

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
          // const isNew = isEntryNew(row?.lastProfileUpdate);

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
              <RegionBadge
                region={row.playerInfo?.region || uidToRegion(row.uid)}
              />
              {/* {isEnkaProfile ? <EnkaBadge /> : ""} */}

              <div className="table-icon-text-pair">
                {row.profilePictureLink ? (
                  <img
                    alt=""
                    className="table-icon"
                    src={row.profilePictureLink}
                    title={row.playerInfo?.nickname}
                  />
                ) : (
                  <FontAwesomeIcon
                    className="default-pfp-icon"
                    icon={faUser}
                    size="1x"
                  />
                )}
              </div>

              {/* {isNew && <div className="new-lb-badge mr-3" />} */}

              {row.playerInfo?.nickname}
            </a>
          );
        },
      },
      {
        name: "Signature",
        sortable: false,
        sortField: "playerInfo.signature",
        width: "245px",
        cell: (row) => {
          const signature = row?.playerInfo?.signature || "";
          return (
            <div
              translate="yes"
              style={{
                width: 245,
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
          const adventureRank = row?.playerInfo?.level || 0;
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
            Math.round(row.playerInfo?.finishAchievementNum) || 0;

          return (
            // <div>
            //   <AchievementsBadge count={finishAchievementNum} />
            // </div>
            <div style={{ display: "flex", gap: 3 }}>
              <img style={{ width: 20 }} alt="" src={Achievevement} />
              {finishAchievementNum}
            </div>
          );
        },
      },
      {
        name: "Abyss",
        sortable: false,
        sortField: "playerInfo.towerFloorIndex",
        // width: "80px",
        width: "55px",
        cell: (row) => {
          return <AbyssRankText row={row} onlyStars />;
        },
      },
      {
        name: "Theater",
        sortable: false,
        sortField: "playerInfo.theater.stars",
        width: "55px",
        cell: (row) => {
          return <TheaterRankText row={row} />;
        },
      },
      {
        name: "",
        sortable: true,
        sortField: "playerInfo.maxFriendshipCount",
        width: "55px",
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
        // name: (
        //   <span className="table-icon-text-pair" style={{ gap: 5 }}>
        //     <img className="table-icon small" src={StygianIcon} alt="-" />
        //     {_version} Score
        //   </span>
        // ),
        name: `${apiVer || "??"} Score`,
        sortable: true,
        sortField: "stygianScore",
        cell: (row) => {
          const profile = {
            susLevel: row.susLevel,
            playerInfo: {
              stygianSeconds: row.stygianSeconds,
              stygianIndex: row.stygianIndex,
              stygianScore: row.stygianScore,
            },
          };
          return <StygianRankText row={profile} useReplaceRowDataOnHover />;
        },
      },
    ],
    [translate, language, apiVer]
  );

  const uidsQuery = useMemo(
    () => uidsToQuery(lastProfiles.map((a) => a.uid)),
    [lastProfiles.length]
  );

  const stygianList = stygianData?.stygianList || [];

  const displayRelevantCategories = (
    <>
      <div className="other-calc-container">
        {stygianList.map((ver: string) => {
          const to = `/leaderboards/stygian/${ver}`;
          const _ver = ver.replace("_", ".");
          const isActive = apiVer === _ver;
          return (
            <Link
              className={isActive ? "current-selection" : ""}
              key={ver}
              to={to}
            >
              {_ver}
            </Link>
          );
        })}
      </div>
    </>
  );

  const enemiesArr = stygianData?.enemies || [];

  return (
    <div className="flex">
      {hoverElement}
      <div id="content-container" className=" w-100">
        <div
          className="content-block w-100"
          style={{ display: "inline-block" }}
        >
          <StylizedContentBlock
            revealCondition={!!stygianData}
            overrideImage={DomainBackground}
            variant="gradient-low-height"
          />
          <div className="flex-special-container">
            <div className="relative block-highlight w-100">
              <div style={{ padding: "10px 0px 0px 10px", marginBottom: 20 }}>
                <a
                  className="pointer back-btn"
                  href="/leaderboards"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/leaderboards");
                  }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} size="1x" /> GO BACK
                </a>
              </div>
              <div className="flex" style={{ margin: 10 }}>
                {/* {displayChart} */}
                <div
                  style={{
                    // width: "calc(100% - 500px)",
                    // minWidth: 300,
                    // flexGrow: 1,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <h2>
                    {translate("Stygian Onslaught")} {apiVer || "??"}: "
                    {stygianData?.schedule?.name || "..."}"
                  </h2>
                  {stygianData?.schedule?.start_time && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      <div>
                        {new Date(
                          +(stygianData?.schedule?.start_time || 0) * 1000
                        )?.toLocaleString(language, monthDayYear_shortNumNum)}
                      </div>
                      <div>-</div>
                      <div>
                        {new Date(
                          +(stygianData?.schedule?.end_time || 0) * 1000
                        )?.toLocaleString(language, monthDayYear_shortNumNum)}
                      </div>
                    </div>
                  )}
                  <div className="stygian-enemies-wrapper">
                    {enemiesArr.map((enemy: any) => {
                      const _split = enemy.enemyName.split(":");
                      return (
                        <div
                          key={enemy.icon}
                          className="stygian-enemy-container"
                        >
                          <img src={enemy.icon} alt="" />
                          <div style={{ fontWeight: 700, fontSize: 18 }}>
                            {_split[0]}
                          </div>
                          <div style={{ fontSize: 14 }}>{_split[1]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="relative block-highlight highlight-tile-container flex alternate-sizing"
              style={{ flexWrap: "wrap" }}
            >
              <HelpBox page="stygian" hideHeader noBackground />
              <div className="other-calculations-display">
                <div
                  className="flex w-100 mt-10"
                  style={{ justifyContent: "center" }}
                >
                  <b>Stygian schedule:</b>
                </div>
                <div className="flex w-100">{displayRelevantCategories}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-block w-100">
          <StylizedContentBlock
            // @TODO: ...............
            revealCondition={true}
            overrideImage={DomainBackground}
          />
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
          {isRealVersion && (
            <div>
              <CustomTable
                fetchURL={FETCH_STYGIAN_LB_URL}
                fetchParams={{
                  uids: uidsQuery,
                  uid: lookupUID,
                  filter: "[susLevel]1[all]1",
                  version,
                }}
                columns={STYGIAN_COLUMNS}
                defaultSort={"stygianScore"}
                expandableRows
                ignoreEmptyUidsArray
                alwaysShowIndexColumn
                // hidePagination
              />

              {/* spacer */}
              <div style={{ marginTop: "30px" }} />

              <CustomTable
                // key={`ct-lb-${rerender}`}
                key={`stygianLb-${version}-table`}
                fetchURL={FETCH_STYGIAN_LB_URL}
                fetchParams={{ version }}
                filtersURL={FETCH_STYGIANLB_FILTERS_URL}
                columns={STYGIAN_COLUMNS}
                defaultSort={"stygianScore"}
                expandableRows
                projectParamsToPath
                alwaysShowIndexColumn
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
