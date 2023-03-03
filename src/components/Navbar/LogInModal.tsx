import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faX,
  faXmark,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faPatreon } from "@fortawesome/free-brands-svg-icons";
import { useContext } from "react";
import { SessionDataContext } from "../../context/SessionData/SessionDataContext";
import { ConfirmTooltip } from "../ConfirmTooltip";
import { optsParamsSessionID } from "../../utils/helpers";
import { BASENAME } from "../../App";
import { ARBadge } from "../ARBadge";
import { RegionBadge } from "../RegionBadge";

type LogInModalProps = {
  isOpen: boolean;
  toggleModal: (event: React.MouseEvent<HTMLElement>) => void;
};

export const LogInModal: React.FC<LogInModalProps> = ({
  isOpen,
  toggleModal,
}) => {
  const navigate = useNavigate();
  const { profileObject, isAuthenticated, boundAccounts } =
    useContext(SessionDataContext);

  const handleCloseModal = (
    event: React.MouseEvent<HTMLElement>,
    allowChildren = false
  ) => {
    if (!allowChildren && event.target !== event.currentTarget) return;
    toggleModal(event);
    const _body = document.querySelector("body");
    _body?.classList.remove("overflow-hidden");
  };

  if (!isOpen) return null;

  // @TODO: show spinner after clicking any of the links?
  const patreonAuthLink = `${axios.defaults.baseURL}/auth/patreon`;
  const discordAuthLink = `${axios.defaults.baseURL}/auth/discord`;

  const handleLogout = async () => {
    try {
      const logoutURL = "/api/logout";
      await axios.post(logoutURL, null, optsParamsSessionID());
      window.location.reload();
    } catch (err) {}
  };

  return (
    <div className="modal-wrapper" onClick={handleCloseModal}>
      <div className="modal" style={{ width: 400 }}>
        <div className="modal-header">
          <span className="modal-title">
            {isAuthenticated ? "Account settings" : "Log In"}
          </span>
          <button
            className="close-btn"
            onClick={(event) => handleCloseModal(event, true)}
          >
            <FontAwesomeIcon className="filter-icon" icon={faX} size="1x" />
          </button>
        </div>
        <div className="modal-content">
          {profileObject?.username && (
            <div className="account-info">
              <table>
                <tbody>
                  <tr>
                    <td>Current user:</td>
                    <td>
                      <div className="centered-td">
                        <img
                          className="navbar-img"
                          src={profileObject.profilePicture}
                        />
                        <span style={{ flex: 1 }}>
                          {profileObject?.username}
                        </span>
                        <ConfirmTooltip
                          text="Do you want to log out?"
                          onConfirm={handleLogout}
                        >
                          <FontAwesomeIcon
                            className="filter-icon hoverable-icon"
                            icon={faRightFromBracket}
                            size="1x"
                            title="Logout?"
                          />
                        </ConfirmTooltip>
                        {/* @TODO: unbind account here? */}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Patreon:</td>
                    <td
                      style={{
                        color: profileObject?.isPatreon ? "#90ee90" : "red",
                      }}
                    >
                      <FontAwesomeIcon
                        className="filter-icon"
                        icon={profileObject?.isPatreon ? faCheck : faXmark}
                        size="1x"
                      />
                      {profileObject?.isPatreon ? "YES" : "NO"}
                    </td>
                  </tr>
                  <tr>
                    <td className="flex">
                      {boundAccounts.length > 0 && "Bound accounts:"}
                    </td>
                    <td>
                      {boundAccounts.map((acc) => {
                        const { nickname, level } = acc.playerInfo;
                        const { uid, profilePictureLink } = acc;
                        return (
                          <a
                            key={acc.uid}
                            className="bound-account centered-td"
                            onClick={(event) => {
                              event.preventDefault();
                              handleCloseModal(event, true);
                              navigate(`/profile/${uid}`);
                            }}
                            href={`${BASENAME}/profile/${uid}`}
                          >
                            <img
                              className="table-icon"
                              src={profilePictureLink}
                            />
                            <div style={{ flex: 1 }}>{nickname}</div>
                            <RegionBadge region={acc?.playerInfo?.region} />
                            <ARBadge adventureRank={level} />
                          </a>
                        );
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {profileObject?.username && <div className="modal-spacer" />}
          <div className="log-in-container">
            <div className="log-in-title">Select authentication method</div>
            <div className="log-in-methods-container">
              <a
                href={patreonAuthLink}
                className="method-wrapper patreon-wrapper"
              >
                <FontAwesomeIcon icon={faPatreon} size="3x" />{" "}
                <span className="method-text">Patreon</span>
              </a>
              <a
                href={discordAuthLink}
                className="method-wrapper discord-wrapper"
              >
                <FontAwesomeIcon icon={faDiscord} size="3x" />{" "}
                <span className="method-text">Discord</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
