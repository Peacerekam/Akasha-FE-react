import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  allSubstatsInOrder,
  BACKEND_URL,
  FETCH_ARTIFACTS_URL,
  FETCH_ARTIFACT_FILTERS_URL,
  FETCH_BUILDS_URL,
  FETCH_CHARACTER_FILTERS_URL,
  getArtifactCvColor,
  getInGameSubstatValue,
  getSubstatsInOrder,
  isPercent,
  normalizeText,
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
} from "../../components";
import { CalculationResultWidget } from "../../components/CalculationResultWidget";
import { TableColumn } from "../../types/TableColumn";
import { StylizedContentBlock } from "../../components/StylizedContentBlock";
import "./style.scss";

export const ProfilePage: React.FC = () => {
  //  split into 3 different states later?
  const [data, setData] = useState<{
    artifacts: any[];
    characters: any[];
    account: any;
  }>({ artifacts: [], characters: [], account: null });

  const { uid } = useParams();

  const fetchProfile = async (
    uid: string,
    abortController: AbortController
  ) => {
    try {
      const url = `${BACKEND_URL}/api/user/${uid}`;
      setData({ artifacts: [], characters: [], account: null });

      const opts = {
        signal: abortController?.signal,
      };

      const { data } = await axios.get(url, opts);
      // cancel or reject the promise or requestif theresnew fetch?
      setData(data.data);
    } catch (err) {
      // const typedError = err as Error
      // if (typedError.name !== "CanceledError") return;
      // console.log(typedError);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    if (uid) fetchProfile(uid, abortController);

    return () => {
      abortController.abort();
    };
  }, [uid]);

  const cssVariables = {
    "--name-card-url": `url(${data?.account?.nameCardLink})`,
  } as React.CSSProperties;

  // move this somewhere else i think
  const ARTIFACT_COLUMNS: TableColumn<ArtifactColumns>[] = [
    {
      name: "#",
      width: "0px",
      cell: (row) => {
        return (
          // <div>
          //   <div className="hide-on-table">
          //     <Artifact artifact={row} width={180} />
          //   </div>
          //   <div className="hide-on-custom">
          <span>{row.index}</span>
          //   </div>
          // </div>
        );
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
  ];

  // move this somewhere else i think
  const BUILDS_COLUMNS: TableColumn<BuildsColumns>[] = [
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
        const constellation = row.constellationsIdList
          ? row.constellationsIdList.length
          : 0;

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
      sortField: "critValue",
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
  ];

  // @KM: @TODO: sum them on server side so we can sort by that?
  const sumOfAchievementPoints = data.account?.achievements?.reduce(
    (accumulator: any, currentValue: any) =>
      accumulator + currentValue.score * currentValue.count,
    0
  );

  const renderGenshinCard = useMemo(
    () =>
      data.account?.playerInfo ? (
        <div className="genshin-user-card">
          <img
            className="profile-picture"
            src={data.account.profilePictureLink}
          />
          <div className="genshin-card-content">
            <div className="card-big-text">
              {data.account.playerInfo.nickname}
            </div>
            <div className="card-signature">
              {data.account.playerInfo.signature}
            </div>
          </div>
          <div
            className={`float-top-right ar-badge ar-${
              Math.floor(data.account.playerInfo.level / 5) * 5
            }-badge`}
          >
            AR{data.account.playerInfo.level}
          </div>
        </div>
      ) : (
        <div className="genshin-user-card">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Spinner />
          </div>
        </div>
      ),
    [JSON.stringify(data.account)]
  );

  return (
    <div style={cssVariables}>
      {true ? (
        <>
          <div className="flex">
            <div>
              {false &&
                data.account?.achievements?.map((achievement: any) => {
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

          <div className="flex">
            <div className="content-block w-100 ">
              <StylizedContentBlock
                variant="gradient"
                revealCondition={data.account}
              />
              <div className="flex gap-10 nowrap">
                {renderGenshinCard}
                <div className="profile-highlights">
                  {data.account && <CalculationResultWidget uid={uid} />}
                </div>
              </div>
              {data.account && (
                <CustomTable
                  fetchURL={FETCH_BUILDS_URL}
                  columns={BUILDS_COLUMNS}
                  filtersURL={FETCH_CHARACTER_FILTERS_URL}
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
            <div className="content-block w-100">
              <StylizedContentBlock revealCondition={data.account} />
              {data.account && (
                <CustomTable
                  fetchURL={FETCH_ARTIFACTS_URL}
                  columns={ARTIFACT_COLUMNS}
                  filtersURL={FETCH_ARTIFACT_FILTERS_URL}
                  defaultSort="critValue"
                  fetchParams={{
                    uid: uid,
                  }}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="spinner-wrapper">
          <Spinner />
        </div>
      )}
    </div>
  );
};
