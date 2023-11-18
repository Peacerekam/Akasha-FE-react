import "../ConfirmTooltip/style.scss";
import "./style.scss";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ConfirmInputProps = {
  sort: string | null;
  text: string | JSX.Element;
  onConfirm: any;
  children: JSX.Element;
  className?: string;
  defaultValue?: string;
};

export const ConfirmInput: React.FC<ConfirmInputProps> = ({
  sort,
  text,
  onConfirm,
  children,
  className = "",
  defaultValue = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => setIsOpen(true);

  const handleClose = useCallback(
    (event: any) => {
      if (event.target === inputRef.current) return;
      setIsOpen(false);
    },
    [inputRef]
  );

  const handleConfirm = () => {
    if (value === undefined || value === "") return;

    const needsFormatting =
      sort &&
      [
        "stats.critRate.value",
        "stats.critDamage.value",
        "stats.energyRecharge.value",
      ].includes(sort);

    let numberValue = +value;
    if (needsFormatting) numberValue /= 100;

    onConfirm(numberValue);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        window.addEventListener("click", handleClose);
        setValue(defaultValue ? (+defaultValue).toFixed(2) : "");
        inputRef.current?.focus();
      }, 0);
    } else {
      window.removeEventListener("click", handleClose);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      window.removeEventListener("click", handleClose);
    };
  }, []);

  const handleSetValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");

    setValue(newValue);
  };

  return (
    <div>
      <div className={className} onClick={handleOpen}>
        {children}
      </div>
      {isOpen && (
        <div className="relative">
          <div className="confirm-tooltip">
            <div className="confirm-tooltip-text">{text}</div>
            <input
              placeholder=""
              className="confirm-input-element"
              ref={inputRef}
              value={value}
              onChange={handleSetValue}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleConfirm();
              }}
            />
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
