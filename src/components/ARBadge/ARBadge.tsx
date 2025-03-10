import "./style.scss";

import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { useContext } from "react";

type ARBadgeProps = {
  adventureRank?: number;
};

export const ARBadge: React.FC<ARBadgeProps> = ({ adventureRank }) => {
  const roundedAR = Math.round(adventureRank || 0);
  const { translate } = useContext(TranslationContext);

  const className = roundedAR
    ? `ar-${Math.floor(roundedAR / 5) * 5}-badge`
    : "ar-0-badge";

  return (
    <span
      title={`${translate("Adventure Rank")}: ${roundedAR}`}
      className={`ar-badge ${className}`}
    >
      AR{roundedAR ?? " ?"}
    </span>
  );
};
