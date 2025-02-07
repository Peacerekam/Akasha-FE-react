import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { revertModalBodyStyle } from "../../utils/helpers";

type PreviewModalProps = {
  isOpen: boolean;
  toggleModal: (event: React.MouseEvent<HTMLElement>) => void;
  blob?: Blob;
  dataURL?: string;
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  toggleModal,
  blob,
  dataURL,
}) => {
  const handleCloseModal = (
    event: React.MouseEvent<HTMLElement>,
    allowChildren = false
  ) => {
    if (!allowChildren && event.target !== event.currentTarget) return;
    toggleModal(event);
    revertModalBodyStyle();
  };

  if (!isOpen) return null;

  const imageData = blob ? URL.createObjectURL(blob) : dataURL || "";

  return (
    <div
      className="modal-wrapper card-preview-modal"
      onClick={handleCloseModal}
    >
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Character showcase card preview</span>
          <button
            className="close-btn"
            onClick={(event) => handleCloseModal(event, true)}
          >
            <FontAwesomeIcon className="filter-icon" icon={faX} size="1x" />
          </button>
        </div>
        <div className="modal-content">
          <img alt="card" src={imageData} />
          <div className="card-explaination">
            Please right click or long-tap the image to save it
          </div>
        </div>
      </div>
    </div>
  );
};
