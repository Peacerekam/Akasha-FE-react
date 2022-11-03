import { faX, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import "./style.scss";

type ConfirmTooltipProps = {
  text: string;
  onConfirm: any;
  children: JSX.Element;
};

export const ConfirmTooltip: React.FC<ConfirmTooltipProps> = ({
  text,
  onConfirm,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => window.addEventListener("click", handleClose), 0);
    } else {
      window.removeEventListener("click", handleClose);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      window.removeEventListener("click", handleClose);
    };
  }, []);

  return (
    <div>
      <div onClick={handleOpen}>{children}</div>
      {isOpen && (
        <div className="relative">
          <div className="confirm-tooltip">
            <div className="confirm-tooltip-text">{text}</div>
            <div
              className="flex confirm-buttons"
              style={{ justifyContent: "space-between" }}
            >
              <div onClick={handleConfirm}>
                
              <FontAwesomeIcon icon={faCheck} size="1x" />
              </div>
              <div onClick={handleClose}>
                
              <FontAwesomeIcon icon={faXmark} size="1x" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
