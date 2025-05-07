import "./style.scss";

import { AssetFallback } from "../AssetFallback";
import CrownOfInsight from "../../assets/images/Crown_of_Insight.webp";
import { cssJoin } from "../../utils/helpers";

type TalentsDisplayProps = {
  strikethrough: boolean;
  row?: any;
};

type TalentProps = {
  title: string;
  strikethrough: boolean;
  talent: {
    boosted: boolean;
    level: number;
    rawLevel: number;
    icon?: string;
  };
};

const TalentDisplay: React.FC<TalentProps> = ({
  title,
  talent,
  strikethrough,
}) => {
  const isBoosted = !!talent?.boosted;
  const isCrowned = talent?.rawLevel
    ? talent?.rawLevel === 10
    : talent?.level === (isBoosted ? 13 : 10);

  return (
    <div
      className="talent-display"
      title={`${title} - ${talent?.level}${isCrowned ? " - Crowned" : ""}`}
    >
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
}) => {
  return (
    <div className="hover-element talents-display">
      <div className="talent-list-container">
        <TalentDisplay
          title={"NA"}
          talent={row?.talentsLevelMap?.normalAttacks}
          strikethrough={strikethrough}
        />
        <TalentDisplay
          title={"Skill (E)"}
          talent={row?.talentsLevelMap?.elementalSkill}
          strikethrough={strikethrough}
        />
        <TalentDisplay
          title={"Burst (Q)"}
          talent={row?.talentsLevelMap?.elementalBurst}
          strikethrough={strikethrough}
        />
      </div>
    </div>
  );
};
