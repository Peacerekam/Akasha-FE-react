import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faRotateRight,
  faKey,
} from "@fortawesome/free-solid-svg-icons";

import {
  abortSignalCatcher,
  allSubstatsInOrder,
  FETCH_ARTIFACTS_URL,
  FETCH_ARTIFACT_FILTERS_URL,
  FETCH_BUILDS_URL,
  FETCH_CHARACTER_FILTERS_URL,
  getArtifactCvColor,
  getInGameSubstatValue,
  getSubstatsInOrder,
  isPercent,
  normalizeText,
  optsParamsSessionID,
} from "../../utils/helpers";
import { ArtifactColumns } from "../ArtifactsPage";
import { BuildsColumns } from "../BuildsPage";
import {
  CritRatio,
  StatIcon,
  DisplaySets,
  WeaponMiniDisplay,
  Spinner,
  CustomTable,
  ReplaceRowDataOnHover,
  Timer,
  StylizedContentBlock,
  CalculationResultWidget,
  ConfirmTooltip,
  GenshinUserCard,
} from "../../components";
import { TableColumn } from "../../types/TableColumn";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import {
  applyModalBodyStyle,
  getRelativeCoords,
} from "../../components/CustomTable/Filters";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import "./style.scss";
import { getSessionIdFromCookie } from "../../utils/helpers";

