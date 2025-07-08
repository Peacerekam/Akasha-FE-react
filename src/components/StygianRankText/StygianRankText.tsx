import "./style.scss";

import { cssJoin, toEnkaUrl } from "../../utils/helpers";

import { ABYSS_COLORS } from "../AbyssRankText";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { useContext } from "react";

// import Separator from "../../assets/icons/abyss_separator.png";

// export const STYGIAN_COLORS = {
//   0: "rgb(128, 128, 128)",
//   1: "rgb(128, 128, 128)",
//   2: "rgb(128, 128, 128)",
//   3: "rgb(128, 128, 128)",
//   4: "rgb(255, 217, 0)",
//   5: "rgb(255, 0, 119)",
//   6: "cyan",
// };

export const stygianProgressToColor = (index: number, badge?: boolean) => {
  if (index === 6) {
    if (badge) return ABYSS_COLORS[0];
    return "cyan"; // Dire
  }
  if (index === 5) {
    if (badge) return ABYSS_COLORS[1];
    return "rgb(255, 0, 119)"; // Fearless
  }
  if (index === 4) {
    if (badge) return ABYSS_COLORS[2];
    return "rgb(255, 217, 0)"; // Menancing
  }

  if (badge) return ABYSS_COLORS[4]; // gray badge
  return "gray";
};

export const STYGIAN_DIFF_TO_NAME: any = {
  0: "-",
  1: "Normal",
  2: "Advancing",
  3: "Hard",
  4: "Menacing",
  5: "Fearless",
  6: "Dire",
  7: "Dire",
};

export const NUM_TO_ROMAN: any = {
  0: "", // romans didnt invent a 0 yet :)
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VI",
};

export const STYGIAN_DIFF_TO_ICON = [1, 2, 3, 4, 5, 6, 7].reduce(
  (acc, diff) => {
    acc[diff] = toEnkaUrl(`UI_LeyLineChallenge_Medal_${diff}`);
    return acc;
  },
  {} as any
);

type StygianRankTextProps = {
  row?: any;
  badge?: boolean;
};

export const StygianRankText: React.FC<StygianRankTextProps> = ({
  row,
  badge,
}) => {
  const { translate } = useContext(TranslationContext);

  const diff = row?.playerInfo?.stygianIndex || "-";
  const seconds = row?.playerInfo?.stygianSeconds || "0";
  const diffText = STYGIAN_DIFF_TO_NAME[diff] || "-";
  const diffRoman = NUM_TO_ROMAN[diff] || "-";
  const color = stygianProgressToColor(diff, badge);
  const icon = STYGIAN_DIFF_TO_ICON[diff === 6 && seconds <= 180 ? 7 : diff];
  const susLevel = row?.susLevel || 0;
  const title = `${susLevel > 0 ? "SUSPICIOUS CLEAR - " : ""}${translate(
    "Stygian Onslaught"
  )} ${diffRoman} - ${diffText}: ${seconds}s`;
  const classNames = cssJoin([
    "abyss-cell",
    badge ? "abyss-badge" : "",
    susLevel > 1 ? "strike-through" : "",
  ]);

  return (
    <div
      style={
        {
          "--color": color,
          width: susLevel ? "fit-content" : "auto",
        } as React.CSSProperties
      }
      className={classNames}
      title={title}
    >
      {!row?.playerInfo?.stygianIndex ? (
        "-"
      ) : (
        <>
          <img
            className="abyss-star"
            width={16}
            height={16}
            alt={diffRoman}
            src={icon}
          />
          {/* {`${diffRoman} • ${seconds}s`} */}
          {seconds}s
        </>
      )}
    </div>
  );
};
