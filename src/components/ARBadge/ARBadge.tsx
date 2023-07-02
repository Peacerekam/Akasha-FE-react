import "./style.scss";

type ARBadgeProps = {
  adventureRank?: number;
};

export const ARBadge: React.FC<ARBadgeProps> = ({ adventureRank }) => {
  const roundedAR = Math.round(adventureRank || 0);

  const className = roundedAR
    ? `ar-${Math.floor(roundedAR / 5) * 5}-badge`
    : "ar-60-badge";

  return (
    <span
      title={`Adventure Rank: ${roundedAR}`}
      className={`ar-badge ${className}`}
    >
      AR{roundedAR ?? " ?"}
    </span>
  );
};
