import "./style.scss";

import Star from "../../assets/icons/abyss_star.png";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { cssJoin } from "../../utils/helpers";
import { useContext } from "react";

// import Separator from "../../assets/icons/abyss_separator.png";

export const ABYSS_COLORS = {
  0: "rgb(168, 120, 31)",
  1: "rgb(168, 154, 31)",
  2: "rgb(0, 122, 122)",
  3: "rgb(128, 45, 136)",
  4: "rgb(128, 128, 128)",
};

export const abyssProgressToColor = (
  floor: number,
  chamber: number,
  badge?: boolean
) => {
  // if (floor === 10) {
  //   return "gray";
  // }

  if (floor === 11 && chamber === 3) {
    if (badge) return ABYSS_COLORS[2];
    return "rgb(102, 163, 255)"; // III - purple
  }
  if (floor === 11) {
    if (badge) return ABYSS_COLORS[3];
    return "rgb(194, 102, 255)"; // IV - blue
  }
  if (floor === 12 && chamber === 3) {
    if (badge) return ABYSS_COLORS[0];
    return "rgb(255, 217, 0)"; // I - gold
  }
  if (floor === 12) {
    if (badge) return ABYSS_COLORS[1];
    return "orange"; // II - orange
  }

  if (badge) return ABYSS_COLORS[4];
  return "gray";
};

type AbyssRankTextProps = {
  row?: any;
  badge?: boolean;
  onlyStars?: boolean;
};

export const AbyssRankText: React.FC<AbyssRankTextProps> = ({
  row,
  badge,
  onlyStars,
}) => {
  const { translate } = useContext(TranslationContext);

  const floor = row?.playerInfo?.towerFloorIndex || "";
  const chamber = row?.playerInfo?.towerLevelIndex || "";
  const stars = row?.playerInfo?.towerStarIndex;

  const abyssProgress = floor && chamber ? `${floor}-${chamber}` : "-";
  const color = abyssProgressToColor(floor, chamber, badge);

  const title =
    `${translate("Spiral Abyss")}: ` +
    `Floor ${floor || 0} Chamber ${chamber || 0}` +
    (stars !== undefined ? ` - ${stars} Stars` : "");

  const classNames = cssJoin(["abyss-cell", badge ? "abyss-badge" : ""]);

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
            alt=""
            src={Star}
          />
          {onlyStars ? `${stars || 0}` : `${stars || 0} • ${abyssProgress}`}
        </>
      ) : (
        abyssProgress || "-"
      )}
    </div>
  );
};
