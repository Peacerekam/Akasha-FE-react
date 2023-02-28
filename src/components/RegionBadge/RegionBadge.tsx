import "./style.scss";

type RegionBadgeProps = {
  region?: string;
};

export const RegionBadge: React.FC<RegionBadgeProps> = ({ region }) => {
  const className = region
    ? `${region.toLowerCase()}-badge`
    : "unknown-badge";

  return (
    <span className={`region-badge ${className}`}>{region || "-"}</span>
  );
};
