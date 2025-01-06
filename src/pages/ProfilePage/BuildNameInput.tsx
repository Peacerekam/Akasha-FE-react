type BuildNameInputProps = {
  defaultValue?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

export const BuildNameInput: React.FC<BuildNameInputProps> = ({
  defaultValue,
  onBlur
}) => {
  return (
    <input
      onBlur={onBlur}
      defaultValue={defaultValue}
      className="build-name-input"
    />
  );
};
