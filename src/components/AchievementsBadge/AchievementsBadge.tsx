import "./style.scss";

import Achievevement from "../../assets/icons/Achievement.webp";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { useContext } from "react";

type AchievementsBadgeProps = {
  count?: number;
};

export const AchievementsBadge: React.FC<AchievementsBadgeProps> = ({
  count,
}) => {
  const { translate } = useContext(TranslationContext);
  const roundedCount = Math.round(count || 0);

  const className = roundedCount
    ? `achievement-${Math.floor(roundedCount / 100) * 100}-badge`
    : "achievement-100-badge";

  return (
    <span
      title={`${translate("Total Achievements")}: ${roundedCount}`}
      className={`achievement-badge ${className}`}
    >
      <img alt="" src={Achievevement} />
      {roundedCount}
    </span>
  );
};
