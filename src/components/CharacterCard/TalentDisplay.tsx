import { AssetFallback } from "../AssetFallback";
import CrownOfInsight from "../../assets/images/Crown_of_Insight.webp";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { cssJoin } from "../../utils/helpers";
import { useContext } from "react";

type TalentProps = {
  talent: {
    boosted: boolean;
    level: number;
    rawLevel: number;
    icon?: string;
    id?: string;
    index?: number;
  };
  characterId?: string;
  element?: string;
};

export const travelerIds = ["10000007", "10000005"];

export const TalentDisplay: React.FC<TalentProps> = ({
  talent,
  characterId,
  element,
}) => {
  const { language } = useContext(TranslationContext);

  const isBoosted = !!talent?.boosted;
  const isCrowned = talent?.rawLevel
    ? talent?.rawLevel === 10
    : talent?.level === (isBoosted ? 13 : 10);

  const isTraveler = characterId
    ? travelerIds.includes("" + characterId)
    : false;

  const suffix = isTraveler
    ? `-${element === "None" ? "Anemo" : element}`.toLowerCase()
    : "";

  const charId = `${characterId}${suffix}`;

  const talentTooltip = talent?.level
    ? {
        "data-gi-type": "talent",
        "data-gi-id": charId,
        "data-gi-level": talent?.level,
        "data-gi-index": talent?.index,
        "data-gi-lang": language,
      }
    : {};

  const classNames = cssJoin([
    "talent-display",
    isCrowned ? "talent-crowned" : "",
    isBoosted ? "talent-boosted" : "",
  ]);

  return (
    <div {...talentTooltip} className={classNames}>
      {talent?.icon ? (
        <span>
          <AssetFallback alt="" src={talent?.icon} />
        </span>
      ) : (
        <span>
          <div className="talent-icon-placeholder opacity-5">×</div>
        </span>
      )}
      <div className={"talent-display-value"}>
        <span>{talent?.level || "-"}</span>
        {isCrowned && (
          <img alt="crown" className="crown-of-insight" src={CrownOfInsight} />
        )}
      </div>
    </div>
  );
};
