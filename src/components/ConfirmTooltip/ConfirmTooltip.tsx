import "./style.scss";

import React, { useCallback, useEffect, useState } from "react";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ConfirmTooltipProps = {
  text: string;
  onConfirm: any;
  children: JSX.Element;
  className?: string;
  disabled?: boolean;
};

export const ConfirmTooltip: React.FC<ConfirmTooltipProps> = ({
  text,
  onConfirm,
  children,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
  };

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
      <div className={className} onClick={handleOpen}>
        {children}
      </div>
      {isOpen && (
        <div className="relative">
          <div className="confirm-tooltip">
            <div className="confirm-tooltip-text">{text}</div>
            <div
              className="flex confirm-buttons"
              style={{ justifyContent: "space-between" }}
            >
              <div onClick={handleConfirm} title="Confirm">
                <FontAwesomeIcon icon={faCheck} size="1x" />
              </div>
              <div onClick={handleClose} title="Cancel">
                <FontAwesomeIcon icon={faXmark} size="1x" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
