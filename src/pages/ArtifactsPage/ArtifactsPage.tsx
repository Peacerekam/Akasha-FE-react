import {
  AdsComponentManager,
  AssetFallback,
  CustomTable,
  HelpBox,
  RegionBadge,
  RowIndex,
  StatIcon,
  StylizedContentBlock,
} from "../../components";
import {
  FETCH_ARTIFACTS_URL,
  allSubstatsInOrder,
  getArtifactCvColor,
  getInGameSubstatValue,
  getSubstatsInOrder,
  isEntryNew,
  isPercent,
  normalizeText,
} from "../../utils/helpers";
import {
  FETCH_ARTIFACT_FILTERS_URL,
  getRainbowTextStyle,
} from "../../utils/helpers";
import React, { useContext, useMemo } from "react";

import DomainBackground from "../../assets/images/Tenshukaku_Concept_Art.webp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { TableColumn } from "../../types/TableColumn";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { fixCritValue } from "../../utils/substats";
import { useNavigate } from "react-router-dom";

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
  const { translate } = useContext(TranslationContext);
  const navigate = useNavigate();

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
        name: "Owner",
        sortable: false,
        sortField: "owner.nickname",
        width: "180px",
        cell: (row) => {
          if (!row.owner?.adventureRank) return <></>;
          const isEnkaProfile = isNaN(+row.uid);
          return (
            <a
              className={`row-link-element ${
                isEnkaProfile ? "enka-profile" : ""
              }`}
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${row.uid}`);
              }}
              href={`/profile/${row.uid}`}
            >
              {/* <ARBadge adventureRank={row.owner.adventureRank} /> */}
              <RegionBadge region={row.owner?.region} />
              {row.owner.nickname}
            </a>
          );
        },
      },
      {
        name: "Name",
        sortable: false,
        sortField: "name",
        // sortFields: ["name", "lastArtifactUpdate"],
        width: "300px",
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
              <span
                style={{
                  maxWidth: 245,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                {translate(row.name)}
                {/* {row.level ? `+${row.level - 1}` : ""} */}
              </span>
              {!!row.rerollNum && (
                <FontAwesomeIcon
                  icon={faRotateRight}
                  style={{ top: -2, position: "relative", marginLeft: 5 }}
                />
              )}
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
        sortable: false,
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

          const critValue = fixCritValue(row);
          return <span style={style}>{critValue.toFixed(1)}</span>;
        },
      },
    ],
    [translate]
  );

  return (
    <div className="flex">
      {hoverElement}
      <div className="content-block w-100" id="content-container">
        {/* <NotificationBar /> */}
        <StylizedContentBlock overrideImage={DomainBackground} />
        <div className="flex-special-container">
          <AdsComponentManager adType="Video" />
          <HelpBox page="artifacts" />
        </div>
        {/* <AdsComponentManager
          adType="LeaderboardBTF"
          dataAdSlot="6204085735"
          hybrid="mobile"
          hideOnDesktop
        /> */}
        <CustomTable
          fetchURL={FETCH_ARTIFACTS_URL}
          filtersURL={FETCH_ARTIFACT_FILTERS_URL}
          columns={ARTIFACT_COLUMNS}
          defaultSort="critValue"
          projectParamsToPath
          expandableRows
        />
      </div>
    </div>
  );
};
