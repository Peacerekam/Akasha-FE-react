import "./style.scss";

import {
  CalculationResultWidget,
  ConfirmTooltip,
  CritRatio,
  CustomTable,
  DisplaySets,
  GenshinUserCard,
  LastUpdated,
  ReplaceRowDataOnHover,
  StatIcon,
  StylizedContentBlock,
  Timer,
  WeaponMiniDisplay,
} from "../../components";
import {
  FETCH_ARTIFACTS_URL,
  FETCH_ARTIFACT_FILTERS_URL,
  FETCH_BUILDS_URL,
  FETCH_CHARACTER_FILTERS_URL,
  abortSignalCatcher,
  allSubstatsInOrder,
  getArtifactCvColor,
  getGenderFromIcon,
  getInGameSubstatValue,
  getRainbowTextStyle,
  getRelevantCharacterStats,
  getSubstatsInOrder,
  isPercent,
  normalizeText,
  optsParamsSessionID,
} from "../../utils/helpers";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyModalBodyStyle,
  getRelativeCoords,
} from "../../components/CustomTable/Filters";
import {
  faGear,
  faKey,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { AdsComponentManager } from "../../components/AdsComponentManager";
import { ArtifactColumns } from "../ArtifactsPage";
import { ArtifactSettingsModal } from "./ArtifactSettingsModal";
import { BuildSettingsModal } from "./BuildSettingsModal";
import { BuildsColumns } from "../BuildsPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { TableColumn } from "../../types/TableColumn";
import { TitleContext } from "../../context/TitleProvider/TitleProviderContext";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import axios from "axios";
import { getSessionIdFromCookie } from "../../utils/helpers";
import { useParams } from "react-router-dom";

type TitleAndDescription = {
  title: string;
  description: string;
};

type ResponseData = {
  account: any;
  error?: TitleAndDescription;
};

export const ProfilePage: React.FC = () => {
  const [showArtifactSettingsModal, setShowArtifactSettingsModal] =
    useState(false);
  const [showBuildSettingsModal, setShowBuildSettingsModal] = useState(false);
  const [enableRefreshBtn, setEnableRefreshBtn] = useState(false);
  const [enableBindBtn, setEnableBindBtn] = useState(false);
  const [bindSecret, setBindSecret] = useState("");
  const [fetchCount, setFetchCount] = useState(0);
  const [bindTime, setBindTime] = useState<number>();
  const [refreshTime, setRefreshTime] = useState<number>();
  const [enkaError, setEnkaError] = useState<TitleAndDescription>();
  const [responseData, setResponseData] = useState<ResponseData>({
    account: null,
  });

  const { uid } = useParams();
  const { hoverElement } = useContext(HoverElementContext);
  const { disableAdsForThisPage, adProvider } = useContext(AdProviderContext);
  const { addTab, lastProfiles } = useContext(LastProfilesContext);
  const { setTitle } = useContext(TitleContext);
  const { translate } = useContext(TranslationContext);
  const { isAuthenticated, isBound, fetchSessionData, boundAccounts } =
    useContext(SessionDataContext);

  const isAccountOwner = useMemo(
    () => isBound(uid),
    [uid, isAuthenticated, boundAccounts]
  );

  const refreshAbortController = useMemo(() => new AbortController(), [uid]);

  const fetchProfile = async (
    uid: string,
    abortController?: AbortController
  ) => {
    const _uid = encodeURIComponent(uid);
    const url = `/api/user/${_uid}`;
    setResponseData({ account: null });
    setEnkaError(undefined);

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

      if (!data?.data?.account?.playerInfo?.nickname) {
        await handleRefreshData();
      }

      if (data.data?.account?.patreon?.active) {
        disableAdsForThisPage();
      }

      const getTime = new Date().getTime();
      const thenTTL = getTime + data.ttl;
      setRefreshTime(thenTTL);
      setEnableRefreshBtn(data.ttl === 0);

      const thenBindTTL = getTime + data.bindTTL;
      setBindTime(thenBindTTL);
      setEnableBindBtn(data.bindTTL === 0);
      setBindSecret(data.secret);
    };

    await abortSignalCatcher(getSetData);
  };

  const handleAddNewTab = ({ account }: any) => {
    if (!uid) return;
    const nickname = account?.playerInfo?.nickname || "???";
    addTab(uid, nickname);
    setTitle(`${nickname}'s Profile | Akasha System`);
  };

  useEffect(() => {
    const abortController = new AbortController();
    if (uid) fetchProfile(uid, abortController);

    return () => {
      abortController.abort();
      refreshAbortController.abort();
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
              <img alt=" " className="table-icon" src={row.icon} />{" "}
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
                  {translate(row.name)}
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

          const mainStatValue = isPercenrage
            ? Math.round(row.mainStatValue * 10) / 10
            : Math.round(row.mainStatValue);

          return (
            <div className="nowrap">
              {mainStatValue}
              {isPercenrage ? "%" : ""} {translate(key)}
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
              <span className="mr-3">
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
          const textColor = getArtifactCvColor(row);
          let style = {} as React.CSSProperties;

          if (textColor === "rainbow") {
            style = getRainbowTextStyle();
          } else {
            style.color = textColor;
          }

          return <span style={style}>{row.critValue.toFixed(1)}</span>;
        },
      },
    ],
    [translate]
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
          const gender = getGenderFromIcon(row.icon);
          const characterName = translate(row.name, gender);

          return (
            <div className="table-icon-text-pair">
              <img alt=" " className="table-icon" src={row.icon} />
              {row.type !== "current" ? (
                <ReplaceRowDataOnHover
                  data={characterName}
                  onHoverData={row.type}
                />
              ) : (
                characterName
              )}
            </div>
          );
        },
      },
      {
        // name: adProvider === "playwire" ? "" : "Constellation",
        // width: adProvider === "playwire" ? "70px" : "100px",
        name: "Constellation",
        width: "70px",
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
        // name: adProvider === "playwire" ? "" : "Weapon",
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
        width: "90px",
        sortable: false,
        // sortField: "artifactSetsFlat",
        cell: (row) => {
          return <DisplaySets artifactSets={row.artifactSets} />;
        },
      },
      {
        name: "Crit Ratio",
        // width: adProvider === "playwire" ? "150px" : "170px",
        width: "150px",
        sortable: true,
        sortFields: [
          "critValue",
          "stats.critRate.value",
          "stats.critDamage.value",
        ],
        cell: (row) => {
          return <CritRatio row={row} overrideCV={row.critValue} />;
        },
      },
      ...[0, 1, 2, 3].map((i) => ({
        name: <span className="weak-filler-line" />,
        sortable: true,
        // sortFields: allSubstatsInOrder.map((key) => `stats.${key}.value`),
        sortFields: [
          "stats.maxHp.value",
          "stats.atk.value",
          "stats.def.value",
          "stats.elementalMastery.value",
          "stats.energyRecharge.value",
          "stats.hydroDamageBonus.value",
          "stats.geoDamageBonus.value",
          "stats.pyroDamageBonus.value",
          "stats.cryoDamageBonus.value",
          "stats.electroDamageBonus.value",
          "stats.anemoDamageBonus.value",
          "stats.dendroDamageBonus.value",
          "stats.physicalDamageBonus.value",
          "stats.healingBonus.value",
        ],
        colSpan: i === 0 ? 4 : 0,
        width: "80px",
        // getDynamicTdClassName: (row: any) => {
        //   const reordered = getSubstatsInOrder(row);
        //   const key = reordered?.[i];
        //   if (!key) return "";
        //   return normalizeText(key);
        // },
        cell: (row: any) => {
          const relevantStats = getRelevantCharacterStats(row);

          const _stat = relevantStats?.[i];
          if (!_stat) return <></>;

          const isPercent =
            _stat.name.includes("Bonus") || _stat.name === "Energy Recharge";

          let _value = _stat.value !== null ? +_stat.value : _stat.value;

          if (["Healing Bonus", "Energy Recharge"].includes(_stat.name)) {
            _value *= 100;
          }

          _value = _value?.toFixed(isPercent ? 1 : 0);

          if (_value === "-0" || _value === "-0.0") {
            _value = "0";
          }

          return (
            <div
              key={normalizeText(_stat.name)}
              className={`character-stat flex nowrap ${normalizeText(
                _stat.name.replace("%", "")
              )}`}
            >
              <span className="mr-3">
                <StatIcon name={_stat.name.replace("%", "")} />
              </span>
              {_value}
              {isPercent ? "%" : ""}
              {/* {_stat.name} */}
            </div>
          );
        },
      })),
    ],
    [translate, adProvider]
  );

  // @TODO: sum them on server side so we can sort by that?
  const sumOfAchievementPoints = responseData?.account?.achievements?.reduce(
    (accumulator: any, currentValue: any) =>
      accumulator + currentValue.score * currentValue.count,
    0
  );

  const handleRefreshData = async () => {
    if (!uid) return;
    setEnableRefreshBtn(false);
    const _uid = encodeURIComponent(uid);
    const refreshURL = `/api/user/refresh/${_uid}`;

    const opts = {
      signal: refreshAbortController?.signal,
      ...optsParamsSessionID(),
    };

    const { data } = await axios.get(refreshURL, opts);

    const {
      ttl,
      ttlMax,
      // message,
    } = data;

    if (ttl === 0) {
      await fetchProfile(uid);
    }

    if (data?.data?.error) {
      setEnkaError(data.data.error);
    }

    const getTime = new Date().getTime();
    const then = getTime + (ttl || ttlMax);
    setRefreshTime(then);
    fetchSessionData();
  };

  const handleToggleBuildsModal = (event: React.MouseEvent<HTMLElement>) => {
    if (!isAccountOwner) return;
    setShowBuildSettingsModal((prev) => !prev);
    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const handleToggleArtifactsModal = (event: React.MouseEvent<HTMLElement>) => {
    if (!isAccountOwner) return;
    setShowArtifactSettingsModal((prev) => !prev);
    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const displayGenshinCard = useMemo(
    () => (
      <GenshinUserCard
        accountData={responseData}
        isAccountOwner={isAccountOwner}
        handleToggleModal={handleToggleBuildsModal}
      />
    ),
    [
      JSON.stringify(responseData.account),
      isAccountOwner,
      handleToggleBuildsModal,
      lastProfiles,
    ]
  );

  const handleTimerFinish = () => {
    setEnableRefreshBtn(true);
  };

  const handleBindTimerFinish = () => {
    setEnableBindBtn(true);
  };

  const displayFloatingButtons = useCallback(
    ({
      refresh = false,
      bind = false,
      buildSettings = false,
      artifactSettings = false,
      enkaLink = false,
    }: {
      refresh?: boolean;
      bind?: boolean;
      buildSettings?: boolean;
      artifactSettings?: boolean;
      enkaLink?: boolean;
    }) => {
      const DISABLE_FLOATING_BUTTONS = false;
      const defaultBtnClassName = DISABLE_FLOATING_BUTTONS ? "disable-btn" : "";

      const settingsBtnClassName = ["floating-button", defaultBtnClassName]
        .join(" ")
        .trim();

      const refreshBtnClassName = [
        "floating-button",
        defaultBtnClassName,
        enableRefreshBtn ? "" : "disable-btn",
      ]
        .join(" ")
        .trim();

      const bindBtnClassName = [
        "floating-button",
        defaultBtnClassName,
        enableBindBtn ? "" : "disable-btn",
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

      const getTimestamp = () => {
        if (!refreshTime) return 0;
        const now = new Date().getTime();
        const then = refreshTime - now;
        return then;
      };

      const refreshButton = refresh ? (
        <>
          {refreshTime && getTimestamp() > 0 ? (
            <Timer
              until={refreshTime}
              label={"refresh cooldown:"}
              onFinish={handleTimerFinish}
            />
          ) : (
            <LastUpdated
              label="last update"
              lastProfileUpdate={responseData.account?.lastProfileUpdate}
            />
          )}
          <div
            title="Refresh builds"
            className={refreshBtnClassName}
            onClick={() => abortSignalCatcher(handleRefreshData)}
            key={`refresh-${uid}-${!!enableRefreshBtn}`}
          >
            <FontAwesomeIcon icon={faRotateRight} size="1x" />
          </div>
        </>
      ) : null;

      const bindingButton = bind ? (
        <>
          {showBindAccBtn && (
            <>
              {bindTime ? (
                <Timer until={bindTime} onFinish={handleBindTimerFinish} />
              ) : null}
              <ConfirmTooltip
                text="Do you want to bind this account?"
                onConfirm={() => bindAccount(uid)}
                className={
                  !enableBindBtn || DISABLE_FLOATING_BUTTONS
                    ? "pointer-events-none"
                    : ""
                }
              >
                <div
                  title="Bind account"
                  className={bindBtnClassName}
                  key={`bind-${uid}-${defaultBtnClassName}`}
                >
                  <FontAwesomeIcon icon={faKey} size="1x" />
                </div>
              </ConfirmTooltip>
            </>
          )}
        </>
      ) : null;

      const enkaButton = enkaLink ? (
        <div
          title="View on enka.network"
          className="floating-button enka-button"
          key={`enka-link-${uid}`}
        >
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://enka.network/u/${uid}`}
          />
        </div>
      ) : null;

      const buildSettingsButton = buildSettings ? (
        <>
          {isAccountOwner ? (
            <div
              title="Build settings"
              className={settingsBtnClassName}
              onClick={handleToggleBuildsModal}
              key={`settings-builds-${uid}`}
            >
              <FontAwesomeIcon icon={faGear} size="1x" />
            </div>
          ) : null}
        </>
      ) : null;

      const artifactSettingsButton = artifactSettings ? (
        <>
          {isAccountOwner ? (
            <div
              title="Artifact settings"
              className="floating-button"
              onClick={handleToggleArtifactsModal}
              key={`settings-artifacts-${uid}`}
            >
              <FontAwesomeIcon icon={faGear} size="1x" />
            </div>
          ) : null}
        </>
      ) : null;

      return (
        <div className="floating-profile-buttons-wrapper">
          <div className="floating-profile-buttons">
            {refreshButton}
            {enkaButton}
            {bindingButton}
            {buildSettingsButton}
            {artifactSettingsButton}
          </div>
        </div>
      );
    },
    [
      responseData,
      enableRefreshBtn,
      enableBindBtn,
      refreshTime,
      isAuthenticated,
      isAccountOwner,
      uid,
    ]
  );

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
  }, [bindSecret, enableBindBtn, bindTime]);

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

  const contentBlockClassNames = [
    "content-block w-100",
    responseData.account?.patreon?.active ? "patreon-profile" : "",
  ]
    .join(" ")
    .trim();

  const displayEnkaErrorMessage = enkaError ? (
    <div className="bind-message-wrapper flex">
      <div className="bind-message">
        <div>{enkaError.title}</div>
        <div>
          <span className="important-text">{enkaError.description}</span>
        </div>
        <div className="less-important enka-status-link">
          Enka.network API status can be checked{" "}
          <a
            href={`http://status.enka.network/`}
            rel="noreferrer"
            target="_blank"
          >
            here
          </a>
          .
        </div>
      </div>
    </div>
  ) : (
    ""
  );

  return (
    <div style={cssVariables}>
      {hoverElement}
      {displayEnkaErrorMessage}
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
      {displayFloatingButtons({
        bind: true,
        refresh: true,
        buildSettings: true,
        enkaLink: true,
      })}
      <div>
        {isAccountOwner && (
          <BuildSettingsModal
            isOpen={showBuildSettingsModal}
            toggleModal={handleToggleBuildsModal}
            accountData={responseData?.account}
            parentRefetchData={triggerRefetch}
          />
        )}
      </div>

      <div id="content-container">
        <div className="flex">
          <div className={contentBlockClassNames} key={fetchCount}>
            {/* <NotificationBar /> */}
            {/* <PatreonBorderInside
              classNames={[responseData.account?.patreon?.active ? "" : "hide"]}
              style={{
                transform: "translate(-10px, -10px)",
                width: "calc(100% - 20px)",
                height: "calc(100% - 20px)",
              }}
              animationSpeedMultiplier={2}
            /> */}
            <StylizedContentBlock
              variant="gradient"
              revealCondition={responseData.account}
            />
            <div className="flex profile-header-wrapper">
              <div className="flex gap-10 profile-header">
                {displayGenshinCard}
                <div className="profile-highlights">
                  {responseData.account && (
                    <CalculationResultWidget uid={uid} />
                  )}
                </div>
              </div>
              <AdsComponentManager adType="Video" />
            </div>
            {responseData.account && (
              <CustomTable
                growContentOnExpandedRow
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
        {/* <div className="flex">
          {!reloadAds && (
            <div className="flex-special-container">
              <AdsComponentManager
                adType="LeaderboardBTF"
                dataAdSlot="6204085735"
                hybrid="mobile"
                hideOnDesktop
              />
            </div>
          )}
        </div> */}
        {displayFloatingButtons({ artifactSettings: true })}
        <div>
          {isAccountOwner && (
            <ArtifactSettingsModal
              isOpen={showArtifactSettingsModal}
              toggleModal={handleToggleArtifactsModal}
              accountData={responseData?.account}
              parentRefetchData={triggerRefetch}
            />
          )}
        </div>
        <div className="flex">
          <div className={contentBlockClassNames} key={fetchCount}>
            {/* <PatreonBorderInside
              classNames={[responseData.account?.patreon?.active ? "" : "hide"]}
              style={{
                transform: "translate(-10px, -10px)",
                width: "calc(100% - 20px)",
                height: "calc(100% - 20px)",
              }}
              animationSpeedMultiplier={2}
            /> */}
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
    </div>
  );
};