export const ProfilePage: React.FC = () => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [enableRefreshBtn, setEnableRefreshBtn] = useState(false);
  const [enableBindhBtn, setEnableBindBtn] = useState(false);
  const [bindSecret, setBindSecret] = useState("");
  const [fetchCount, setFetchCount] = useState(0);
  const [bindTime, setBindTime] = useState<number>();
  const [refreshTime, setRefreshTime] = useState<number>();
  const [responseData, setResponseData] = useState<{
    account: any;
    error?: {
      title: string;
      description: string;
    };
  }>({ account: null });

  const { uid } = useParams();
  const { hoverElement } = useContext(HoverElementContext);
  const { addTab } = useContext(LastProfilesContext);
  const { isAuthenticated, isBound, fetchSessionData, boundAccounts } =
    useContext(SessionDataContext);

  const isAccountOwner = useMemo(
    () => isBound(uid),
    [uid, isAuthenticated, boundAccounts]
  );

  const fetchProfile = async (
    uid: string,
    abortController?: AbortController
  ) => {
    const _uid = encodeURIComponent(uid);
    const url = `/api/user/${_uid}`;
    setResponseData({ account: null });

    const opts = {
      signal: abortController?.signal,
      params: {
        sessionID: getSessionIdFromCookie(),
      },
    };

    const getSetData = async () => {
      const { data } = await axios.get(url, opts);

      setResponseData(data.data);

      if (data?.data?.account?.playerInfo?.nickname) {
        handleAddNewTab(data.data);
      }

      if (!data?.data?.account?.profilePictureLink) {
        await handleRefreshData();
      }

      const getTime = new Date().getTime();
      const thenTTL = getTime + data.ttl;
      setRefreshTime(thenTTL);
      setEnableRefreshBtn(thenTTL < 0);

      const thenBindTTL = getTime + data.bindTTL;
      setBindTime(thenBindTTL);
      setEnableBindBtn(thenBindTTL < 0);
      setBindSecret(data.secret);
    };

    await abortSignalCatcher(getSetData);
  };

  const handleAddNewTab = ({ account }: any) => {
    if (!uid) return;
    addTab(uid, account?.playerInfo?.nickname ?? "???");
  };

  useEffect(() => {
    const abortController = new AbortController();
    if (uid) fetchProfile(uid, abortController);

    return () => {
      abortController.abort();
    };
  }, [uid]);

  const cssVariables = {
    "--name-card-url": `url(${responseData?.account?.nameCardLink})`,
  } as React.CSSProperties;

  // move this somewhere else i think
  const ARTIFACT_COLUMNS: TableColumn<ArtifactColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <span>{row.index}</span>;
        },
      },
      {
        name: "Name",
        sortable: true,
        sortField: "name",
        cell: (row) => {
          return (
            <div className="table-icon-text-pair">
              <img className="table-icon" src={row.icon} />{" "}
              <span
                style={{
                  color: {
                    5: "orange",
                    4: "blueviolet",
                    3: "cornflowerblue",
                    2: "greenyellow",
                    1: "gray",
                  }[row.stars],
                }}
              >
                {/* <div style={{ marginBottom: '5px'}}>{"⭐".repeat(row.stars)}</div> */}
                <div>
                  {row.name}
                  {/* {row.level ? `+${row.level - 1}` : ""} */}
                </div>
              </span>
            </div>
          );
        },
      },
      {
        name: "Main stat",
        sortable: true,
        sortField: "mainStatKey",
        cell: (row) => {
          const key = row.mainStatKey.replace("Flat ", "").replace("%", "");
          const isPercenrage =
            row.mainStatKey.endsWith("%") ||
            row.mainStatKey?.endsWith("Bonus") ||
            ["Energy Recharge", "Crit RATE", "Crit DMG"].includes(
              row.mainStatKey
            );
          return (
            <div className="nowrap">
              {row.mainStatValue}
              {isPercenrage ? "%" : ""} {key}
            </div>
          );
        },
      },
      ...[0, 1, 2, 3].map((i) => ({
        name: <span className="weak-filler-line" />,
        sortable: true,
        sortFields: allSubstatsInOrder.map((key) => `substats.${key}`),
        colSpan: i === 0 ? 4 : 0,
        width: "100px",
        getDynamicTdClassName: (row: any) => {
          const reordered = getSubstatsInOrder(row);
          const key = reordered?.[i];
          if (!key) return "";
          return normalizeText(key);
        },
        cell: (row: any) => {
          const reordered = getSubstatsInOrder(row);
          const key = reordered?.[i];

          if (!key) return <></>;

          const substatValue = getInGameSubstatValue(row.substats[key], key);
          const isCV = key.includes("Crit");

          return (
            <div
              key={normalizeText(key)}
              className={`substat flex nowrap ${normalizeText(key)} ${
                isCV ? "critvalue" : ""
              }`}
            >
              <span style={{ marginRight: "5px" }}>
                <StatIcon name={key} />
              </span>
              {substatValue}
              {isPercent(key) ? "%" : ""}
            </div>
          );
        },
      })),
      {
        name: "Crit Value",
        sortable: true,
        sortField: "critValue",
        width: "100px",
        cell: (row) => {
          const textColor = getArtifactCvColor(row.critValue);
          return (
            <span style={{ color: textColor }}>{row.critValue.toFixed(1)}</span>
          );
        },
      },
    ],
    []
  );

  // move this somewhere else i think
  const BUILDS_COLUMNS: TableColumn<BuildsColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <span>{row.index}</span>;
        },
      },
      {
        name: "Name",
        sortable: true,
        sortField: "name",
        width: "180px",
        cell: (row) => {
          return (
            <div className="table-icon-text-pair">
              <img className="table-icon" src={row.icon} />
              {row.type !== "current" ? (
                <ReplaceRowDataOnHover data={row.name} onHoverData={row.type} />
              ) : (
                row.name
              )}
            </div>
          );
        },
      },
      {
        name: "Constellation",
        width: "100px",
        sortable: true,
        sortField: "constellation",
        cell: (row) => {
          const constellation = row.constellation ?? 0;

          return (
            <div className="table-icon-text-pair c-badge-wrapper">
              <div className={`c-badge c-${constellation}-badge`}>
                C{constellation}
              </div>
            </div>
          );
        },
      },
      {
        name: "Weapon",
        width: "60px",
        sortable: true,
        sortField: "weapon.name",
        cell: (row) => {
          const refinement =
            (row.weapon.weaponInfo.refinementLevel.value ?? 0) + 1;
          return (
            <WeaponMiniDisplay icon={row.weapon.icon} refinement={refinement} />
          );
        },
      },
      {
        name: "Sets",
        sortField: "artifactSetsFlat",
        sortable: true,
        width: "80px",
        cell: (row) => {
          return <DisplaySets artifactSets={row.artifactSets} />;
        },
      },
      {
        name: "Crit Ratio",
        sortable: true,
        sortFields: ["critValue", "stats.critRate", "stats.critDamage"],
        cell: (row) => {
          return <CritRatio stats={row.stats} overrideCV={row.critValue} />;
        },
      },
      {
        name: "Max HP",
        sortable: true,
        sortField: "stats.maxHp.value",
        cell: (row) => {
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="HP" />
              {row.stats.maxHp.value.toFixed(0)}
            </div>
          );
        },
      },
      {
        name: "ATK",
        sortable: true,
        sortField: "stats.atk.value",
        cell: (row) => {
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="ATK" />
              {row.stats.atk.value.toFixed(0)}
            </div>
          );
        },
      },
      {
        name: "DEF",
        sortable: true,
        sortField: "stats.def.value",
        cell: (row) => {
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="DEF" />
              {row.stats.def.value.toFixed(0)}
            </div>
          );
        },
      },
      {
        name: "EM",
        sortable: true,
        sortField: "stats.elementalMastery.value",
        cell: (row) => {
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="Elemental Mastery" />
              {+row.stats.elementalMastery.value.toFixed(0) || 0}
            </div>
          );
        },
      },
      {
        name: "ER%",
        sortable: true,
        sortField: "stats.energyRecharge.value",
        cell: (row) => {
          return (
            <div className="flex gap-3 nowrap">
              <StatIcon name="Energy Recharge" />
              {(row.stats.energyRecharge.value * 100).toFixed(1)}%
              {/* {(row.stats.energyRecharge.value * 100).toFixed(1)}% */}
            </div>
          );
        },
      },
    ],
    []
  );

  // @TODO: sum them on server side so we can sort by that?
  const sumOfAchievementPoints = responseData.account?.achievements?.reduce(
    (accumulator: any, currentValue: any) =>
      accumulator + currentValue.score * currentValue.count,
    0
  );

  const handleRefreshData = async () => {
    if (!uid) return;
    setEnableRefreshBtn(false);
    const _uid = encodeURIComponent(uid);
    const refreshURL = `/api/user/refresh/${_uid}`;
    const { data } = await axios.get(refreshURL, optsParamsSessionID());

    const {
      ttl,
      ttlMax,
      // message,
    } = data;

    if (ttl === 0) {
      await fetchProfile(uid);
    }
    const getTime = new Date().getTime();
    const then = getTime + (ttl || ttlMax);
    setRefreshTime(then);
    fetchSessionData();
  };

  const handleToggleModal = (event: React.MouseEvent<HTMLElement>) => {
    if (!isAccountOwner) return;
    setShowSettingsModal((prev) => !prev);
    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const displayGenshinCard = useMemo(
    () => (
      <GenshinUserCard
        accountData={responseData}
        isAccountOwner={isAccountOwner}
        handleToggleModal={handleToggleModal}
      />
    ),
    [JSON.stringify(responseData.account), isAccountOwner, handleToggleModal]
  );

  const handleTimerFinish = () => {
    setEnableRefreshBtn(true);
  };

  const handleBindTimerFinish = () => {
    setEnableBindBtn(true);
  };

  const displayFloatingButtons = useMemo(() => {
    const refreshBtnClassName = [
      "floating-button",
      enableRefreshBtn ? "" : "disable-btn",
    ]
      .join(" ")
      .trim();

    const bindBtnClassName = [
      "floating-button",
      enableBindhBtn ? "" : "disable-btn",
    ]
      .join(" ")
      .trim();

    const bindAccount = async (uid?: string) => {
      if (!uid) return;
      setEnableBindBtn(false);
      const _uid = encodeURIComponent(uid);
      const bindAccountURL = `/api/user/bind/${_uid}`;
      const { data } = await axios.post(
        bindAccountURL,
        null,
        optsParamsSessionID()
      );
      setBindSecret(data.secret);
      await fetchProfile(uid);
    };

    const showBindAccBtn = isAuthenticated && !isAccountOwner;

    return (
      <div className="floating-profile-buttons-wrapper">
        <div className="floating-profile-buttons">
          {refreshTime && (
            <Timer
              until={refreshTime}
              label={"refresh in:"}
              onFinish={handleTimerFinish}
            />
          )}
          <div
            title="Refresh builds"
            className={refreshBtnClassName}
            onClick={handleRefreshData}
            key={`refresh-${uid}`}
          >
            <FontAwesomeIcon icon={faRotateRight} size="1x" />
          </div>
          {showBindAccBtn && (
            <>
              {bindTime && (
                <Timer until={bindTime} onFinish={handleBindTimerFinish} />
              )}
              <ConfirmTooltip
                text="Do you want to bind this account?"
                onConfirm={() => bindAccount(uid)}
              >
                <div
                  title="Bind account"
                  className={bindBtnClassName}
                  key={`bind-${uid}`}
                >
                  <FontAwesomeIcon icon={faKey} size="1x" />
                </div>
              </ConfirmTooltip>
            </>
          )}
          {isAccountOwner && (
            <div
              title="Profile settings"
              className="floating-button"
              onClick={handleToggleModal}
              key={`settings-${uid}`}
            >
              <FontAwesomeIcon icon={faGear} size="1x" />
            </div>
          )}
        </div>
      </div>
    );
  }, [
    enableRefreshBtn,
    enableBindhBtn,
    refreshTime,
    isAuthenticated,
    isAccountOwner,
    uid,
  ]);

  const displayBindMessage = useMemo(() => {
    if (!bindTime || !bindSecret) return <></>;
    return (
      <div className="bind-message-wrapper">
        <div className="bind-message">
          <div>
            Time left to bind the account:{" "}
            <span className="important-text">
              <Timer
                removeStyling
                until={bindTime}
                onFinish={() => setBindSecret("")}
              />
            </span>
          </div>
          <div>
            Your binding code is:{" "}
            <span className="important-text">{bindSecret}</span>
          </div>
          <div className="less-important">
            Add binding code to your in-game signature and press refresh button.
          </div>
          <div className="less-important">
            Be aware it might take around 5 minutes for in-game changes to be
            reflected on the profile page.
          </div>
        </div>
      </div>
    );
  }, [bindSecret, enableBindhBtn, bindTime]);

  if (responseData.error) {
    return (
      <div className="error-msg">
        <div className="error-title">{responseData.error.title}</div>
        <div className="error-desc">
          {responseData.error.description
            .split(".")
            .filter((d) => d)
            .map((block) => (
              <div>{block}</div>
            ))}
        </div>
      </div>
    );
  }

  const triggerRefetch = () => setFetchCount((prev) => prev + 1);

  return (
    <div style={cssVariables}>
      {hoverElement}
      {displayBindMessage}
      <div className="flex">
        <div>
          {false &&
            responseData.account?.achievements?.map((achievement: any) => {
              return (
                <div key={achievement.id}>
                  <div
                    className="flex"
                    style={{ gap: "10px", textAlign: "right" }}
                  >
                    <div
                      className="count"
                      style={{ color: "orange", width: "40px" }}
                    >
                      {achievement.count} x
                    </div>
                    <div className="title">
                      {achievement.name}{" "}
                      <span
                        style={{
                          marginLeft: "5px",
                          color: "orange",
                          opacity: 0.33,
                        }}
                      >
                        {achievement.score ?? "---"}p
                      </span>
                    </div>
                  </div>
                  <div style={{ color: "gray", marginLeft: "50px" }}>
                    {achievement.description}
                  </div>
                </div>
              );
            })}
        </div>
        {false && (
          <div
            style={{
              textAlign: "center",
              width: "100%",
              fontWeight: 600,
              marginTop: "20px",
            }}
          >
            Achievement points: {sumOfAchievementPoints ?? "---"}
          </div>
        )}
      </div>
      {displayFloatingButtons}
      <div>
        <div>
          <ProfileSettingsModal
            isOpen={showSettingsModal}
            toggleModal={handleToggleModal}
            accountData={responseData?.account}
            parentRefetchData={triggerRefetch}
          />
        </div>
      </div>
      <div className="flex">
        <div className="content-block w-100 " key={fetchCount}>
          <StylizedContentBlock
            variant="gradient"
            revealCondition={responseData.account}
          />
          <div className="flex gap-10">
            {displayGenshinCard}
            <div className="profile-highlights">
              {responseData.account && <CalculationResultWidget uid={uid} />}
            </div>
          </div>
          {responseData.account && (
            <CustomTable
              fetchURL={FETCH_BUILDS_URL}
              columns={BUILDS_COLUMNS}
              filtersURL={`${FETCH_CHARACTER_FILTERS_URL}?type=profile`}
              defaultSort="critValue"
              expandableRows
              fetchParams={{
                uid: uid,
              }}
            />
          )}
        </div>
      </div>
      <div className="flex">
        <div className="content-block w-100" key={fetchCount}>
          <StylizedContentBlock revealCondition={responseData.account} />
          {responseData.account && (
            <CustomTable
              fetchURL={FETCH_ARTIFACTS_URL}
              columns={ARTIFACT_COLUMNS}
              filtersURL={`${FETCH_ARTIFACT_FILTERS_URL}?type=profile`}
              defaultSort="critValue"
              fetchParams={{
                uid: uid,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
