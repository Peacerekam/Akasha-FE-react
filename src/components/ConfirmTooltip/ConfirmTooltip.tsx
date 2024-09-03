import "./style.scss";

import React, { useCallback, useEffect, useState } from "react";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cssJoin } from "../../utils/helpers";
import { getRelativeCoords } from "../CustomTable/Filters";

type ConfirmTooltipProps = {
  text: string;
  onConfirm: any;
  children: JSX.Element;
  className?: string;
  disabled?: boolean;
  adjustOffsets?: boolean;
};

export const ConfirmTooltip: React.FC<ConfirmTooltipProps> = ({
  text,
  onConfirm,
  children,
  className = "",
  disabled = false,
  adjustOffsets = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [justify, setJustify] = useState<"left" | "right">("left");

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;

    if (adjustOffsets) {
      const offsets = getRelativeCoords(event);
      const newJustify = offsets.offsetX > 0 ? "left" : "right";
      setJustify(newJustify);
    }

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

  const justifyRight = justify === "right";

  return (
    <div>
      <div className={className} onClick={handleOpen}>
        {children}
      </div>
      {isOpen && (
        <div className="relative">
          <div
            className={cssJoin([
              "confirm-tooltip",
              justifyRight ? "flex-row-reverse" : "",
            ])}
            style={{ left: justifyRight ? 0 : "unset" }}
          >
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
