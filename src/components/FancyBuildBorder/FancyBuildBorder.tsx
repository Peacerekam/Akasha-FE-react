import { cssJoin, getCharacterCvColor } from "../../utils/helpers";

import { PatreonBorderInside } from "./PatreonBorderInside";
import axios from "axios";

type FancyBuildBorderProps = {
  hide: boolean;
  rowData: any;
  patreonObj: any;
  children: any;
  resetOffset?: boolean;
  overwriteBackground?: string;
};

export const FancyBuildBorder: React.FC<FancyBuildBorderProps> = ({
  hide,
  patreonObj,
  rowData,
  children,
  resetOffset,
  overwriteBackground,
}) => {
  const wrapperClassNames = cssJoin([
    "row-hover-build-preview",
    hide ? "fade-out" : "fade-in",
    patreonObj?.active ? "patreon-stat-list" : "",
  ])

  const cv = rowData?.critValue || 0;

  const patreonHasCustomNamecard =
    patreonObj?.active && rowData?.customNamecard;

  const _customNamecard = encodeURIComponent(rowData?.customNamecard);
  const customNamecard = patreonHasCustomNamecard
    ? `${axios.defaults.baseURL}/public/namecards/${_customNamecard}`
    : null;

  const backgroundImage =
    overwriteBackground || customNamecard || rowData?.nameCardLink;

  const charCvColor = getCharacterCvColor(cv);

  const offsetStyle: React.CSSProperties = resetOffset
    ? {
        transform: "translate(-10px, -10px)",
      }
    : {};

  const style = {
    "--name-card-url": `url(${backgroundImage})`,
    borderColor: charCvColor === "rainbow" ? "red" : getCharacterCvColor(cv),
    ...(offsetStyle || {}),
  } as React.CSSProperties;

  return (
    <div className="relative hover-element">
      <PatreonBorderInside
        classNames={[hide ? "hide" : "", patreonObj?.active ? "" : "hide"]}
        style={offsetStyle}
      />
      <div style={style} className={wrapperClassNames}>
        <div className="above-darken">{children}</div>
        <div className="darken" />
        {/* <div>
              Calculation result:{" "}
              {currentCategory &&
                row.calculations[currentCategory].result.toFixed(0)}
            </div> */}
      </div>
    </div>
  );
};
