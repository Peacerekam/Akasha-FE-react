import CrownOfInsight from "../../assets/images/Crown_of_Insight.webp";

type TalentProps = {
  talent: {
    boosted: boolean;
    level: number;
    rawLevel: number;
    icon?: string;
  };
};

export const TalentDisplay: React.FC<TalentProps> = ({ talent }) => {
  const isBoosted = !!talent?.boosted;
  const isCrowned = talent?.rawLevel
    ? talent?.rawLevel === 10
    : talent?.level === (isBoosted ? 13 : 10);

  return (
    <div
      className={`talent-display ${isCrowned ? "talent-crowned" : ""} ${
        isBoosted ? "talent-boosted" : ""
      }`}
    >
      {talent?.icon ? (
        <span>
          <img alt="" src={talent?.icon} />
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
