import React, { useContext, useMemo } from "react";

import {
  allSubstatsInOrder,
  FETCH_ARTIFACTS_URL,
  getArtifactCvColor,
  getInGameSubstatValue,
  getSubstatsInOrder,
  isPercent,
  normalizeText,
} from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import { CustomTable, HelpBox, StatIcon, StylizedContentBlock } from "../../components";
import { ARBadge } from "../LeaderboardsPage";
import { TableColumn } from "../../types/TableColumn";

import DomainBackground from "../../assets/images/domain-background.jpg";
import { FETCH_ARTIFACT_FILTERS_URL } from "../../utils/helpers";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { BASENAME } from "../../App";

export type ArtifactColumns = {
  _id: string;
  uid: string;
  name: string;
  setName: string;
  stars: 1 | 2 | 3 | 4 | 5;
  substats: any[];
  critValue: number;
  icon: string;
  nickname: string;
  [key: string]: any;
};

export const ArtifactsPage: React.FC = () => {
  const { hoverElement } = useContext(HoverElementContext);
  const navigate = useNavigate();

  const pathname = window.location.pathname;

  const ARTIFACT_COLUMNS: TableColumn<ArtifactColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return (
            <div className="hide-on-custom">
              <span>{row.index}</span>
            </div>
          );
        },
      },
      {
        name: "Owner",
        sortable: true,
        sortField: "owner.nickname",
        width: "180px",
        cell: (row) => {
          if (!row.owner?.adventureRank) return <></>;
          return (
            <a
              className="row-link-element"
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${row.uid}`);
              }}
              href={`${BASENAME}/profile/${row.uid}`}
            >
              <ARBadge adventureRank={row.owner.adventureRank} />
              {row.owner.nickname}
            </a>
          );
        },
      },
      {
        name: "Name",
        sortable: true,
        sortField: "name",
        width: "300px",
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
            ["Energy Recharge"].includes(row.mainStatKey);
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

  return (
    <div className="flex">
      {hoverElement}
      <div className="content-block w-100">
        <StylizedContentBlock overrideImage={DomainBackground} />
        <HelpBox page="artifacts" />
        <CustomTable
          fetchURL={FETCH_ARTIFACTS_URL}
          filtersURL={FETCH_ARTIFACT_FILTERS_URL}
          columns={ARTIFACT_COLUMNS}
          defaultSort="critValue"
          projectParamsToPath
        />
      </div>
    </div>
  );
};
