import "./style.scss";

import { cssJoin } from "../../utils/helpers";
import { useMemo } from "react";

type StylizedBlockTypes =
  | "gradient"
  | "gradient-reverse"
  | "gradient-low-height";

type StylizedContentBlockProps = {
  variant?: StylizedBlockTypes;
  revealCondition?: boolean;
  overrideImage?: string;
};

export const StylizedContentBlock: React.FC<StylizedContentBlockProps> = ({
  variant,
  revealCondition = true,
  overrideImage,
}) => {
  const classNames = useMemo(
    () =>
      cssJoin([
        variant ?? "",
        "stylized-content-block-wrapper",
        revealCondition ? "reveal-anim" : "",
      ]),
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
