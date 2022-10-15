import {
  faCheck,
  faX,
  faEye,
  faEyeSlash,
  faUpload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PerfectScrollbar from "react-perfect-scrollbar";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { StatList } from "../../components";
import { FancyBuildBorder } from "../../components/FancyBuildBorder";
import { BACKEND_URL, PATREON_URL } from "../../utils/helpers";
import Highlighter from "react-highlight-words";
import { BuildNameInput } from "./BuildNameInput";

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
  const uploadInput = useRef<HTMLInputElement>(null);

  const fetchBuildsData = async (
    uid: string,
    abortController?: AbortController
  ) => {
    const _uid = encodeURIComponent(uid);
    const fetchURL = `${BACKEND_URL}/api/builds/${_uid}`;
    const opts = {
      signal: abortController?.signal,
    } as any;
    const response = await axios.get(fetchURL, opts);
    const { data } = response.data;
    setBuilds(data);
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
    if (!isOpen) setSelectedBuildId("");
    setSearchText("");
    if (builds.length === 0 || selectedBuildId) return;
    const buildId = getBuildId(builds[0]);
    setSelectedBuildId(buildId);
  }, [builds, isOpen]);

  const submitNamecard = async () => {
    const file = uploadInput?.current?.files?.[0];
    if (!file || !selectedBuild) return;

    const formData = new FormData();
    formData.append("file", file);

    // @TODO: need to handle auth as well
    const { uid, characterId, type } = selectedBuild;
    const _uid = encodeURIComponent(uid);
    const _type = encodeURIComponent(type);
    const postNamecardURL = `${BACKEND_URL}/api/user/namecard/${_uid}/${characterId}/${_type}`;
    const response = await axios.post(postNamecardURL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    clearBgImage();
    parentRefetchData();
    fetchBuildsData(accountData?.uid);
  };

  const handleAddImage = (files: FileList | null) => {
    if (files?.length !== 1) return;
    const file = files[0];
    window.URL.revokeObjectURL(backgroundPreview);
    setBackgroundPreview(window.URL.createObjectURL(file));
    setFileData(file);
  };

  const handleCloseModal = (
    event: React.MouseEvent<HTMLElement>,
    allowChildren = false
  ) => {
    if (!allowChildren && event.target !== event.currentTarget) return;
    toggleModal(event);
    clearBgImage();
    setSelectedBuildId("");
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

  const handleDeleteBackground = async () => {
    const { uid, characterId, type } = selectedBuild;
    const _uid = encodeURIComponent(uid);
    const _type = encodeURIComponent(type);
    const deleteNamecardURL = `${BACKEND_URL}/api/user/namecard/delete/${_uid}/${characterId}/${_type}`;
    await axios.get(deleteNamecardURL);
    clearBgImage();
    parentRefetchData();
    fetchBuildsData(accountData?.uid);
  };

  const filteredBuilds = useMemo(() => {
    const filterFunc = (a: any) => {
      const buildType = a.type.toLowerCase();
      const buildName = a.name.toLowerCase();
      const compareTo = searchText?.toLowerCase();
      return (
        buildName.includes(compareTo) ||
        (buildType === "current" ? false : buildType.includes(compareTo))
      );
    };
    return builds.filter(filterFunc);
  }, [searchText, builds]);

  const changeBuildName = (event: any) => {
    let newBuildName = event?.target?.value?.trim()

    if (newBuildName === selectedBuild.name) {
      newBuildName = "current"
    }
    if (newBuildName === selectedBuild.type) {
      return;
    }

    // @TODO: send request to change name
    // on backend you must make sure theres no duplicate build names
    console.log(newBuildName)
  };

  const modalContent = useMemo(() => {
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
          <img className="table-icon" src={char.icon} />
          <div className="compact-table-name">
            {selectedBuildId === buildId ? (
              <BuildNameInput
                defaultValue={displayName}
                onBlur={changeBuildName}
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
          {char?.customNamecard && <div>🖼️</div>}
          {isHidden ? (
            <>
              <div>HIDDEN</div>
              <button className="regular-btn" onClick={() => {}}>
                <FontAwesomeIcon icon={faEyeSlash} size="1x" />
              </button>
            </>
          ) : (
            <>
              <div>VISIBLE</div>
              <button className="regular-btn" onClick={() => {}}>
                <FontAwesomeIcon icon={faEye} size="1x" />
              </button>
            </>
          )}
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

    return (
      <div className="compact-table-wrapper">
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
          {!patreonObj ? (
            <div className="patreons-only">
              Become{" "}
              <a target="_blank" href={PATREON_URL}>
                patreon
              </a>{" "}
              to customize this background image
            </div>
          ) : (
            <div className="custom-namecard-upload">
              <button
                disabled={!backgroundPreview || !patreonObj}
                className={uploadBtnClassNames}
                onClick={submitNamecard}
              >
                <FontAwesomeIcon icon={faUpload} size="1x" />
              </button>
              <label htmlFor="namecard-upload" className="custom-file-upload">
                <div>Choose background file </div>
                <div>{fileData ? fileData.name : ""}</div>
              </label>
              <input
                id="namecard-upload"
                disabled={!patreonObj}
                ref={uploadInput}
                type="file"
                accept="image/*"
                onChange={(e) => handleAddImage(e.target.files)}
              />
              <button
                title="Clear background preview"
                disabled={!backgroundPreview}
                className="remove-btn"
                onClick={clearBgImage}
              >
                <FontAwesomeIcon icon={faX} size="1x" />
              </button>
              <button
                title="Delete background"
                disabled={!selectedBuild?.customNamecard}
                className="remove-btn"
                onClick={handleDeleteBackground}
              >
                <FontAwesomeIcon icon={faTrash} size="1x" />
              </button>
            </div>
          )}
        </div>
        <div className="perfect-scroll-wrapper">
          <div className="build-search-input relative">
            <input
              onChange={(event) => {
                setSearchText(event.target.value);
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
    builds,
    filteredBuilds,
    backgroundPreview,
    fileData,
    selectedBuild,
    accountData?.nameCardLink,
  ]);

  const modalButtons = (
    <div className="modal-buttons">
      <button
        className="apply-btn"
        onClick={(event) => handleCloseModal(event, true)}
      >
        <FontAwesomeIcon className="filter-icon" icon={faCheck} size="1x" />
        OK
      </button>
    </div>
  );

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
