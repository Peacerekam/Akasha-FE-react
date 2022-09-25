import { useMemo } from "react";
import "./style.scss";

type StylizedBlockTypes = "gradient";

export const StylizedContentBlock = ({
  variant,
  revealCondition = true,
  overrideImage,
}: {
  variant?: StylizedBlockTypes;
  revealCondition?: boolean;
  overrideImage?: string;
}) => {
  const classNames = useMemo(
    () =>
      [
        variant ?? "",
        "stylized-content-block-wrapper",
        revealCondition ? "reveal-anim" : "",
      ]
        .join(" ")
        .trim(),
    [variant, revealCondition]
  );

  const style = overrideImage
    ? ({
        "--name-card-url": `url(${overrideImage})`,
      } as React.CSSProperties)
    : {};

  return (
    <div style={style} className={classNames}>
      <div className="stylized-content-block" />
    </div>
  );
};
