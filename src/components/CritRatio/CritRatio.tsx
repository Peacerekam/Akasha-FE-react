import "./style.scss";

import { getCharacterCvColor, getRainbowTextStyle } from "../../utils/helpers";

import { roundToFixed } from "../../utils/substats";

type CritRatioProps = {
  row: any;
  overrideCV?: number;
};

export const CritRatio: React.FC<CritRatioProps> = ({ row, overrideCV }) => {
  const stats = row.stats;
  const offset = 0.000001;

  const cr = stats.critRate?.value
    ? (offset + stats.critRate?.value) * 100
    : stats.critRate;

  const cd = stats.critDamage?.value
    ? (offset + stats.critDamage?.value) * 100
    : stats.critDMG;

  // const cv = 2 * cr + cd;
  const cv = offset + (stats.critValue || overrideCV || 0);
  const textColor = getCharacterCvColor(cv);

  let style = {} as React.CSSProperties;

  if (textColor === "rainbow") {
    style = getRainbowTextStyle();
  } else {
    style.color = textColor;
  }

  return (
    <div className="table-crits-display">
      <div>
        {roundToFixed(cr, 1).toFixed(1)} : {roundToFixed(cd, 1).toFixed(1)}{" "}
      </div>
      {cv ? <div style={style}>{roundToFixed(cv, 1).toFixed(1)} cv</div> : ""}
      {/* <div onClick={() => console.log("test")} className="cv-details"></div> */}
    </div>
  );
};
