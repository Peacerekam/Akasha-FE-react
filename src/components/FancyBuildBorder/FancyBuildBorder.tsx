import { BACKEND_URL, getCharacterCvColor } from "../../utils/helpers";

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
  const wrapperClassNames = [
    "row-hover-build-preview",
    hide ? "fade-out" : "fade-in",
    patreonObj?.active ? "patreon-stat-list" : "",
  ]
    .join(" ")
    .trim();

  // @TODO: here!!
  const fancyBorderClassNames = [
    "patreon-stat-decoration",
    hide ? "hide" : "",
    patreonObj?.active ? "" : "hide",
  ]
    .join(" ")
    .trim();

  const offsetStyle: React.CSSProperties = resetOffset
    ? {
        transform: "translate(-10px, -10px)",
      }
    : {};

  const displayPatreonBorder = (
    <div className={fancyBorderClassNames} style={offsetStyle}>
      <div className="corner top-left" />
      <div className="corner top-right" />
      <div className="corner bottom-left" />
      <div className="corner bottom-right" />
      <div className="border top" />
      <div className="border right" />
      <div className="border bottom" />
      <div className="border left" />
    </div>
  );

  const cv = rowData?.critValue || 0;

  const patreonHasCustomNamecard =
    patreonObj?.active && rowData?.customNamecard;

  const _customNamecard = encodeURIComponent(rowData?.customNamecard);
  const customNamecard = patreonHasCustomNamecard
    ? `${BACKEND_URL}/public/namecards/${_customNamecard}`
    : null;

  const backgroundImage =
    overwriteBackground || customNamecard || rowData?.nameCardLink;

  const style = {
    "--name-card-url": `url(${backgroundImage})`,
    borderColor: getCharacterCvColor(cv),
    ...(offsetStyle || {}),
  } as React.CSSProperties;

  return (
    <div className="relative">
      {displayPatreonBorder}
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
