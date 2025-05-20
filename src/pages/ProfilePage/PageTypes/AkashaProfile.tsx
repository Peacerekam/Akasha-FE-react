import "../style.scss";

import {
  AssetFallback,
  CalculationResultWidget,
  CalculationResultWidgetExpander,
  ConfirmTooltip,
  CritRatio,
  CustomTable,
  DisplaySets,
  GenshinUserCard,
  LastUpdated,
  ReplaceRowDataOnHover,
  RowIndex,
  StatIcon,
  StylizedContentBlock,
  Timer,
  WeaponMiniDisplay,
} from "../../../components";
import {
  FETCH_ARTIFACTS_URL,
  FETCH_ARTIFACT_FILTERS_URL,
  FETCH_BUILDS_URL,
  FETCH_CHARACTER_FILTERS_URL,
  abortSignalCatcher,
  allSubstatsInOrder,
  applyModalBodyStyle,
  cssJoin,
  getArtifactCvColor,
  getGenderFromIcon,
  getInGameSubstatValue,
  getRainbowTextStyle,
  getRelativeCoords,
  getRelevantCharacterStats,
  getSubstatsInOrder,
  isEntryNew,
  isPercent,
  normalizeText,
  timeAgo,
  uidsToQuery,
} from "../../../utils/helpers";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios, { AxiosRequestConfig } from "axios";
import {
  faGear,
  faKey,
  faLock,
  faLockOpen,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { AdProviderContext } from "../../../context/AdProvider/AdProviderContext";
import { AdsComponentManager } from "../../../components/AdsComponentManager";
import { ArtifactColumns } from "../../ArtifactsPage";
import { ArtifactSettingsModal } from "../ArtifactSettingsModal";
import { BuildPreview } from "../BuildPreview";
import { BuildSettingsModal } from "../BuildSettingsModal";
import { BuildsColumns } from "../../BuildsPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LastProfilesContext } from "../../../context/LastProfiles/LastProfilesContext";
import { ProfileCharts } from "../ProfileCharts";
import { ResponseData } from "../ProfilePage";
import { SessionDataContext } from "../../../context/SessionData/SessionDataContext";
import { SettingsContext } from "../../../context/SettingsProvider/SettingsProvider";
import { TableColumn } from "../../../types/TableColumn";
import { TitleContext } from "../../../context/TitleProvider/TitleProviderContext";
import { TranslationContext } from "../../../context/TranslationProvider/TranslationProviderContext";
import { fixCritValue } from "../../../utils/substats";
import { getSessionIdFromCookie } from "../../../utils/helpers";

export type TitleAndDescription = {
  title: string;
  description: string;
};

type AkashaProfileProps = {
  setBindMessage: React.Dispatch<React.SetStateAction<JSX.Element | undefined>>;
  setRelevantProfiles: React.Dispatch<React.SetStateAction<any[]>>;
  setIsFetchingProfiles: React.Dispatch<React.SetStateAction<boolean>>;
  setResponseData: React.Dispatch<React.SetStateAction<ResponseData>>;
  setEnkaErrorMessage: React.Dispatch<
    React.SetStateAction<JSX.Element | undefined>
  >;
};

export const AkashaProfile: React.FC<AkashaProfileProps> = ({
  setBindMessage,
  setEnkaErrorMessage,
  setRelevantProfiles,
  setIsFetchingProfiles,
  setResponseData,
}) => {
  const [showArtifactSettingsModal, setShowArtifactSettingsModal] =
    useState(false);
  const [showBuildSettingsModal, setShowBuildSettingsModal] = useState(false);
  const [enableRefreshBtn, setEnableRefreshBtn] = useState(false);
  const [enableBindBtn, setEnableBindBtn] = useState(false);
  const [bindSecret, setBindSecret] = useState("");
  const [fetchCount, setFetchCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [bindTime, setBindTime] = useState<number>();
  const [refreshTime, setRefreshTime] = useState<number>();
  const [enkaError, setEnkaError] = useState<TitleAndDescription>();
  const [_relevantProfiles, _setRelevantProfiles] = useState<any[]>([]);
  const [_isFetchingProfiles, _setIsFetchingProfiles] = useState(false);
  const [responseData, _setResponseData] = useState<ResponseData>({
    account: null,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { uid } = useParams();
  const { showcaseState } = useContext(SettingsContext);
  const { disableAdsForThisPage, adProvider } = useContext(AdProviderContext);
  const { addTab, removeTab, lastProfiles } = useContext(LastProfilesContext);
  const { setTitle } = useContext(TitleContext);
  const { translate } = useContext(TranslationContext);
  const { isAuthenticated, isBound, fetchSessionData, boundAccounts } =
    useContext(SessionDataContext);

  const DEBUG_MODE = location.search?.includes("debug");

  const isCombined = uid?.startsWith("@");

  const isAccountOwner = useMemo(
    () => isBound(uid),
    [uid, isAuthenticated, boundAccounts]
  );

  const abortControllers = useMemo(
    () => ({
      // since they all abort at once, why
      // not use just a single one instead?
      profile: new AbortController(),
      refresh: new AbortController(),
      profiles: new AbortController(),
    }),
    [uid]
  );

  const fetchProfile = async (overrideUID?: string) => {
    if (!uid) return;
    const _uid = encodeURIComponent(overrideUID || uid);
    const url = `/api/user/${_uid}`;

    _setResponseData({ account: null });
    setEnkaError(undefined);

    const opts: AxiosRequestConfig<any> = {
      signal: abortControllers.profile.signal,
      headers: {
        Authorization: `Bearer ${getSessionIdFromCookie()}`,
      },
    };

    const getSetData = async () => {
      const { data } = await axios.get(url, opts);

      _setResponseData(data.data);
      handleAddNewTab(data.data);

      if (
        !data?.data?.account?.playerInfo?.nickname &&
        !data?.data?.account?.playerInfo?.level
      ) {
        await handleRefreshData();
      }

      if (data.data?.account?.patreon?.active) {
        disableAdsForThisPage();
      }

      const getTime = new Date().getTime();
      const thenTTL = getTime + data.ttl;
      setRefreshTime(thenTTL);
      setEnableRefreshBtn(data.ttl === 0);

      if (isCombined) {
        // overwrite binding stuff for combined profiles
        data.bindTTL = 0;
        data.secret = null;
      }

      const thenBindTTL = getTime + data.bindTTL;
      setBindTime(thenBindTTL);
      setEnableBindBtn(data.bindTTL === 0);
      setBindSecret(data.secret);
    };

    await abortSignalCatcher(getSetData);
  };

  const fetchRelevantProfiles = async () => {
    if (!uid) return;

    const _uid = encodeURIComponent(isCombined ? uid?.slice(1) : uid);
    const relevantProfilesURL = `/api/getRelevantProfiles/${_uid}`;

    const opts: AxiosRequestConfig<any> = {
      signal: abortControllers.profiles.signal,
      headers: {
        Authorization: `Bearer ${getSessionIdFromCookie()}`,
      },
    };

    const { data } = await axios.get(relevantProfilesURL, opts);
    _setRelevantProfiles(data.data || []);

    const defaultUID = data?.data?.find(
      (x: any) => x?.defaultProfile
    )?.defaultProfile;

    return defaultUID;
  };

  const handleAddNewTab = ({ account }: any) => {
    if (!uid) return;
    const nickname = account?.playerInfo?.nickname;

    if (nickname) {
      addTab(uid, nickname);
      setTitle(`${nickname}'s Profile | Akasha System`);
    } else {
      setTitle(`Unknown Profile | Akasha System`);
    }
  };

  const fetchInOrder = async () => {
    if (!uid) return;

    if (isCombined) {
      _setResponseData({ account: null });
      const defaultUID = await fetchRelevantProfiles();
      fetchProfile(defaultUID);
    } else {
      fetchRelevantProfiles();
      fetchProfile();
    }
  };

  useEffect(() => {
    _setIsFetchingProfiles(false);
  }, [_relevantProfiles]);

  useEffect(() => {
    // no need to fetch on initial page load
    if (fetchCount === 0) return;

    // fetchCount increment means builds count display is outdated
    fetchRelevantProfiles();
  }, [fetchCount]);

  useEffect(() => {
    fetchInOrder();
    _setIsFetchingProfiles(true);
    setInitialLoad(false);

    if (!initialLoad) {
      navigate("", { replace: true, state: location.state }); // clear URL filters
    }

    return () => {
      Object.values(abortControllers).forEach((ac) => ac.abort());
    };
  }, [uid]);

  // move this somewhere else i think
  const ARTIFACT_COLUMNS: TableColumn<ArtifactColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <RowIndex index={row.index} />;
        },
      },
      {
        name: "Name",
        sortable: true,
        // sortField: "name",
        sortFields: ["name", "lastArtifactUpdate"],
        cell: (row) => {
          const isNew = isEntryNew(row?.lastArtifactUpdate);

          const _content = (
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
          );

          return (
            <div className="table-icon-text-pair">
              <AssetFallback alt=" " className="table-icon" src={row.icon} />{" "}
              {isNew ? (
                <>
                  <span className="new-lb-badge" />
                  {_content}
                </>
              ) : (
                _content
              )}
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

          // return <Artifact artifact={row} width={275} />;
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

          const critValue = fixCritValue(row);
          return <span style={style}>{critValue.toFixed(1)}</span>;
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
          return <RowIndex index={row.index} />;
        },
      },
      {
        name: "Name",
        sortable: true,
        // sortField: "name",
        sortFields: ["name", "sortableType", "lastBuildUpdate"],
        width: "180px",
        cell: (row) => {
          const gender = getGenderFromIcon(row.icon);
          const characterName = translate(row.name, gender);
          const updatedAtLabel =
            (row?.lastBuildUpdate || 0) < 1000
              ? characterName
              : `${characterName} - ${timeAgo(row?.lastBuildUpdate)}`;

          const isNew = isEntryNew(row?.lastBuildUpdate);

          const _content =
            row.type !== "current" ? (
              <ReplaceRowDataOnHover
                data={characterName}
                onHoverData={row.type}
              />
            ) : (
              characterName
            );

          return (
            <div className={"table-icon-text-pair"} title={updatedAtLabel}>
              <AssetFallback
                alt=" "
                title={updatedAtLabel}
                className="table-icon"
                src={row.icon}
              />
              {isNew ? (
                <>
                  <span className="new-lb-badge" />
                  {_content}
                </>
              ) : (
                _content
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
            (row.weapon.weaponInfo?.refinementLevel?.value ?? 0) + 1;

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

  const handleRefreshData = async () => {
    if (!uid) return;
    setEnableRefreshBtn(false);
    const _uid = encodeURIComponent(uid);
    const refreshURL = `/api/user/refresh/${_uid}`;

    const opts: AxiosRequestConfig<any> = {
      signal: abortControllers.refresh.signal,
      headers: {
        Authorization: `Bearer ${getSessionIdFromCookie()}`,
      },
    };

    const { data } = await axios.get(refreshURL, opts);

    const {
      ttl,
      ttlMax,
      // message,
    } = data;

    if (data?.data?.error) {
      setEnkaError(data.data.error);
      removeTab(uid);
    }

    if (ttl === 0) {
      await fetchProfile();
    }

    const getTime = new Date().getTime();
    const then = getTime + (ttl || ttlMax);
    setRefreshTime(then);
    fetchSessionData();
    triggerRefetch();
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
      lock = false,
      buildSettings = false,
      artifactSettings = false,
      enkaLink = false,
    }: {
      refresh?: boolean;
      bind?: boolean;
      lock?: boolean;
      buildSettings?: boolean;
      artifactSettings?: boolean;
      enkaLink?: boolean;
    }) => {
      const DISABLE_FLOATING_BUTTONS = false;
      const defaultBtnClassName = DISABLE_FLOATING_BUTTONS ? "disable-btn" : "";

      const settingsBtnClassName = cssJoin([
        "floating-button",
        defaultBtnClassName,
      ]);

      const refreshBtnClassName = cssJoin([
        "floating-button",
        defaultBtnClassName,
        enableRefreshBtn ? "" : "disable-btn",
      ]);

      const bindBtnClassName = cssJoin([
        "floating-button",
        defaultBtnClassName,
        enableBindBtn ? "" : "disable-btn",
      ]);

      // /api/user/toggleLockProfile/:uid

      const bindAccount = async () => {
        if (!uid) return;
        setEnableBindBtn(false);
        const _uid = encodeURIComponent(uid);
        const bindAccountURL = `/api/user/bind/${_uid}`;
        const { data } = await axios.post(bindAccountURL, null, {
          headers: {
            Authorization: `Bearer ${getSessionIdFromCookie()}`,
          },
        });
        setBindSecret(data.secret);
        await fetchProfile();
      };

      const toggleLockAccount = async () => {
        if (!uid) return;
        const _uid = encodeURIComponent(uid);
        const lockAccountURL = `/api/user/toggleLockProfile/${_uid}`;
        await axios.post(lockAccountURL, null, {
          headers: {
            Authorization: `Bearer ${getSessionIdFromCookie()}`,
          },
        });
        await fetchProfile();
      };

      const showBindAccBtn = isAuthenticated && !isAccountOwner;
      const showLockAccBtn = isAuthenticated && isAccountOwner;

      const isAccountLoaded = !!responseData?.account;
      const isAccountLocked = !!responseData?.account?.locked;

      const getTimestamp = () => {
        if (!refreshTime) return 0;
        const now = new Date().getTime();
        const then = refreshTime - now;
        return then;
      };

      const refreshButton =
        !isAccountLocked && isAccountLoaded && refresh ? (
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

      const bindingButton =
        !isAccountLocked && isAccountLoaded && bind ? (
          <>
            {showBindAccBtn && (
              <>
                {bindTime ? (
                  <Timer until={bindTime} onFinish={handleBindTimerFinish} />
                ) : null}
                <ConfirmTooltip
                  text="Do you want to bind this profile?"
                  onConfirm={bindAccount}
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

      const lockButton =
        isAccountLoaded && lock ? (
          <>
            {showLockAccBtn && (
              <>
                <ConfirmTooltip
                  text={`Do you want to ${
                    isAccountLocked ? "unlock" : "lock"
                  } this profile?`}
                  onConfirm={toggleLockAccount}
                  className={
                    !enableBindBtn || DISABLE_FLOATING_BUTTONS
                      ? "pointer-events-none"
                      : ""
                  }
                >
                  <div
                    title={isAccountLocked ? "Unlock profile" : "Lock profile"}
                    className={bindBtnClassName}
                    key={`lock-${uid}-${defaultBtnClassName}`}
                  >
                    <FontAwesomeIcon
                      icon={isAccountLocked ? faLockOpen : faLock}
                      size="1x"
                    />
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
            {!isCombined && refreshButton}
            {!isCombined && lockButton}
            {!isCombined && enkaButton}
            {!isCombined && bindingButton}
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

  const relevantProfilesQuery = useMemo(() => {
    const _uids = _relevantProfiles
      .map((x) => x.uid)
      .filter((x) => !x.startsWith("@"));
    return uidsToQuery(_uids);
  }, [JSON.stringify(_relevantProfiles)]);

  const triggerRefetch = () => setFetchCount((prev) => prev + 1);

  const contentBlockClassNames = cssJoin([
    "content-block w-100",
    responseData.account?.patreon?.active ? "patreon-profile" : "",
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
  }, [bindSecret, enableBindBtn, bindTime, isCombined]);

  const displayEnkaErrorMessage = useMemo(() => {
    if (!enkaError) return <></>;

    return (
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
    );
  }, [enkaError]);

  useEffect(() => {
    setBindMessage(displayEnkaErrorMessage);
  }, [displayEnkaErrorMessage]);

  useEffect(() => {
    setEnkaErrorMessage(displayBindMessage);
  }, [displayBindMessage]);

  useEffect(() => {
    // if (relevantProfiles.length === 0) return;
    setRelevantProfiles(_relevantProfiles);
  }, [_relevantProfiles]);

  useEffect(() => {
    setIsFetchingProfiles(_isFetchingProfiles);
  }, [_isFetchingProfiles]);

  useEffect(() => {
    setResponseData(responseData);
  }, [responseData]);

  const isZy0x = uid === "603089931";
  const zy0xVid = (
    <div className="zy0x-lol">
      <video
        src={`${axios.defaults.baseURL}/public/xiao_nudes_lmao.mp4`}
        controls
      />
      <div>{":-)"}</div>
    </div>
  );

  return (
    <div>
      {displayFloatingButtons({
        bind: true,
        lock: true,
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
            uids={isCombined ? relevantProfilesQuery : undefined}
          />
        )}
      </div>

      <div id="content-container">
        <div className="flex">
          <div className={contentBlockClassNames} key={fetchCount}>
            <StylizedContentBlock
              variant="gradient"
              revealCondition={!!responseData.account}
            />
            <div className="flex profile-header-wrapper">
              <div className="flex gap-10 profile-header">
                {displayGenshinCard}
                <div
                  className={cssJoin([
                    "profile-highlights",
                    showcaseState ? "w-100" : "",
                  ])}
                >
                  {responseData.account && (
                    <CalculationResultWidget
                      uid={uid}
                      uids={isCombined ? relevantProfilesQuery : undefined}
                      expanded={showcaseState}
                    />
                  )}
                </div>
                {responseData?.account && (
                  <div className="relative w-100">
                    <CalculationResultWidgetExpander />
                  </div>
                )}
              </div>

              {isZy0x ? zy0xVid : <AdsComponentManager adType="Video" />}

              {responseData?.account && <BuildPreview />}

              {responseData?.account &&
                (DEBUG_MODE ||
                  (["701464050", "mimee", "@mimee"].includes(uid || "") &&
                    false)) && ( // @TODO: false :)
                  <ProfileCharts debug={DEBUG_MODE} />
                )}
            </div>
            {responseData.account && (
              <CustomTable
                projectParamsToPath
                growContentOnExpandedRow
                fetchURL={FETCH_BUILDS_URL}
                columns={BUILDS_COLUMNS}
                filtersURL={`${FETCH_CHARACTER_FILTERS_URL}?type=profile`}
                defaultSort="critValue"
                expandableRows
                fetchParams={{
                  uid: isCombined ? uid?.slice(1) : uid,
                  uids: isCombined ? relevantProfilesQuery : "",
                }}
              />
            )}
          </div>
        </div>

        {displayFloatingButtons({ artifactSettings: true })}

        <div>
          {isAccountOwner && (
            <ArtifactSettingsModal
              isOpen={showArtifactSettingsModal}
              toggleModal={handleToggleArtifactsModal}
              accountData={responseData?.account}
              parentRefetchData={triggerRefetch}
              uids={isCombined ? relevantProfilesQuery : undefined}
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
            <StylizedContentBlock revealCondition={!!responseData.account} />
            {responseData.account && (
              <CustomTable
                fetchURL={FETCH_ARTIFACTS_URL}
                columns={ARTIFACT_COLUMNS}
                filtersURL={`${FETCH_ARTIFACT_FILTERS_URL}?type=profile`}
                defaultSort="critValue"
                fetchParams={{
                  uid: isCombined ? uid?.slice(1) : uid,
                  uids: isCombined ? relevantProfilesQuery : "",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
