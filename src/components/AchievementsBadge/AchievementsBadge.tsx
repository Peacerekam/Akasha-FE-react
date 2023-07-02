import Achievevement from "../../assets/icons/Achievement.webp";
import "./style.scss";

type AchievementsBadgeProps = {
  count?: number;
};

export const AchievementsBadge: React.FC<AchievementsBadgeProps> = ({
  count,
}) => {
  const roundedCount = Math.round(count || 0);

  const className = roundedCount
    ? `achievement-${Math.floor(roundedCount / 100) * 100}-badge`
    : "achievement-100-badge";

  return (
    <span
      title={`Achievements: ${roundedCount}`}
      className={`achievement-badge ${className}`}
    >
      <img alt="Achievements" src={Achievevement} />
      {roundedCount}
    </span>
  );
};
