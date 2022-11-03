import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faPatreon } from "@fortawesome/free-brands-svg-icons";

type LogInModalProps = {
  isOpen: boolean;
  toggleModal: (event: React.MouseEvent<HTMLElement>) => void;
};

export const LogInModal: React.FC<LogInModalProps> = ({
  isOpen,
  toggleModal,
}) => {
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

  const patreonAuthLink = `${axios.defaults.baseURL}/auth/patreon`;
  const discordAuthLink = `${axios.defaults.baseURL}/auth/discord`;

  // @TODO: show spinner after clicking any of the links
  
  return (
    <div className="modal-wrapper" onClick={handleCloseModal}>
      <div className="modal" style={{ width: 400 }}>
        <div className="modal-header">
          <span className="modal-title">Log In</span>
          <button
            className="close-btn"
            onClick={(event) => handleCloseModal(event, true)}
          >
            <FontAwesomeIcon className="filter-icon" icon={faX} size="1x" />
          </button>
        </div>
        <div className="modal-content">
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
