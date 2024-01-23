import { StatIcon } from "../StatIcon";
import { getIconElement } from "./helpContentBuilds";

export const helpContentArtifacts = (
  <>
    <div className="help-box-header">
      Objectively ranking artifacts for every scenario is <b>impossible</b>.
    </div>
    <div className="help-box-p">
      Default sorting for this table is by <b>CV (Crit Value)</b>. It is
      calculated with the following formula:
      <div className="desc-formula">
        2 × <StatIcon name="Crit RATE" />
        Crit RATE + <StatIcon name="Crit DMG" /> Crit DMG
      </div>
    </div>
    <div className="help-box-p">
      Crit Value is only "<i>good enough</i>" for basic artifact ranking, many characters
      require good amount of other stats such as <StatIcon name="ATK%" />ATK%, <StatIcon name="HP%" />HP% or <StatIcon name="Elemental Mastery" />Elemental Mastery,
      while some might not care about CV at all - looking at you, {getIconElement("Kokomi")} Kokomi.
    </div>
  </>
);
