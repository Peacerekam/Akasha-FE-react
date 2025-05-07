import { AssetFallback } from "..";

type WeaponMiniDisplayProps = {
  icon: string;
  refinement: number | null;
  style?: React.CSSProperties;
};

export const WeaponMiniDisplay: React.FC<WeaponMiniDisplayProps> = ({
  icon,
  refinement,
  style = {},
}) => {
  const _style = {
    ...style,
    // '--icon-url': `url(${icon})`,
  } as React.CSSProperties;

  return (
    <div className="table-icon-text-pair relative" style={_style}>
      <AssetFallback alt=" " src={icon} className="table-icon" />
      <span className="bottom-right-absolute">
        {refinement ? `R${refinement}` : "?"}
      </span>
    </div>
  );
};
