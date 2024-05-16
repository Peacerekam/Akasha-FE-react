import "./style.scss";

import React, { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

import { Link } from "react-router-dom";
import Markdown from "react-markdown";
import { Spinner } from "../../components";
import remarkGfm from "remark-gfm";
import { timeAgo } from "../../utils/helpers";

export const NewsDisplay: React.FC = () => {
  const [newsData, setNewsData] = useState<any[]>();
  const [error, setError] = useState<string>();

  const fetchNews = async (abortController: AbortController) => {
    const notificationURL = `/api/news`;
    const opts: AxiosRequestConfig<any> = { signal: abortController?.signal };

    try {
      const { data } = await axios.get(notificationURL, opts);
      if (!data?.data) return;

      setNewsData(data.data);
    } catch (err) {
      setError("Failed to fetch the news");
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchNews(abortController);

    return () => {
      abortController.abort();
    };
  }, []);

  const maybeTimestampToRelative = (val: string) => {
    if (!val.startsWith("<t:") && !val.endsWith(":R>")) {
      return val;
    }

    const formatter = new Intl.RelativeTimeFormat(`en`, { style: "long" });
    const now = +new Date() / 1000 / 60 / 60 / 24;
    const _timestamp = +("" + val).slice(3, -3);
    const then = _timestamp / 60 / 60 / 24;
    const days = then - now;
    const absDays = Math.abs(days);

    let output = ""

    if (absDays > 1) {
      output = formatter.format(+days.toFixed(0), "days");
    }

    if (absDays * 24 < 1) {
      output = formatter.format(+(days * 24 * 60).toFixed(0), "minutes");
    }

    if (absDays < 1) {
      output = formatter.format(+(days * 24).toFixed(0), "hours");
    }

    const staticTimestamp = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const statisTimestampDisplay = staticTimestamp.format(_timestamp * 1000);

    output = formatter.format(+days.toFixed(0), "days");
    output += ` (${statisTimestampDisplay})`;

    return `\`${output}\``;
  };

  const maybeRelatifyTimestamps = (acc: string, val: string) => {
    val = maybeTimestampToRelative(val);
    return acc + ` ${val}`;
  };
  
  const displayDiscordLikeMessage = (message: any) => {
    const avatarBaseURL = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}`;

    const isAnimated = message.author.avatar.startsWith("a_");
    const avatarURL = `${avatarBaseURL}.png`;
    const avatarGifURL = `${avatarBaseURL}.gif`;

    const createdAt = timeAgo(message.createdAt);
    const editedAt = timeAgo(message.editedAt);
    const profileLink = "/profile/701464050";

    const content = message?.content
      ?.split(" ")
      .reduce(maybeRelatifyTimestamps, "");

    return (
      <div className="discord-like-msg" key={message.messageID}>
        <div className="discord-like-left">
          <Link to={profileLink}>
            <img src={avatarURL} className="static-pfp" alt="pfp" />
            {isAnimated && (
              <img src={avatarGifURL} className="animated-pfp" alt="pfp" />
            )}
          </Link>
        </div>
        <div className="discord-like-right">
          <div className="discord-like-username">
            {/* Mimee */}
            <div>
              <Link to={profileLink}>{message.author.name}</Link>
            </div>
            {/* Today at 6:66 */}
            {/* 01/02/2024 16:20 */}
            <div title={message.editedAt ? `Edited - ${editedAt}` : createdAt}>
              {createdAt}
            </div>
          </div>
          <div className="discord-like-content">
            <Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
              {content}
            </Markdown>
            {message.editedAt && (
              <span className="discord-like-edited-at" title={editedAt}>
                (edited){/* Monday, 5 January 2024 14:53 */}
                {/* {editedAt} */}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative news">
      <div className="discord-like-wrapper">
        {newsData ? (
          newsData?.map(displayDiscordLikeMessage)
        ) : (
          <div className="spinner-wrapper">{error || <Spinner />}</div>
        )}
      </div>
    </div>
  );
};
