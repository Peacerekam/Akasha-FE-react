import { useEffect, useState } from "react";

import axios from "axios";

// import PerfectScrollbar from "react-perfect-scrollbar";

type AbyssMonster = {
  name: string;
  icon: string;
  level: number;
};

type Chamber = {
  index: number;
  star: number;
  max_star: number;
  battles: {
    index: number;
    timestamp: string;
    avatars: {
      id: number;
      icon: string;
      level: number;
      rarity: number;
    }[];
    settle_date_time: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
    };
  }[];
  top_half_floor_monster: AbyssMonster[];
  bottom_half_floor_monster: AbyssMonster[];
};

type AbyssData = {
  floorIndex: number;
  schedule_id: string;
  uid: string;
  hoyoUID: string;
  abyssData: {
    schedule_id: number;
    start_time: string;
    end_time: string;
    total_star: number;
  };
  floorData: {
    index: number;
    star: number;
    max_star: number;
    levels: Chamber[];
  };
};

type AbyssScheduleProps = {
  uid?: string;
  schedule?: number | string;
};

export const AbyssSchedule: React.FC<AbyssScheduleProps> = ({ uid }) => {
  const [abyssData, setAbyssData] = useState<AbyssData[]>();

  const fetchData = async () => {
    try {
      if (!uid) return;

      const FETCH_ABYSS_URL = `/api/hoyolab/abyss/${uid}`;
      const response = await axios.get(FETCH_ABYSS_URL);

      const data = response?.data?.data;
      if (!data) return;

      setAbyssData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [uid]);

  return (
    <div
      // style={{ display: abyssData ? "block" : "none" }}
      className={"relative w-100"}
    >
      {/* @TODO: PerfectScrollbar ?? */}
      <div className="flex w-100" style={{ justifyContent: "space-around" }}>
        {abyssData ? (
          <>
            {/*  <PerfectScrollbar
             options={{
               suppressScrollY: true,
               // suppressScrollX: false,
             }}
           > */}
            {abyssData.map((x) => {
              return (
                <div
                  key={`${x.schedule_id}-${x.floorData.index}`}
                  style={{ margin: 20, width: 400 }}
                >
                  <div>Schedule: {x.schedule_id}</div>
                  <div>
                    Floor {x.floorIndex} - {x.floorData.star}/
                    {x.floorData.max_star}
                  </div>
                  <div className="">
                    {x.floorData.levels.map((ch) => {
                      const enemies = [
                        ch.top_half_floor_monster,
                        ch.bottom_half_floor_monster,
                      ];

                      // const isSolo =
                      // const isContinious =

                      return (
                        <div
                          key={ch.index}
                          className="mt-20"
                          style={{ background: "#ffffff15", padding: 15 }}
                        >
                          <div>
                            {ch.index} {"*".repeat(ch.star)}
                          </div>
                          <div
                            className="flex"
                            style={{ justifyContent: "space-between" }}
                          >
                            {ch.battles.map((battle, i) => {
                              return (
                                <div key={battle.timestamp}>
                                  <div
                                    className="flex"
                                    style={{
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 2,
                                    }}
                                  >
                                    {battle.avatars.map((av, j) => {
                                      return (
                                        <div key={`${av.icon}-${j}`}>
                                          {/* {av.id} */}
                                          <img
                                            style={{ width: 40 }}
                                            alt=""
                                            src={av.icon}
                                          />
                                        </div>
                                      );
                                    })}
                                    {battle.avatars.length < 4 &&
                                      Array(4 - battle.avatars.length)
                                        .fill(null)
                                        .map((_, k) => (
                                          <div
                                            key={`fill-${k}`}
                                            style={{
                                              width: 40,
                                              height: 40,
                                              opacity: 0.33,
                                              border: "1px solid darkgray",
                                              background: "#00000090",
                                              borderRadius: 6,
                                            }}
                                          ></div>
                                        ))}
                                  </div>
                                  {/* <div
                                    style={{
                                      // display: "none",
                                      marginLeft: 10,
                                      marginRight: 10,
                                      fontSize: 12,
                                    }}
                                  >
                                    vs
                                  </div> */}
                                  <div
                                    className="flex flex-wrap"
                                    style={{
                                      // display: "none",
                                      marginTop: 10,
                                      maxWidth: 180,
                                      justifyContent: "center",
                                      gap: 2,
                                    }}
                                  >
                                    {enemies[i].map((mob, i) => (
                                      <img
                                        key={`${mob.icon}-${i}`}
                                        style={{ width: 25 }}
                                        alt=""
                                        src={mob.icon}
                                        title={mob.name}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* </PerfectScrollbar> */}
          </>
        ) : null}
      </div>
    </div>
  );
};
