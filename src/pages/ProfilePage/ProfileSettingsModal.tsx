import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import PerfectScrollbar from "react-perfect-scrollbar";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faX,
  faEye,
  faEyeSlash,
  faUpload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { ConfirmTooltip, Spinner, StatList } from "../../components";
import { FancyBuildBorder } from "../../components/FancyBuildBorder";
import {
  abortSignalCatcher,
  getSessionIdFromCookie,
  PATREON_URL,
  _getEncodeURIComponents,
} from "../../utils/helpers";
import { BuildNameInput } from "./BuildNameInput";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { optsParamsSessionID } from "../../utils/helpers";

type ProfileSettingsModalProps = {
  isOpen: boolean;
  toggleModal: (event: React.MouseEvent<HTMLElement>) => void;
  accountData: {
    nameCardLink: string;
    uid: string;
  } & any;
  parentRefetchData: () => void;
};

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  toggleModal,
  accountData,
  parentRefetchData,
}) => {
  const [selectedBuildId, setSelectedBuildId] = useState<string>();
  const [backgroundPreview, setBackgroundPreview] = useState<string>("");
  const [fileData, setFileData] = useState<any>(null);
  const [builds, setBuilds] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadInput = useRef<HTMLInputElement>(null);

  // @TODO: .....................
  const { profileObject } = useContext(SessionDataContext);
  const isPatreon = !!profileObject.isPatreon;

  const fetchBuildsData = async (
    uid: string,
    abortController?: AbortController
  ) => {
    const _uid = encodeURIComponent(uid);
    const fetchURL = `/api/builds/${_uid}`;
    const opts = {
      signal: abortController?.signal,
    } as any;

    const getSetData = async () => {
      const response = await axios.get(fetchURL, opts);
      const { data } = response.data;
      setBuilds(data);
    };

    await abortSignalCatcher(getSetData);
  };

  const getBuildId = (build: any) => `${build.characterId}${build.type}`;

  const selectedBuild = useMemo(
    () => builds.find((b) => getBuildId(b) === selectedBuildId) || {},
    [selectedBuildId, builds]
  );

  useEffect(() => {
    if (accountData?.uid) {
      const abortController = new AbortController();
      fetchBuildsData(accountData?.uid, abortController);
      return () => {
        abortController.abort();
      };
    }
  }, [accountData?.uid]);

  useEffect(() => {
    if (!isOpen) return;
    if (builds.length === 0 || selectedBuildId) return;
    const buildId = getBuildId(builds[0]);
    setSelectedBuildId(buildId);
  }, [selectedBuildId, builds, isOpen]);

  const handleCloseModal = (
    event: React.MouseEvent<HTMLElement>,
    allowChildren = false
  ) => {
    if (!allowChildren && event.target !== event.currentTarget) return;
    toggleModal(event);
    clearBgImage();
    setSelectedBuildId("");
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
      <span className="modal-title">Profile settings</span>
      <button
        className="close-btn"
        onClick={(event) => handleCloseModal(event, true)}
      >
        <FontAwesomeIcon className="filter-icon" icon={faX} size="1x" />
      </button>
    </div>
  );

  const clearBgImage = () => {
    setBackgroundPreview("");
    setFileData(null);
    if (uploadInput?.current) {
      uploadInput.current.value = "";
    }
  };

  const filteredBuilds = useMemo(() => {
    const filterFunc = (a: any) => {
      const buildType = a.type?.toLowerCase();
      const buildName = a.name?.toLowerCase();
      const compareTo = searchText?.toLowerCase();
      return (
        buildName.includes(compareTo) ||
        (buildType === "current" ? false : buildType.includes(compareTo))
      );
    };
    return builds.filter(filterFunc);
  }, [searchText, builds]);

  const modalContent = useMemo(() => {
    const handleSubmitNamecard = async () => {
      const file = uploadInput?.current?.files?.[0];
      if (!file || !selectedBuild) return;
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // @TODO: need to handle auth as well
      const { uid, characterId, type } = selectedBuild;
      const { _uid, _type } = _getEncodeURIComponents({ uid, type });
      const postNamecardURL = `/api/user/namecard/${_uid}/${characterId}/${_type}`;

      // const response = ...
      await axios.post(postNamecardURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          sessionID: getSessionIdFromCookie(),
        },
      });

      setIsUploading(false);
      clearBgImage();
      fetchBuildsData(accountData?.uid);
      setIsDirty(true);
    };

    const handleAddPreviewImage = (files: FileList | null) => {
      if (files?.length !== 1) return;
      const file = files[0];
      window.URL.revokeObjectURL(backgroundPreview);
      setBackgroundPreview(window.URL.createObjectURL(file));
      setFileData(file);
    };

    const handleDeleteBackground = async () => {
      setIsDirty(true);
      setIsUploading(true);
      const { uid, characterId, type } = selectedBuild;
      const { _uid, _type } = _getEncodeURIComponents({ uid, type });
      const postNamecardURL = `/api/user/namecard/${_uid}/${characterId}/${_type}`;
      await axios.post(postNamecardURL, null, optsParamsSessionID()); // no formData attached
      setIsUploading(false);
      clearBgImage();
      fetchBuildsData(accountData?.uid);
    };

    const handleToggleBuildVisibility = async (char: any) => {
      setIsDirty(true);
      setIsUploading(true);
      const { uid, characterId, type } = char;
      const { _uid, _type } = _getEncodeURIComponents({ uid, type });
      const toggleVisibilityURL = `/api/user/toggleBuildVisibility/${_uid}/${characterId}/${_type}`;
      await axios.post(toggleVisibilityURL, null, optsParamsSessionID());
      setIsUploading(false);
      fetchBuildsData(accountData?.uid);
    };

    const handleDeleteBuild = async (char: any) => {
      setIsDirty(true);
      setIsUploading(true);
      const { uid, characterId, type } = char;
      const { _uid, _type } = _getEncodeURIComponents({ uid, type });
      const deleteBuildURL = `/api/user/deleteBuild/${_uid}/${characterId}/${_type}`;
      await axios.post(deleteBuildURL, null, optsParamsSessionID());
      setIsUploading(false);
      fetchBuildsData(accountData?.uid);
    };

    const handleChangeBuildName = async (event: any) => {
      let newBuildName = event?.target?.value?.trim()?.slice(0, 40);

      if (newBuildName === selectedBuild.name) {
        newBuildName = "current";
      }
      if (newBuildName === selectedBuild.type || !newBuildName) {
        return;
      }

      setIsDirty(true);
      setIsUploading(true);

      const { uid, characterId, type } = selectedBuild;
      const { _uid, _type } = _getEncodeURIComponents({ uid, type });

      const postBuildNameURL = `/api/user/setBuildName/${_uid}/${characterId}/${_type}`;
      const opts = {
        params: {
          buildName: newBuildName,
          sessionID: getSessionIdFromCookie(),
        },
      };
      const response = await axios.post(postBuildNameURL, null, opts); // no formData attached
      if (response.data.error) return;

      await fetchBuildsData(accountData?.uid);
      const newBuildId = `${selectedBuild.characterId}${newBuildName}`;
      setIsUploading(false);
      setSelectedBuildId(newBuildId);
    };

    const displayBuildSettingsRow = (char: any) => {
      const buildId = getBuildId(char);
      const displayName = char.type === "current" ? char.name : char.type;
      const isHidden = char.isHidden;
      const rowClassnames = [
        "compact-table-row",
        buildId === selectedBuildId ? "selected-build-row" : "",
        isHidden ? "opacity-3" : "",
        char?.customNamecard ? "has-custom-namecard" : "",
      ]
        .join(" ")
        .trim();

      return (
        <div
          key={buildId}
          className={rowClassnames}
          onClick={() => {
            clearBgImage();
            setSelectedBuildId(buildId);
          }}
        >
          <img className="table-icon" src={char.icon} alt={char.icon} />
          <div className="compact-table-name">
            {selectedBuildId === buildId ? (
              <BuildNameInput
                defaultValue={displayName}
                onBlur={handleChangeBuildName}
              />
            ) : (
              <Highlighter
                highlightClassName="text-highlight-class"
                searchWords={[searchText]}
                autoEscape={true}
                textToHighlight={displayName}
              />
            )}
          </div>
          {char?.customNamecard && !isHidden && <div>🖼️</div>}
          {isHidden ? (
            <>
              <div>HIDDEN</div>
              <button
                className="regular-btn"
                title="Toggle build visibility"
                onClick={() => handleToggleBuildVisibility(char)}
              >
                <FontAwesomeIcon icon={faEyeSlash} size="1x" />
              </button>
            </>
          ) : (
            <>
              <div>VISIBLE</div>
              <button
                className="regular-btn"
                title="Toggle build visibility"
                onClick={() => handleToggleBuildVisibility(char)}
              >
                <FontAwesomeIcon icon={faEye} size="1x" />
              </button>
            </>
          )}
          <ConfirmTooltip
            text={`Delete "${displayName}"?`}
            onConfirm={() => handleDeleteBuild(char)}
          >
            <button className="remove-btn" title="Delete build">
              <FontAwesomeIcon icon={faTrash} size="1x" />
            </button>
          </ConfirmTooltip>
        </div>
      );
    };

    // @TODO: patreon
    const patreonObj = selectedBuild?.owner?.patreon;

    const uploadBtnClassNames = [
      "regular-btn",
      backgroundPreview ? "blinking" : "opacity-3 disabled",
    ]
      .join(" ")
      .trim();

    const statListPlaceholder = <div style={{ width: 342, height: 394 }} />;
    return (
      <div className="compact-table-wrapper">
        {selectedBuild?._id ? (
          <div className="custom-namecard-preview-wrapper">
            <FancyBuildBorder
              hide={false}
              rowData={selectedBuild}
              overwriteBackground={backgroundPreview}
              patreonObj={patreonObj}
              resetOffset
            >
              <StatList row={selectedBuild} showCharacter showWeapon />
            </FancyBuildBorder>

            {!isPatreon ? (
              <div className="patreons-only">
                Become{" "}
                <a target="_blank" rel="noreferrer" href={PATREON_URL}>
                  patreon
                </a>{" "}
                to customize this background image
              </div>
            ) : (
              <div className="custom-namecard-upload">
                {isUploading ? (
                  <Spinner />
                ) : (
                  <>
                    <button
                      disabled={!backgroundPreview || !patreonObj}
                      className={uploadBtnClassNames}
                      onClick={handleSubmitNamecard}
                    >
                      <FontAwesomeIcon icon={faUpload} size="1x" />
                    </button>
                    <label
                      htmlFor="namecard-upload"
                      className="custom-file-upload"
                    >
                      <div>Choose background file </div>
                      <div>{fileData ? fileData.name : ""}</div>
                    </label>
                    <input
                      id="namecard-upload"
                      disabled={!patreonObj}
                      ref={uploadInput}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAddPreviewImage(e.target.files)}
                    />
                    <button
                      title="Clear background preview"
                      disabled={!backgroundPreview}
                      className="remove-btn"
                      onClick={clearBgImage}
                    >
                      <FontAwesomeIcon icon={faX} size="1x" />
                    </button>
                    <ConfirmTooltip
                      text="Delete background image?"
                      onConfirm={handleDeleteBackground}
                    >
                      <button
                        title="Delete background image"
                        disabled={!selectedBuild?.customNamecard}
                        className="remove-btn"
                        // onClick={handleDeleteBackground}
                      >
                        <FontAwesomeIcon icon={faTrash} size="1x" />
                      </button>
                    </ConfirmTooltip>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          statListPlaceholder
        )}
        <div className="perfect-scroll-wrapper">
          <div className="build-search-input relative">
            <input
              onChange={(event) => {
                setSearchText(event.target.value);
                setSelectedBuildId("-1");
              }}
            />
            {!searchText && <span className="fake-placeholder">no filter</span>}
          </div>
          <PerfectScrollbar>
            <div className="compact-table">
              {filteredBuilds.map((build) => {
                return displayBuildSettingsRow(build);
              })}
            </div>
          </PerfectScrollbar>
        </div>
      </div>
    );
  }, [
    accountData?.uid,
    filteredBuilds,
    backgroundPreview,
    fileData,
    selectedBuild,
    searchText,
    selectedBuildId,
    isUploading,
  ]);

  // const modalButtons = (
  //   <div className="modal-buttons">
  //     <button
  //       className="apply-btn"
  //       onClick={(event) => handleCloseModal(event, true)}
  //     >
  //       <FontAwesomeIcon className="filter-icon" icon={faCheck} size="1x" />
  //       OK
  //     </button>
  //   </div>
  // );

  if (!isOpen) return null;

  return (
    <>
      <div className="react-select-menu-container" />
      <div className="modal-wrapper" onClick={handleCloseModal}>
        <div className="modal" style={{ width: 800 }}>
          {modalHeader}
          <div className="modal-content">
            {modalContent}
            {/* {modalButtons} */}
          </div>
        </div>
      </div>
    </>
  );
};
