import { Artifact, ConfirmTooltip, Spinner } from "../../components";
import {
  abortSignalCatcher,
  getSessionIdFromCookie,
} from "../../utils/helpers";
import axios, { AxiosRequestConfig } from "axios";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PerfectScrollbar from "react-perfect-scrollbar";
import { ProfileSettingsModalProps } from "./BuildSettingsModal";

export const ArtifactSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  toggleModal,
  accountData,
  parentRefetchData,
  uids,
}) => {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>(<></>);

  const fetchArtifactsData = async (
    uid: string,
    abortController?: AbortController
  ) => {
    const _uid = encodeURIComponent(uid);
    const fetchURL = `/api/artifactsByUid/${_uid}`;
    const opts: AxiosRequestConfig<any> = {
      signal: abortController?.signal,
    };

    if (uids) opts.params = { uids };

    const getSetData = async () => {
      const response = await axios.get(fetchURL, opts);
      const { data } = response.data;
      const cvSort = (a: any, b: any) => (a.critValue > b.critValue ? -1 : 1);
      const sortedArtifacts = data.sort(cvSort);
      setArtifacts(sortedArtifacts);
    };

    setIsLoading(true);
    await abortSignalCatcher(getSetData);
    setIsLoading(false);
  };

  useEffect(() => {
    setArtifacts([]);
  }, [accountData?.uid]);

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(<></>);
      return;
    }

    if (artifacts.length > 0) return;

    if (accountData?.uid) {
      const abortController = new AbortController();
      fetchArtifactsData(accountData?.uid, abortController);
      return () => {
        abortController.abort();
      };
    }
  }, [isOpen]);

  const handleCloseModal = (
    event: React.MouseEvent<HTMLElement>,
    allowChildren = false
  ) => {
    if (!allowChildren && event.target !== event.currentTarget) return;
    toggleModal(event);
    setSearchText("");
    if (isDirty) {
      parentRefetchData();
      setIsDirty(false);
    }
    const _body = document.querySelector("body");
    _body?.classList.remove("overflow-hidden");
  };

  const modalHeader = (
    <div className="modal-header">
      <span className="modal-title">Artifact settings</span>
      <button
        className="close-btn"
        onClick={(event) => handleCloseModal(event, true)}
      >
        <FontAwesomeIcon className="filter-icon" icon={faX} size="1x" />
      </button>
    </div>
  );

  const filteredArtifacts = useMemo(() => {
    const filterFunc = (a: any) => {
      const buildType = a.setName?.toLowerCase();
      const buildName = a.name?.toLowerCase();
      const compareTo = searchText?.toLowerCase();
      return buildName.includes(compareTo) || buildType.includes(compareTo);
    };
    return artifacts.filter(filterFunc);
  }, [searchText, artifacts]);

  const modalContent = useMemo(() => {
    const handleDeleteArtifact = async (artifact: any) => {
      setIsDirty(true);
      setIsPending(true);
      const { uid, md5, _id } = artifact;
      const _uid = encodeURIComponent(uid);
      const deleteArtiURL = `/api/user/deleteArtifact/${_uid}/${md5 || _id}`;
      const opts: AxiosRequestConfig<any> = {
        // params: { sessionID: getSessionIdFromCookie() },
        headers: {
          Authorization: `Bearer ${getSessionIdFromCookie()}`,
        },
      };
      const response = await axios.post(deleteArtiURL, null, opts);
      if (response?.data?.error) {
        if (response?.data?.error.includes(":")) {
          const _s = response?.data?.error.split("[!&^%#!@]");
          const _msg = _s[0];
          const _ch = _s[1].split("[&@(*)!]");
          const _errorMessage = (
            <div>
              {_msg}
              {_ch.map((x: string) => (
                <div key={x}>- {x}</div>
              ))}
            </div>
          );
          setErrorMsg(_errorMessage);
        } else if (response?.data?.message) {
          // idk
          setErrorMsg(response?.data?.message);
        }
      }
      setIsPending(false);
      fetchArtifactsData(accountData?.uid);
    };

    const handleDeleteAllArtifacts = async () => {
      setIsDirty(true);
      setIsPending(true);
      const uid = filteredArtifacts?.[0]?.uid;
      const _uid = encodeURIComponent(uid);
      const deleteAllArtiURL = `/api/user/deleteAllUnequippedArtifacts/${_uid}`;
      const opts: AxiosRequestConfig<any> = {
        // params: { sessionID: getSessionIdFromCookie() },
        headers: {
          Authorization: `Bearer ${getSessionIdFromCookie()}`,
        },
      };
      const response = await axios.post(deleteAllArtiURL, null, opts);
      if (response?.data?.error) {
        setErrorMsg(response?.data?.error);
      } else if (response?.data?.message) {
        // idk
        setErrorMsg(response?.data?.message);
      }
      setIsPending(false);
      fetchArtifactsData(accountData?.uid);
    };

    const displayArtifactSettingsRow = (artifact: any) => {
      return (
        <div key={artifact._id} className="relative">
          {/* <img className="table-icon" src={artifact.icon} alt={artifact.icon} /> */}
          {/* <div className="compact-table-name artifacts-table">
            <Highlighter
              highlightClassName="text-highlight-class"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={`+${artifact.level -1} ${artifact.name}`}
            />
            <Highlighter
              highlightClassName="text-highlight-class"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={`${artifact.setName}`}
            />
          </div> */}

          <Artifact artifact={artifact} width={210} />
          <div className="remove-btn-container">
            <ConfirmTooltip
              text={`Delete "${artifact.name}"?`}
              onConfirm={() => handleDeleteArtifact(artifact)}
            >
              <button className="remove-btn" title="Delete artifact">
                <FontAwesomeIcon icon={faTrash} size="1x" />
              </button>
            </ConfirmTooltip>
          </div>
        </div>
      );
    };

    return (
      <div className="compact-table-wrapper">
        <div className="perfect-scroll-wrapper">
          <div className="build-search-input relative">
            <input
              onChange={(event) => {
                setSearchText(event.target.value);
              }}
            />
            {!searchText && <span className="fake-placeholder">no filter</span>}
          </div>

          <div className="artifact-error">{errorMsg}</div>

          <div className="perfect-scroll-wrapper for-artifacts">
            <PerfectScrollbar>
              <div
                style={{
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                  marginRight: 15,
                }}
              >
                Delete all unequipped aritfacts:
                <ConfirmTooltip
                  text={`Delete all unequipped aritfacts?`}
                  onConfirm={() => handleDeleteAllArtifacts()}
                >
                  <button
                    className="remove-btn"
                    title="Delete all unequipped artifacts"
                  >
                    <FontAwesomeIcon icon={faTrash} size="1x" />
                  </button>
                </ConfirmTooltip>
              </div>
              <div className="artifacts-container">
                {filteredArtifacts.map((artifact) => {
                  return displayArtifactSettingsRow(artifact);
                })}
              </div>
            </PerfectScrollbar>
          </div>
        </div>
      </div>
    );
  }, [accountData?.uid, filteredArtifacts, searchText, isPending, errorMsg]);

  if (!isOpen) return null;

  return (
    <>
      <div className="react-select-menu-container" />
      <div className="modal-wrapper" onClick={handleCloseModal}>
        <div className="modal settings-modal" style={{ width: 800 }}>
          {modalHeader}
          <div className="modal-content">
            {isLoading ? (
              <div className="spinner-wrapper">
                <Spinner />
              </div>
            ) : (
              modalContent
            )}
            {/* {modalButtons} */}
          </div>
        </div>
      </div>
    </>
  );
};
