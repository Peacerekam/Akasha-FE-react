import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  CustomTable,
  StylizedContentBlock,
  AdsComponent,
  RegionBadge,
  ARBadge,
  HelpBox,
} from "../../components";
import { TableColumn } from "../../types/TableColumn";

import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import {
  FETCH_ACCOUNTS_FILTERS_URL,
  FETCH_ACCOUNTS_URL,
  uidsToQuery,
} from "../../utils/helpers";
import { HoverElementContext } from "../../context/HoverElement/HoverElementContext";
import { showAds } from "../../App";
import { BuildsColumns } from "../BuildsPage";
import { LastProfilesContext } from "../../context/LastProfiles/LastProfilesContext";
import { debounce } from "lodash";
import "./style.scss";

export const AccountsPage: React.FC = () => {
  const { hoverElement } = useContext(HoverElementContext);
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const { lastProfiles } = useContext(LastProfilesContext);

  const [inputUID, setInputUID] = useState<string>("");
  const [lookupUID, setLookupUID] = useState<string>("");
  const debouncedSetLookupUID = useCallback(debounce(setLookupUID, 350), []);

  useEffect(() => {
    debouncedSetLookupUID(inputUID);
  }, [inputUID]);

  const ACCOUNTS_COLUMNS: TableColumn<BuildsColumns>[] = useMemo(
    () => [
      {
        name: "#",
        width: "0px",
        cell: (row) => {
          return <div>{row.index}</div>;
        },
      },
      {
        name: "Nickname",
        sortField: "playerInfo.nickname",
        width: "180px",
        sortable: false,
        cell: (row) => {
          // if (!row.playerInfo?.level) return <></>;

          return (
            <a
              className="row-link-element"
              onClick={(event) => {
                event.preventDefault();
                navigate(`/profile/${row.uid}`);
              }}
              href={`/profile/${row.uid}`}
            >
              {/* <ARBadge adventureRank={row.owner.adventureRank} /> */}
              <RegionBadge region={row.playerInfo.region} />
              {row.playerInfo.nickname}
            </a>
          );
        },
      },
      {
        name: "Signature",
        sortable: false,
        sortField: "playerInfo.signature",
        width: "300px",
        cell: (row) => {
          const signature = row?.playerInfo?.signature || "";
          return (
            <div
              style={{
                width: 300,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {signature}
            </div>
          );
        },
      },
      {
        name: "Adventure Rank",
        sortable: true,
        sortField: "playerInfo.level",
        width: "100px",
        cell: (row) => {
          const adventureRank = row?.playerInfo.level || 0;
          return (
            <div>
              <ARBadge adventureRank={adventureRank} />
            </div>
          );
        },
      },
      {
        name: "Achievements",
        sortable: true,
        sortField: "playerInfo.finishAchievementNum",
        cell: (row) => {
          const finishAchievementNum =
            Math.round(row.playerInfo?.finishAchievementNum) ?? 0;

          return <div>{finishAchievementNum}</div>;
        },
      },
      {
        name: "Unique Characters",
        sortable: false,
        sortField: "ownedCharacters",
        cell: (row) => {
          const ownedCharacters = row?.ownedCharacters || "";
          return <div>{ownedCharacters?.length}</div>;
        },
      },
      // {
      //   name: "Badges",
      //   sortable: false,
      //   sortField: "---",
      //   cell: (row) => {
      //     const achievements = row.achievements ?? [];
      //     const badges = achievements
      //       // .map((a: any) => `${a.count}× "${a.name}"`)
      //       .map((a: any) => `${a.count}× ...`)
      //       .join(", ");

      //     return <div style={{ whiteSpace: "nowrap" }}>{badges}</div>;
      //   },
      // },
      // {
      //   name: "Akasha Score",
      //   sortable: true,
      //   sortField: "---",
      //   cell: (row) => {
      //     console.log(row);
      //     const score = "" + Math.random();
      //     return <div>{score.slice(2, 8)}</div>;
      //   },
      // },
    ],
    [lookupUID]
  );

  return (
    <div className="flex">
      {showAds && <AdsComponent dataAdSlot="6204085735" />}
      {hoverElement}
      <div className="content-block w-100">
        <StylizedContentBlock overrideImage={DomainBackground} />
        <HelpBox page="accounts" />
        {/* @TODO: different helpbox */}
        {/* <HelpBox page="builds" /> */}
        <div className="relative search-input-wrapper">
          UID / nickname
          <div>
            <div className="search-input relative">
              <input
                defaultValue={inputUID}
                onChange={(event) => {
                  setInputUID(event.target.value);
                }}
              />
              {!inputUID && (
                <span className="fake-placeholder">type here...</span>
              )}
            </div>
          </div>
        </div>
        {lookupUID && (
          <div className="lookup-not-found-prompt">
            <div>
              Don't see <i>"{lookupUID}"</i> on the list? Click{" "}
              <Link to={`/profile/${lookupUID}`}>here</Link> to load the profile
              into Akasha System.
            </div>{" "}
            Make sure your data is available on Enka.Network first:{" "}
            <a href={`https://enka.network/u/${lookupUID}/`}>
              https://enka.network/u/{lookupUID}/
            </a>
          </div>
        )}
        <div>
          <CustomTable
            fetchURL={FETCH_ACCOUNTS_URL}
            fetchParams={{
              uids: uidsToQuery(lastProfiles.map((a) => a.uid)),
              uid: lookupUID,
              // variant,
              // filter: "[all]1",
              // calculationId: currentCategory,
            }}
            columns={ACCOUNTS_COLUMNS}
            defaultSort="playerInfo.finishAchievementNum"
            ignoreEmptyUidsArray
            alwaysShowIndexColumn
            expandableRows
            // hidePagination
          />

          {/* spacer */}
          <div style={{ marginTop: "30px" }} />

          <CustomTable
            fetchURL={FETCH_ACCOUNTS_URL}
            filtersURL={FETCH_ACCOUNTS_FILTERS_URL}
            columns={ACCOUNTS_COLUMNS}
            defaultSort="playerInfo.finishAchievementNum"
            // expandableRows
            projectParamsToPath
            expandableRows
          />
        </div>
      </div>
      {showAds && <AdsComponent dataAdSlot="6204085735" />}
    </div>
  );
};
