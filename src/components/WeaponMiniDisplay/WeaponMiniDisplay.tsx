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
  return (
    <div className="table-icon-text-pair relative" style={style}>
      <img src={icon} className="table-icon" />
      <span className="bottom-right-absolute">
        {refinement ? `R${refinement}` : "?"}
      </span>
    </div>
  );
};
