import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../utils/helpers";
import "./style.scss";

export const NavbarTabs: React.FC = () => {
  const [lastProfiles, setLastProfiles] = useState<any[]>([]);
  const [nicknameMap, setNicknameMap] = useState<any>({});
  const [_timeout, _setTimeout] = useState<any>();
  // @KM: @TODO: consider LocalStorage  for keeping tabs

  const navigate = useNavigate();
  const { pathname } = window.location;

  useEffect(() => {
    if (_timeout) clearTimeout(_timeout);

    const profileURL = "/profile/";
    if (!pathname.includes(profileURL)) return;

    const uid = pathname.replace(profileURL, "").replace("/akasha","")
    if (lastProfiles.includes(uid)) return;

    if (!nicknameMap[uid]) {
      getNickname(uid);
    }

    setLastProfiles((prev) => Array.from(new Set([...prev.slice(-12), uid])));
  }, [pathname]);

  const getNickname = async (uid: string) => {
    const getNicknameURL = `${BACKEND_URL}/api/nickname/${uid}`;
    const { data } = await axios.get(getNicknameURL);
    if (data.data.nickname === null) {
      const _t = setTimeout(() => getNickname(uid), 1000);
      _setTimeout(_t);
    } else {
      setNicknameMap((prev: any) => ({
        ...prev,
        [uid]: data.data.nickname,
      }));
    }
  };

  const removeTab = (uid: string) => {
    setLastProfiles((prev) => {
      const arr = [...prev];
      const index = arr.indexOf(uid);
      if (index > -1) {
        arr.splice(index, 1);
      }
      return arr;
    });
  };

  return (
    <div className="navbar-tabs">
      {lastProfiles.map((uid) => {
        if (!nicknameMap[uid]) return null;
        return (
          <div
            key={`tab-${uid}-${nicknameMap[uid]}`}
            className={`navbar-tab ${
              pathname.endsWith(uid) ? "active-tab" : ""
            }`}
          >
            <a
              // @KM: @TODO: classname fade-in ofsome kind
              href={`/profile/${uid}`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${uid}`);
              }}
            >
              {nicknameMap[uid] ?? uid}
            </a>
            <span
              className="close-tab"
              onClick={(event) => {
                event.preventDefault();
                removeTab(uid);
              }}
            >
              ×
            </span>
          </div>
        );
      })}
    </div>
  );
};
