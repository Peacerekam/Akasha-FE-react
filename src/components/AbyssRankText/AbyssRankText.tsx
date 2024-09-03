import "./style.scss";

// import Separator from "../../assets/icons/abyss_separator.png";
import Star from "../../assets/icons/abyss_star.png";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { useContext } from "react";

export const abyssProgressToColor = (floor: number, chamber: number) => {
  // if (floor === 10) {
  //   return "gray";
  // }

  if (floor === 11 && chamber === 3) {
    return "rgb(102, 163, 255)"; // III - purple
  }
  if (floor === 11) {
    return "rgb(194, 102, 255)"; // IV - blue
  }
  if (floor === 12 && chamber === 3) {
    return "rgb(255, 217, 0)"; // I - gold
  }
  if (floor === 12) {
    return "orange"; // II - orange
  }

  return "gray";
};

type AbyssRankTextProps = {
  row?: any;
};

export const AbyssRankText: React.FC<AbyssRankTextProps> = ({ row }) => {
  const { translate } = useContext(TranslationContext);

  const floor = row?.playerInfo?.towerFloorIndex || "";
  const chamber = row?.playerInfo?.towerLevelIndex || "";
  const stars = row?.playerInfo?.towerStarIndex;

  const abyssProgress = floor && chamber ? `${floor}-${chamber}` : "";
  const color = abyssProgressToColor(floor, chamber);

  const title =
    `${translate("Spiral Abyss")}: ` +
    `Floor ${floor} Chamber ${chamber}` +
    (stars !== undefined ? ` - ${stars} Stars` : "");

  return (
    <div style={{ color }} className="abyss-cell" title={title}>
      {stars !== undefined ? (
        <>
          <img
            className="abyss-star"
            width={16}
            height={16}
            alt="Star"
            src={Star}
          />
          {stars}
          {" • "}
          {abyssProgress}
        </>
      ) : (
        abyssProgress
      )}
    </div>
  );
};
