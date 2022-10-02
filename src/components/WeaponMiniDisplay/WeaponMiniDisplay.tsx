type WeaponMiniDisplayProps = {
  icon: string;
  refinement: number;
}

export const WeaponMiniDisplay: React.FC<WeaponMiniDisplayProps> = ({
  icon,
  refinement,
}) => {
  return (
    <div className="table-icon-text-pair relative">
      <img
        src={icon}
        className="table-icon"
      />
      <span  className="bottom-right-absolute">
        R{refinement}
      </span>
    </div>
  );
};
