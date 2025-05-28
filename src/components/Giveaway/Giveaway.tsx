import "./style.scss";

import {
  LOOTBAR_URL,
  cssJoin,
  getSessionIdFromCookie,
  supportsHEVCAlpha,
} from "../../utils/helpers";
import axios, { AxiosRequestConfig } from "axios";
import { faDiscord, faPatreon } from "@fortawesome/free-brands-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GiveawayBg from "../../assets/images/welkinbg.jpg";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { Spinner } from "../Spinner";
import { StylizedContentBlock } from "../StylizedContentBlock";
import { Timer } from "../Timer";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

// import WelkinMoon1 from "../../assets/images/WelkinMoon.png";
// import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
// import WelkinMoon2 from "../../assets/images/WelkinMoon.webp";

const INFO_URL = "/api/giveaway/info";
const JOIN_URL = "/api/giveaway/join";

type GiveawayInfo = {
  id?: string;
  until?: number;
  count?: number;
  participated?: boolean;
  winnersList?: string[];
};

type GiveawayProps = {
  TEST_MODE?: boolean;
};

export const Giveaway: React.FC<GiveawayProps> = ({ TEST_MODE = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [giveawayInfo, setGiveawayInfo] = useState<GiveawayInfo>({});
  const [participated, setParticipated] = useState(false);
  const { isMobile } = useContext(AdProviderContext);
  const { isAuthenticated, boundAccounts, sessionFetched } =
    useContext(SessionDataContext);

  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isBound = boundAccounts.length > 0;

  const canParticipate =
    TEST_MODE ||
    (giveawayInfo?.participated ? false : isAuthenticated && isBound);

  const getHeaders = (): AxiosRequestConfig<any> => {
    return {
      headers: {
        Authorization: `Bearer ${getSessionIdFromCookie()}`,
      },
    };
  };

  const inGameUidFirst = (a: any, b: any) => (isNaN(a.uid) ? 1 : -1);
  const firstUID = boundAccounts.sort(inGameUidFirst)?.[0]?.uid;

  const handleParticipate = async () => {
    if (!canParticipate || participated) return;

    try {
      setIsLoading(true);
      let reqUrl = `${JOIN_URL}/${giveawayInfo?.id}`;
      if (firstUID) reqUrl += `?uid=${firstUID}`;

      const { data } = await axios.post(reqUrl, null, getHeaders());

      if (data?.message === "Something went wrong") {
        setIsLoading(false);
      } else {
        videoRef?.current?.play();

        setTimeout(() => {
          if (participated) return;
          if (canParticipate) setParticipated(true);
          setIsLoading(false);
          setGiveawayInfo((prev) => ({
            ...prev,
            count: (prev?.count || 0) + 1,
          }));
        }, 2500);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleGetInfo = async () => {
    try {
      let reqUrl = `${INFO_URL}`;
      if (firstUID) reqUrl += `?uid=${firstUID}`;

      const { data } = await axios.get(reqUrl, getHeaders());

      if (data.error) {
        console.log(data.error);
        return;
      }

      setGiveawayInfo(data.data);
      setParticipated(data.data.participated);

      // hides the giveaway when it ends
      if (data.data?.until) {
        const ms = data.data.until - new Date().getTime();
        setTimeout(() => setGiveawayInfo({}), ms);
      }
    } catch (err: any) {
      console.log(err?.response?.data?.error || err);
    }
  };

  useEffect(() => {
    if (!sessionFetched) return;
    if (!giveawayInfo?.id) {
      handleGetInfo();
    }
  }, [firstUID, sessionFetched, giveawayInfo, location.pathname]);

  const DEBUG_MODE = location.search?.includes("debug");
  // if (!DEBUG_MODE) return <></>;

  if (!giveawayInfo?.id || !giveawayInfo?.until) {
    return <></>;
  }

  const playHEVC = supportsHEVCAlpha();
  const extension = playHEVC && isMobile ? ".gif" : playHEVC ? ".mov" : ".webm";
  const welkinGirlURL = `${axios.defaults.baseURL}/public/welkin-transparent${extension}`;

  const winners = giveawayInfo?.winnersList || [];
  const winnersEl =
    winners.length > 0 ? (
      <div className="winners">Past winners: {winners.join(", ")}</div>
    ) : (
      ""
    );

  return (
    <div className="relative content-block patreon-profile giveaway-wrapper">
      <StylizedContentBlock overrideImage={GiveawayBg} />
      <div className="giveaway-container">
        <div
          tabIndex={0}
          onClick={handleParticipate}
          className={cssJoin([
            "flex block-highlight",
            participated ? "participated" : "",
            !participated && canParticipate ? "clickable" : "",
            isLoading ? "is-loading" : "",
          ])}
        >
          <div className="relative">
            {playHEVC && isMobile ? (
              <img alt="Welkin Moon" src={welkinGirlURL} />
            ) : (
              <video
                muted
                ref={videoRef}
                className="relative"
                // autoPlay={participated}
                src={welkinGirlURL}
                onClick={() => {
                  if (!TEST_MODE) return;
                  videoRef?.current?.play();
                }}
                // onEnded={() => {
                //   if (participated) return;
                //   if (canParticipate) setParticipated(true);
                //   setIsLoading(false);
                //   setGiveawayInfo((prev) => ({
                //     ...prev,
                //     count: (prev?.count || 0) + 1,
                //   }));
                // }}
              />
            )}
          </div>
          <div className="relative" style={{ maxWidth: 560 }}>
            {DEBUG_MODE ? (
              <div>
                <div>playHEVC: {playHEVC + ""}</div>
                <div>{welkinGirlURL}</div>
              </div>
            ) : (
              ""
            )}
            <h2>
              <div>Welkin Moon giveaway ends</div>
              <div>
                in <Timer until={giveawayInfo.until} removeStyling />
              </div>
            </h2>
            {isLoading && (
              <div className="spinner-wrapper visible">
                <Spinner />
              </div>
            )}
            {participated ? (
              <div>
                <div>You have succefully participated in the giveaway</div>
              </div>
            ) : (
              <div>
                <ol>
                  <li
                    className={
                      TEST_MODE || isAuthenticated ? "strike-through" : ""
                    }
                  >
                    <div>
                      Authenticate with{" "}
                      <FontAwesomeIcon icon={faDiscord} size="1x" /> Discord or{" "}
                      <FontAwesomeIcon icon={faPatreon} size="1x" /> Patreon.
                    </div>
                  </li>
                  <li
                    className={
                      TEST_MODE || isBound ? "strike-through clickable" : ""
                    }
                  >
                    <div>
                      Bind <FontAwesomeIcon icon={faKey} size="1x" /> your
                      Akasha profile.
                    </div>
                  </li>
                  <li>
                    <div>
                      Confirm participation by{" "}
                      <span
                        className={
                          canParticipate ? "enabled-btn" : "disabled-btn"
                        }
                      >
                        clicking here
                      </span>
                      .
                    </div>
                  </li>
                </ol>
              </div>
            )}

            <div className="disclaimers">
              <div>
                Only one entry per profile. Current participants:{" "}
                <b>{giveawayInfo.count}</b>.
              </div>
              <div>
                Winner will be selected randomly. If you're in Akasha Discord or
                Patreon member you will be contacted shortly after the giveaway
                ends, if contact cannot be established then Welkin Moon will be
                given automatically through{" "}
                <a href={LOOTBAR_URL} target="_blank" rel="noreferrer">
                  Lootbar.gg
                </a>
                .
              </div>
              {winnersEl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
