import "./style.scss";

import Star from "../../assets/icons/theater_star.png";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { useContext } from "react";

const theaterProgressToColor = (stars: number, chamber?: number) => {
  if (stars >= 10) {
    return "rgb(255, 217, 0)"; // I - gold
  }
  if (stars >= 8) {
    return "orange"; // II - orange
  }
  if (stars >= 6) {
    return "rgb(102, 163, 255)"; // III - purple
  }
  if (stars >= 3) {
    return "rgb(194, 102, 255)"; // IV - blue
  }

  return "gray";
};

// const theaterModeMap: { [key: string]: string } = {
//   "5": "Easy",
//   "6": "Normal",
//   "7": "Hard",
//   "11": "Visionary",
// };

type TheaterRankTextProps = {
  row?: any;
};

export const TheaterRankTextText: React.FC<TheaterRankTextProps> = ({
  row,
}) => {
  const { translate } = useContext(TranslationContext);

  const act = row?.playerInfo?.theater?.act || 0;
  const stars = row?.playerInfo?.theater?.stars;
  // const mode = theaterModeMap[row?.playerInfo?.theater?.modeIndex] || "...";

  const color = theaterProgressToColor(stars);
  const title =
    `${translate("Imaginarium Theater")}: ` +
    `Act ${act} - ${stars || 0} Stars`;
  // const title = `${mode} Mode: Act ${act} - ${stars} Stars`;

  return (
    <div style={{ color }} className="theater-cell" title={title}>
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
