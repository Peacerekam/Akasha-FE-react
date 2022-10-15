import { useRef, useEffect } from "react";

type BuildNameInputProps = {
  defaultValue?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

export const BuildNameInput: React.FC<BuildNameInputProps> = ({
  defaultValue,
  onBlur
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      onBlur={onBlur}
      defaultValue={defaultValue}
      className="build-name-input"
    />
  );
};
