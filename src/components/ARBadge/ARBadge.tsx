import { useContext } from "react";
import "./style.scss";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";

type ARBadgeProps = {
  adventureRank?: number;
};

export const ARBadge: React.FC<ARBadgeProps> = ({ adventureRank }) => {
  const roundedAR = Math.round(adventureRank || 0);
  const { translate } = useContext(TranslationContext);

  const className = roundedAR
    ? `ar-${Math.floor(roundedAR / 5) * 5}-badge`
    : "ar-60-badge";

  return (
    <span
      title={`${translate("Adventure Rank")}: ${roundedAR}`}
      className={`ar-badge ${className}`}
    >
      AR{roundedAR ?? " ?"}
    </span>
  );
};
