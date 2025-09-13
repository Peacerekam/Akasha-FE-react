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
import WelkinMoon from "../../assets/images/WelkinMoon.webp";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

// import WelkinMoon1 from "../../assets/images/WelkinMoon.png";
// import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";

const INFO_URL = "/api/giveaway/info";
const JOIN_URL = "/api/giveaway/join";

type Winner = { uid: string; date: number; isRequestedUID: boolean };
type GiveawayInfo = {
  id?: string;
  until?: number;
  count?: number;
  participated?: boolean;
  winnersList?: Winner[];
  winnersThisGiveaway?: number;
};

type GiveawayProps = {
  TEST_MODE?: boolean;
};

export const Giveaway: React.FC<GiveawayProps> = ({ TEST_MODE = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [giveawayInfo, setGiveawayInfo] = useState<GiveawayInfo>({});
  const [winnersList, setWinnersList] = useState<Winner[]>([]);
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

  const relevantUID = boundAccounts.find(
    (acc) => acc?.discord?.id || acc?.patreon?.id
  )?.uid;

  const handleParticipate = async () => {
    if (!canParticipate || participated) return;

    try {
      setIsLoading(true);
      let reqUrl = `${JOIN_URL}/${giveawayInfo?.id}`;
      if (relevantUID) reqUrl += `?uid=${relevantUID}`;

      const { data } = await axios.post(reqUrl, null, getHeaders());

      if (data?.message === "Success") {
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
      } else {
        console.log(data);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleGetInfo = async () => {
    try {
      let reqUrl = `${INFO_URL}`;
      if (relevantUID) reqUrl += `?uid=${relevantUID}`;

      const { data } = await axios.get(reqUrl, getHeaders());

      if (data.error) {
        console.log(data.error);
        if (data?.winnersList) {
          setWinnersList(data?.winnersList);
        }
        return;
      }

      setGiveawayInfo(data.data);
      setParticipated(data.data.participated);
      setWinnersList(data.data.winnersList);

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
  }, [relevantUID, sessionFetched, giveawayInfo, location.pathname]);

  const DEBUG_MODE = location.search?.includes("debug");
  // if (!DEBUG_MODE) return <></>;

  if (!giveawayInfo?.id || !giveawayInfo?.until) {
    const now = new Date().getTime();
    const _24h = 1000 * 60 * 60 * 24;
    const _48h = 2 * _24h;

    // const _24hAfterEvent = winnersList?.[winnersList.length - 1]?.date + _24h;
    const _48hAfterEvent = winnersList?.[0]?.date + _48h;

    if (now > _48hAfterEvent) return <></>;

    if (winnersList.length > 0) {
      return (
        <div className="relative content-block patreon-profile giveaway-wrapper">
          <StylizedContentBlock overrideImage={GiveawayBg} />
          <div className="giveaway-container show-winners">
            {/* <div className="block-highlight w-100 flex">  */}

            <img
              alt="Welkin Moon"
              className="welkin-girl"
              src={WelkinMoon}
              width={150}
            />
            <div className="show-winners-child">
              <h2>Welkin Moon giveaway is over</h2>
              <div>
                Congratulations to the winners, you will be contacted soon
                through <FontAwesomeIcon icon={faDiscord} size="1x" />
                Discord or <FontAwesomeIcon icon={faPatreon} size="1x" />
                Patreon.
              </div>
              <div>
                If you didn't win, you can look forward to future giveaways!
              </div>
              <div className="winners">
                <span>Past {winnersList.length} winners: </span>
                {winnersList.map((x, i) => (
                  <span
                    key={x.uid}
                    className={x.isRequestedUID ? "highlight" : ""}
                  >
                    {x.uid}
                    {i !== winnersList.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>

            {/* </div> */}
          </div>
        </div>
      );
    }
    return <></>;
  }

  const winnersEl =
    winnersList.length > 0 ? (
      <div className="winners">
        <span>Past {winnersList.length} winners: </span>
        {winnersList.map((x, i) => (
          <span key={x.uid} className={x.isRequestedUID ? "highlight" : ""}>
            {x.uid}
            {i !== winnersList.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    ) : (
      ""
    );

  const playHEVC = supportsHEVCAlpha();
  const extension = playHEVC && isMobile ? ".gif" : playHEVC ? ".mov" : ".webm";
  const welkinGirlURL = `${axios.defaults.baseURL}/public/welkin-transparent${extension}`;
  const wCount = giveawayInfo?.winnersThisGiveaway || 1;

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
                <div>You have successfully participated in the giveaway</div>
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
                <b>
                  {wCount} winner{wCount === 1 ? "" : "s"}
                </b>{" "}
                will be selected randomly. If you're in Akasha Discord or
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
