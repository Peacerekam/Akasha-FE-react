import "./style.scss";

import { DIFF_COLORS } from "../AbyssRankText";
import Star from "../../assets/icons/theater_star.png";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { cssJoin } from "../../utils/helpers";
import { useContext } from "react";

const theaterProgressToColor = (stars: number, badge?: boolean) => {
  if (stars >= 10) {
    if (badge) return DIFF_COLORS[0];
    return "rgb(255, 217, 0)"; // I - gold
  }
  if (stars >= 8) {
    if (badge) return DIFF_COLORS[1];
    return "orange"; // II - orange
  }
  if (stars >= 6) {
    if (badge) return DIFF_COLORS[2];
    return "rgb(102, 163, 255)"; // III - purple
  }
  if (stars >= 3) {
    if (badge) return DIFF_COLORS[3];
    return "rgb(194, 102, 255)"; // IV - blue
  }

  if (badge) return DIFF_COLORS[4];
  return "gray";
};

type TheaterRankTextProps = {
  row?: any;
  badge?: boolean;
};

export const TheaterRankText: React.FC<TheaterRankTextProps> = ({
  row,
  badge,
}) => {
  const { translate } = useContext(TranslationContext);

  const act = row?.playerInfo?.theater?.act || 0;
  const stars = row?.playerInfo?.theater?.stars;
  // const mode = theaterModeMap[row?.playerInfo?.theater?.modeIndex] || "...";

  const color = theaterProgressToColor(stars, badge);
  const title =
    `${translate("Imaginarium Theater")}: ` +
    `Act ${act} - ${stars || 0} Stars`;
  // const title = `${mode} Mode: Act ${act} - ${stars} Stars`;

  const classNames = cssJoin(["theater-cell", badge ? "theater-badge" : ""]);

  return (
    <div
      style={{ "--color": color } as React.CSSProperties}
      className={classNames}
      title={title}
    >
      {stars !== undefined ? (
        <>
          <img
            className="abyss-star"
            width={16}
            height={16}
            alt="Star"
            src={Star}
          />
          {stars !== act ? (
            <>
              {stars}
              <span style={{ opacity: 0.55 }}>
                <span>/</span>
                <span>{act}</span>
              </span>
            </>
          ) : (
            stars
          )}
          {/* {stars}/{act} */}
          {/* <img
            className="abyss-separator"
            width={10}
            height={10}
            alt="Separator"
            src={Separator}
          />
          Act {act} */}
        </>
      ) : (
        "-"
      )}
    </div>
  );
};
