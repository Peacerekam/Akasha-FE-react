import axios from "axios";
import { debounce } from "lodash";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StylizedContentBlock } from "../../components/StylizedContentBlock";
import {
  AccountDataForUserCard,
  FetchParams,
  GenshinUserCard,
  Pagination,
} from "../../components";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import "./style.scss";
import { BASENAME } from "../../App";

export const UIDSearchPage: React.FC = () => {
  const [searchUID, setSearchUID] = useState("");
  const [results, setResults] = useState<AccountDataForUserCard[]>([]);
  const [totalResults, setTotalResults] = useState(0);
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
      if (!providedUID) {
        setResults([]);
        return;
      }

      const typedResult = {
        uid: providedUID,
        playerInfo: {
          nickname: providedUID,
          signature: "",
        },
      };

      const _uid = encodeURIComponent(providedUID);
      const searchAccountsURL = `/api/search/user/${_uid}`;
      const { data } = await axios.get(searchAccountsURL, { params });
      const fetchedResults = data.data.accounts;

      setResults([typedResult, ...fetchedResults]);
      setTotalResults(data.data.totalRows);
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

  return (
    <div>
      <div className="flex">
        <div className="content-block w-100 ">
          <StylizedContentBlock overrideImage={DomainBackground} />
          <div className="relative">
            <div className="search-input-wrapper" style={{ margin: "50px 0" }}>
              Enter UID / enka profile name
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
              <div className="uid-results">
                {results.map((result, i) => {
                  return (
                    <a
                      key={`${result.uid}-${i}`}
                      className="uid-result"
                      href={`${BASENAME}/profile/${result.uid}`}
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
                  <Pagination
                    pageSize={params.size}
                    pageNumber={params.page}
                    totalRows={totalResults}
                    setParams={setParams}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
