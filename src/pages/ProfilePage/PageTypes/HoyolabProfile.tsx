import "../style.scss";

import {
  AbyssSchedule,
  AdsComponentManager,
  CalculationResultWidgetExpander,
  GenshinUserCard,
  LastUpdated,
  StylizedContentBlock,
  Timer,
} from "../../../components";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { abortSignalCatcher, cssJoin } from "../../../utils/helpers";
import axios, { AxiosRequestConfig } from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { AdProviderContext } from "../../../context/AdProvider/AdProviderContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LastProfilesContext } from "../../../context/LastProfiles/LastProfilesContext";
import PerfectScrollbar from "react-perfect-scrollbar";
import { ResponseData } from "../ProfilePage";
import { SessionDataContext } from "../../../context/SessionData/SessionDataContext";
import { SettingsContext } from "../../../context/SettingsProvider/SettingsProvider";
import { TitleContext } from "../../../context/TitleProvider/TitleProviderContext";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { getSessionIdFromCookie } from "../../../utils/helpers";

type TitleAndDescription = {
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

export const HoyolabProfile: React.FC<AkashaProfileProps> = ({
  setBindMessage,
  setEnkaErrorMessage,
  setRelevantProfiles,
  setIsFetchingProfiles,
  setResponseData,
}) => {
  const [enableRefreshBtn, setEnableRefreshBtn] = useState(false);
  const [enableBindBtn, setEnableBindBtn] = useState(false);
  const [bindSecret, setBindSecret] = useState("");
  const [fetchCount, setFetchCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [bindTime, setBindTime] = useState<number>();
  const [refreshTime, setRefreshTime] = useState<number>();
  const [enkaError, setEnkaError] = useState<TitleAndDescription>();
  const [relevantProfiles, _setRelevantProfiles] = useState<any[]>([]);
  const [isFetchingProfiles, _setIsFetchingProfiles] = useState(false);
  const [responseData, _setResponseData] = useState<ResponseData>({
    account: null,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { uid } = useParams();
  const { showcaseState } = useContext(SettingsContext);
  const { disableAdsForThisPage } = useContext(AdProviderContext);
  const { addTab, lastProfiles } = useContext(LastProfilesContext);
  const { setTitle } = useContext(TitleContext);
  const { isAuthenticated, isBound, fetchSessionData, boundAccounts } =
    useContext(SessionDataContext);

  const genshinUID = uid?.slice(1);

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
    const url = `/api/hoyolab/profile/${_uid.slice(1)}`;

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

      if (!data.data.account?.hoyolab && data.data.error) {
        _setResponseData({
          account: null,
          error: data.data.error,
        });
        return;
      } else if (!data.data.account?.hoyolab) {
        _setResponseData({
          account: null,
          error: {
            title: "Encountered an error",
            description: "No HoYoLAB data found",
          },
        });
        return;
      }

      _setResponseData(data.data);

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

      // overwrite binding stuff for combined profiles
      data.bindTTL = 0;
      data.secret = null;

      const thenBindTTL = getTime + data.bindTTL;
      setBindTime(thenBindTTL);
      setEnableBindBtn(data.bindTTL === 0);
      setBindSecret(data.secret);
    };

    await abortSignalCatcher(getSetData);
  };

  const fetchRelevantProfiles = async () => {
    if (!uid) return;

    const _uid = encodeURIComponent(uid?.slice(1));
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
    const nickname = account?.playerInfo?.nickname || "???";
    addTab(uid, nickname);
    setTitle(`${nickname}'s Profile | Akasha System`);
  };

  const fetchInOrder = async () => {
    if (!uid) return;

    fetchRelevantProfiles();
    fetchProfile();
  };

  useEffect(() => {
    _setIsFetchingProfiles(false);
  }, [relevantProfiles]);

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

    if (ttl === 0) {
      await fetchProfile();
    }

    if (data?.data?.error) {
      setEnkaError(data.data.error);
    }

    const getTime = new Date().getTime();
    const then = getTime + (ttl || ttlMax);
    setRefreshTime(then);
    fetchSessionData();
    triggerRefetch();
  };

  const displayGenshinCard = useMemo(
    () => (
      <GenshinUserCard
        accountData={responseData}
        isAccountOwner={isAccountOwner}
      />
    ),
    [JSON.stringify(responseData.account), isAccountOwner, lastProfiles]
  );

  const handleTimerFinish = () => {
    setEnableRefreshBtn(true);
  };

  const displayFloatingButtons = useCallback(
    ({
      refresh = false,
      enkaLink = false,
    }: {
      refresh?: boolean;
      enkaLink?: boolean;
    }) => {
      const DISABLE_FLOATING_BUTTONS = false;
      const defaultBtnClassName = DISABLE_FLOATING_BUTTONS ? "disable-btn" : "";

      const refreshBtnClassName = cssJoin([
        "floating-button",
        defaultBtnClassName,
        enableRefreshBtn ? "" : "disable-btn",
      ]);

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
                lastProfileUpdate={
                  responseData.account?.hoyolab?.lastProfileUpdate
                }
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

      // instead of enka link, do this:
      //   https://www.hoyolab.com/accountCenter/postList?id=12569175
      // or
      //   https://act.hoyolab.com/app/community-game-records-sea/index.html?user_id=12569175

      const hoyoUID = responseData?.account?.hoyolab?.hoyoUID;

      const enkaButton = enkaLink ? (
        <div
          title="View on HoYoLAB"
          className="floating-button enka-button"
          key={`hoyo-link-${hoyoUID}`}
        >
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://act.hoyolab.com/app/community-game-records-sea/index.html?user_id=${hoyoUID}`}
          />
        </div>
      ) : null;

      return (
        <div className="floating-profile-buttons-wrapper">
          <div className="floating-profile-buttons">
            {refreshButton} {/* only for the owner though */}
            {enkaButton}
            {/* some kind of cookie submit button? */}
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
            If you get "contains illegal characters" message then you can
            bypass it by separating the code with spaces (e.g. "123 45").
          </div>
          <div className="less-important">
            Be aware it might take around 5 minutes for in-game changes to be
            reflected on the profile page.
          </div>
        </div>
      </div>
    );
  }, [bindSecret, enableBindBtn, bindTime]);

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
    if (relevantProfiles.length === 0) return;
    setRelevantProfiles(relevantProfiles);
  }, [relevantProfiles]);

  useEffect(() => {
    setIsFetchingProfiles(isFetchingProfiles);
  }, [isFetchingProfiles]);

  useEffect(() => {
    setResponseData(responseData);
  }, [responseData]);

  const profileSummaryFields = [
    {
      label: "Spiral Abyss",
      value: responseData?.account?.hoyolab?.stats?.spiral_abyss,
    },
    {
      label: "Imaginarium Theater",
      prefix: "Act ",
      value: responseData?.account?.hoyolab?.stats?.role_combat?.max_round_id,
    },
    {
      label: "Days Active",
      value: responseData?.account?.hoyolab?.stats?.active_day_number,
    },
    {
      label: "Achievements",
      value: responseData?.account?.hoyolab?.stats?.achievement_number,
    },
    {
      label: "Characters",
      value: responseData?.account?.hoyolab?.stats?.avatar_number,
    },
    {
      label: "Max Friendship",
      value: responseData?.account?.hoyolab?.stats?.full_fetter_avatar_num,
    },
    {
      label: "Waypoints Unlocked",
      value: responseData?.account?.hoyolab?.stats?.way_point_number,
    },
    {
      label: "Domains Unlocked",
      value: responseData?.account?.hoyolab?.stats?.domain_number,
    },
    {
      label: "Pyroculi",
      value: responseData?.account?.hoyolab?.stats?.pyroculus_number,
    },
    {
      label: "Anemoculi",
      value: responseData?.account?.hoyolab?.stats?.anemoculus_number,
    },
    {
      label: "Geoculi",
      value: responseData?.account?.hoyolab?.stats?.geoculus_number,
    },
    {
      label: "Electroculi",
      value: responseData?.account?.hoyolab?.stats?.electroculus_number,
    },
    {
      label: "Dendroculi",
      value: responseData?.account?.hoyolab?.stats?.dendroculus_number,
    },
    {
      label: "Hydroculi",
      value: responseData?.account?.hoyolab?.stats?.hydroculus_number,
    },
    {
      label: "Total oculi",
      value: responseData?.account?.hoyolab?.stats?.total_oculi_number,
    },
    {
      label: "Luxurious Chests",
      value: responseData?.account?.hoyolab?.stats?.luxurious_chest_number,
    },
    {
      label: "Precious Chests",
      value: responseData?.account?.hoyolab?.stats?.precious_chest_number,
    },
    {
      label: "Exquisite Chests",
      value: responseData?.account?.hoyolab?.stats?.exquisite_chest_number,
    },
    {
      label: "Common Chests",
      value: responseData?.account?.hoyolab?.stats?.common_chest_number,
    },
    {
      label: "Remarkable Chests",
      value: responseData?.account?.hoyolab?.stats?.magic_chest_number,
    },
    {
      label: "Total Chests",
      value: responseData?.account?.hoyolab?.stats?.total_chest_number,
    },
  ].filter((x) => x.value || x.value === 0);

  return (
    <div>
      {displayFloatingButtons({
        refresh: true,
        enkaLink: true,
      })}

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
                    "profile-highlights highlight-tile-container hoyolab-highlights-container",
                    showcaseState ? "w-100" : "",
                  ])}
                  style={{ padding: 10 }}
                >
                  <PerfectScrollbar>
                    <div className="hoyolab-highlights gap-10">
                      {responseData.account && (
                        <>
                          {profileSummaryFields.map((field) => {
                            const isChest = field.label.endsWith("Chests");
                            const isOculi = field.label.endsWith("oculi");
                            const isEndgame = [
                              "Spiral Abyss",
                              "Imaginarium Theater",
                            ].includes(field.label);

                            const classNames = cssJoin([
                              "hoyo-highlight-tile",
                              isChest ? "chests-highlight" : "",
                              isOculi ? "oculi-highlight" : "",
                              isEndgame ? "endgame-highlight" : "",
                            ]);

                            return (
                              <div key={field.label} className={classNames}>
                                <div className="hoyo-highlight-tile-value">
                                  {field.prefix || ""}
                                  {field.value}
                                </div>
                                {field.label}
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </PerfectScrollbar>
                </div>

                {responseData?.account && (
                  <div className="relative w-100">
                    <CalculationResultWidgetExpander />
                  </div>
                )}
              </div>

              <AdsComponentManager adType="Video" />

              {/* @TODO: delete this later */}
              {/* <div
                style={{
                  marginLeft: "10px",
                  width: 300,
                  height: 250,
                  border: "solid 1px red",
                  background: "#ff000022",
                }}
              >
                a
              </div> */}
            </div>

            {responseData.account && (
              <div className="enemies-and-materials">
                <div className="big-grid block-highlight">
                  <div className="hoyo-header">
                    Boss Kills ({responseData?.bosses?.totalBossKills} total)
                  </div>
                  <PerfectScrollbar>
                    {/* <div className="flex gap-10">
                      <div
                        style={{ width: 30, rotate: "-45deg", fontSize: 12 }}
                      >
                        sum
                      </div>
                      <div>{responseData?.bosses?.totalBossKills}</div>
                    </div> */}
                    {Object.values(responseData?.bosses?.data || {})
                      ?.sort((a: any, b: any) =>
                        a.kill_num < b.kill_num ? 1 : -1
                      )
                      .map((boss: any) => {
                        return (
                          <div className="flex gap-10" key={boss.name}>
                            <div>
                              <img
                                src={boss.icon}
                                title={boss.name}
                                alt={boss.name}
                                className="table-icon"
                              />
                            </div>
                            <div>{boss.kill_num}</div>
                            {/* <div>{boss.name}</div> */}
                          </div>
                        );
                      })}
                  </PerfectScrollbar>
                </div>

                <div className="big-grid block-highlight">
                  <div className="hoyo-header">
                    Materials ({responseData?.inventory?.totalInventoryCount}{" "}
                    total)
                  </div>
                  <PerfectScrollbar>
                    {/* <div className="flex gap-5">
                      <div
                        style={{ width: 30, rotate: "-45deg", fontSize: 12 }}
                      >
                        sum
                      </div>
                      <div>{responseData?.inventory?.totalInventoryCount}</div>
                    </div> */}
                    {Object.values(responseData?.inventory?.inventory || {})
                      ?.sort((a: any, b: any) => (a.count < b.count ? 1 : -1))
                      .map((item: any) => {
                        return (
                          <div className="flex gap-5" key={item.name}>
                            <div>
                              <img
                                src={item.icon}
                                title={item.name}
                                alt={item.name}
                                className="table-icon"
                              />
                            </div>
                            <div>{item.count}</div>
                            {/* <div>{item.name}</div> */}
                          </div>
                        );
                      })}
                  </PerfectScrollbar>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex">
          <div className={contentBlockClassNames} key={fetchCount}>
            <StylizedContentBlock revealCondition={!!responseData.account} />

            <div
              className="block-highlight"
              style={{ margin: 10, padding: 10 }}
            >
              <AbyssSchedule uid={genshinUID} />
            </div>
          </div>
        </div>

        <div className="flex">
          <div className={contentBlockClassNames} key={fetchCount}>
            <StylizedContentBlock revealCondition={!!responseData.account} />

            <div
              className="block-highlight"
              style={{ margin: 10, padding: 10 }}
            >
              Theater here<div>and there...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
