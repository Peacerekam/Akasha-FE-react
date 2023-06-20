import axios from "axios";
import { debounce } from "lodash";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StylizedContentBlock } from "../../components/StylizedContentBlock";
import {
  AccountDataForUserCard,
  AdsComponent,
  FetchParams,
  GenshinUserCard,
  Pagination,
  Spinner,
} from "../../components";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import { FETCH_COLLECTION_SIZE_URL } from "../../utils/helpers";
import { AdsComponentManager } from "../../components/AdsComponentManager";
import "./style.scss";

export const UIDSearchPage: React.FC = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [searchUID, setSearchUID] = useState("");
  const [results, setResults] = useState<AccountDataForUserCard[]>([]);
  const [totalRowsHash, setTotalRowsHash] = useState<string>("");
  const [totalRowsCount, setTotalRowsCount] = useState<number>(0);
  const navigate = useNavigate();

  const defaultParams = {
    sort: "",
    order: -1,
    size: 9,
    page: 1,
  };
  const [params, setParams] = useState<FetchParams>(defaultParams);

  const fetchAccounts = useCallback(
    async (providedUID: string) => {
      if (!providedUID?.trim()) {
        setResults([]);
        return;
      }

      setIsFetching(true);

      // const onlyNumbersUID = providedUID.replace(/[^0-9]+/, "");
      const isValidUID = true; // onlyNumbersUID.length === 9;

      // const typedResult = {
      //   uid: onlyNumbersUID,
      //   playerInfo: {
      //     nickname: onlyNumbersUID,
      //     signature: "",
      //   },
      // };

      const typedResult = {
        uid: providedUID,
        playerInfo: {
          nickname: providedUID,
          signature: "Click to load showcase using enka.network",
        },
      };

      const _uid = encodeURIComponent(providedUID);
      const searchAccountsURL = `/api/search/user?uid=${_uid}`;

      const { data } = await axios.get(searchAccountsURL, { params });
      const fetchedResults = data.data.accounts;

      const resultsList = isValidUID
        ? [typedResult, ...fetchedResults]
        : fetchedResults;

      setResults(resultsList);
      setTotalRowsHash(data.data.totalRowsHash);
      setIsFetching(false);
    },
    [params.page]
  );

  const debouncedFetchAccounts = useCallback(debounce(fetchAccounts, 350), [
    params.page,
  ]);

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [searchUID]);

  useEffect(() => {
    debouncedFetchAccounts(searchUID);
  }, [searchUID, params.page]);

  const getSetTotalRows = async (totalRowsHash: string) => {
    const totalRowsOpts = {
      params: {
        variant: "accounts",
        hash: totalRowsHash,
      },
    };

    const response = await axios.get(FETCH_COLLECTION_SIZE_URL, totalRowsOpts);

    const { totalRows } = response.data;
    setTotalRowsCount(totalRows);
  };

  useEffect(() => {
    if (totalRowsHash) {
      getSetTotalRows(totalRowsHash);
    } else {
      setTotalRowsCount(0);
    }
  }, [totalRowsHash]);

  return (
    <div>
      <div className="flex">
        <AdsComponentManager
          adType="LeaderboardATF"
          dataAdSlot="6204085735"
          hybrid="desktop"
        />
        <AdsComponentManager adType="Video" />
        <div className="content-block w-100" id="content-container">
          <StylizedContentBlock overrideImage={DomainBackground} />
          <div className="relative">
            <div className="search-input-wrapper" style={{ margin: "50px 0" }}>
              <b>Enter Genshin UID or Enka Network profile name</b>
              <i>
                (nickname search works only for people who already imported
                their accounts)
              </i>
              {/* / enka profile name */}
              <div className="search-input relative">
                <input
                  onChange={(event) => {
                    setSearchUID(event.target.value);
                  }}
                />
                {!searchUID && (
                  <span className="fake-placeholder">type here...</span>
                )}
              </div>
              <div className="uid-results relative">
                {isFetching && (
                  <div className="uid-results-spinner-wrapper">
                    <Spinner />
                  </div>
                )}
                <AdsComponentManager
                  adType="LeaderboardBTF"
                  dataAdSlot="6204085735"
                  hybrid="mobile"
                  hideOnDesktop
                />
                {results.map((result, i) => {
                  return (
                    <a
                      key={`${result.uid}-${i}`}
                      className="uid-result"
                      href={`/profile/${result.uid}`}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(`/profile/${result.uid}`);
                      }}
                    >
                      <GenshinUserCard
                        accountData={{ account: result }}
                        isAccountOwner
                        showBackgroundImage
                      />
                    </a>
                  );
                })}
              </div>
              {results.length > 0 && (
                <div style={{ width: "100%", maxWidth: 950 }}>
                  {/* <Pagination
                    pageSize={params.size}
                    pageNumber={params.page}
                    totalRows={totalRowsCount}
                    setParams={setParams}
                  /> */}

                  <Pagination
                    // isLoading={isFetchingPagination}
                    pageSize={params.size}
                    pageNumber={params.page}
                    sort="_id"
                    order={params.order}
                    totalRows={totalRowsCount}
                    setParams={setParams}
                    rows={results}
                    // unknownPage={unknownPage}
                    // setHideIndexColumn={setHideIndexColumn}
                    // setUnknownPage={setUnknownPage}
                    // calculationShortName={columns[columns.length - 1].name}
                    // alwaysShowIndexColumn={alwaysShowIndexColumn}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <AdsComponentManager adType="LeaderboardBTF" dataAdSlot="6204085735" />
        <AdsComponentManager adType="RichMedia" />
      </div>
    </div>
  );
};
