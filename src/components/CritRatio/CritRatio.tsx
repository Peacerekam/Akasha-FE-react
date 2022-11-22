import { getCharacterCvColor } from "../../utils/helpers";
import "./style.scss";

type CritRatioProps = {
  stats: any;
  overrideCV?: number;
};

export const CritRatio: React.FC<CritRatioProps> = ({ stats, overrideCV }) => {
  const offset = 0.000001;

  const cr = stats.critRate?.value
    ? (offset + stats.critRate?.value) * 100
    : stats.critRate;

  const cd = stats.critDamage?.value
    ? (offset + stats.critDamage?.value) * 100
    : stats.critDMG;

  // const cv = 2 * cr + cd;
  const cv = offset + stats.critValue || overrideCV || 0;
  const textColor = getCharacterCvColor(cv);

  return (
    <div className="table-crits-display">
      <div>
        {cr.toFixed(1)} : {cd.toFixed(1)}{" "}
      </div>
      {cv ? <div style={{ color: textColor }}>{cv.toFixed(1)} cv</div> : ""}
    </div>
  );
};
