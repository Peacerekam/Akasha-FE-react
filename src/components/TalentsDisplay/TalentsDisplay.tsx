import "./style.scss";

import { AssetFallback } from "../AssetFallback";
import CrownOfInsight from "../../assets/images/Crown_of_Insight.webp";
import { Language } from "../../context/TranslationProvider/TranslationProviderContext";
import { cssJoin } from "../../utils/helpers";

type TalentsDisplayProps = {
  strikethrough: boolean;
  row?: any;
  characterId: string;
  language: Language;
};

type TalentProps = {
  title?: string;
  strikethrough: boolean;
  characterId: string;
  language: Language;
  index: number;
  talent: {
    boosted: boolean;
    level: number;
    rawLevel: number;
    icon?: string;
    // index?: number;
  };
};

const TalentDisplay: React.FC<TalentProps> = ({
  talent,
  strikethrough,
  characterId,
  language,
  index,
}) => {
  const isBoosted = !!talent?.boosted;
  const isCrowned = talent?.rawLevel
    ? talent?.rawLevel === 10
    : talent?.level === (isBoosted ? 13 : 10);

  const talentTooltip = talent?.level
    ? {
        "data-gi-type": "talent",
        "data-gi-id": characterId,
        "data-gi-level": talent?.level,
        "data-gi-index": index,
        "data-gi-lang": language,
      }
    : {};

  return (
    <div className="talent-display" {...talentTooltip}>
      {talent?.icon ? (
        <AssetFallback alt="" src={talent?.icon} />
      ) : (
        <div className="talent-icon-placeholder opacity-5">?</div>
      )}
      <div
        className={cssJoin([
          "talent-display-value",
          strikethrough ? "strike-through opacity-5" : "",
          isBoosted ? "talent-boosted" : "",
        ])}
      >
        {talent?.level}
        {isCrowned && (
          <img alt="crown" className="crown-of-insight" src={CrownOfInsight} />
        )}
      </div>
    </div>
  );
};

export const TalentsDisplay: React.FC<TalentsDisplayProps> = ({
  row,
  strikethrough,
  characterId,
  language,
}) => {
  return (
    <div className="hover-element talents-display">
      <div className="talent-list-container">
        <TalentDisplay
          index={0}
          talent={row?.talentsLevelMap?.normalAttacks}
          strikethrough={strikethrough}
          characterId={characterId}
          language={language}
        />
        <TalentDisplay
          index={1}
          talent={row?.talentsLevelMap?.elementalSkill}
          strikethrough={strikethrough}
          characterId={characterId}
          language={language}
        />
        <TalentDisplay
          index={2}
          talent={row?.talentsLevelMap?.elementalBurst}
          strikethrough={strikethrough}
          characterId={characterId}
          language={language}
        />
      </div>
    </div>
  );
};
