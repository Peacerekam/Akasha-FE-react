import "./style.scss";

type ARBadgeProps = {
  adventureRank?: number;
};

export const ARBadge: React.FC<ARBadgeProps> = ({ adventureRank }) => {
  const className = adventureRank
    ? `ar-${Math.floor(adventureRank / 5) * 5}-badge`
    : "ar-60-badge";

  return (
    <span className={`ar-badge ${className}`}>AR{adventureRank ?? " ?"}</span>
  );
};
