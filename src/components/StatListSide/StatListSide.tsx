import { ARBadge } from "../ARBadge";
import "./style.scss";

type StatListSideProps = {
  strikethrough: boolean;
  row?: any;
};

type TalentProps = {
  strikethrough: boolean;
  talent: {
    boosted: boolean;
    level: number;
    icon?: string;
  };
};

const TalentDisplay: React.FC<TalentProps> = ({ talent, strikethrough }) => {
  return (
    <div className="talent-display">
      {talent?.icon ? (
        <img alt="" src={talent?.icon} />
      ) : (
        <div className="talent-icon-placeholder opacity-5" >?</div>
      )}
      <div
        className={`talent-display-value ${strikethrough ? 'strike-through opacity-5' : ''} ${
          talent?.boosted ? "talent-boosted" : ""
        }`}
      >
        {talent?.level}
      </div>
    </div>
  );
};

export const StatListSide: React.FC<StatListSideProps> = ({ row, strikethrough }) => {
  return (
    <div className="hover-element stat-list-side">
      <div className="adventure-rank-wrapper">
        <ARBadge adventureRank={row?.owner?.adventureRank} />
      </div>
      <div className="talent-list-container">
        <TalentDisplay talent={row?.talentsLevelMap?.normalAttacks} strikethrough={strikethrough} />
        <TalentDisplay talent={row?.talentsLevelMap?.elementalSkill} strikethrough={strikethrough} />
        <TalentDisplay talent={row?.talentsLevelMap?.elementalBurst} strikethrough={strikethrough} />
      </div>
    </div>
  );
};
