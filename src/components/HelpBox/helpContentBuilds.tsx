import { Link } from "react-router-dom";
import { StatIcon } from "../StatIcon";

export const getIconElement = (name: string) => (
  <img
    alt={name}
    className="table-icon"
    src={`https://enka.network/ui/UI_AvatarIcon_${name}.png`}
  />
);

export const helpContentBuilds = (
  <>
    <div className="help-box-header">
      Builds page is essentially <b>just</b> a builds browser.
    </div>
    <div className="help-box-p">
      Entries on this page happen to be sorted by CV by default, however
      <b> you cannot judge builds by CV alone</b>. You should not use
      information on this page as any meaningful character strength ranking or
      leaderboard. Actually meaningful rankings can be found on the{" "}
      <Link to="/leaderboards">Leaderboards page</Link>.
    </div>
    <div className="help-box-p">
      What is this page for then? Thats up to you, here are some examples:
      <div className="page-description-list">
        <div className="list-element">
          What weapons are popular on {getIconElement("Ayaka")} Ayaka?
        </div>
        <div className="list-element">
          What artifact sets are most commonly used on {getIconElement("Chiori")}{" "}
          Chiori ?
        </div>
        <div className="list-element">
          How popular is
          {getIconElement("Shougun")} Raiden Shogun in comparison to{" "}
          {getIconElement("Clorinde")}
          Clorinde ?
        </div>
        <div className="list-element">
          What is the highest
          <StatIcon name="Crit Rate" />
          Crit Rate on
          {getIconElement("Kokomi")} Kokomi or <StatIcon name="Crit DMG" />
          Crit DMG on
          {getIconElement("Hutao")} Hu Tao anyone has ever reached?
        </div>
        {/* <div className="list-element">
          And most importantly, who has the biggest Crit Value build? (
          <i>obviously compensating for something :-)</i>)
        </div> */}
      </div>
    </div>
    {/* @TODO: this info should go somewhere else, preferably some kind of dynamic tooltip */}
    {/* <div className="help-box-p">
      <b>RV (Roll Value)</b> is a metric that can be used to rate or sort
      (soon™) artifact and build substats. Genshin Optimizer describes RV as
      follows: "
      <i>
        The Roll Value (RV) of a substat is a percentage of the current value
        over the highest potential 5 value
      </i>
      ".
    </div>
    <div className="help-box-p">
      For example a HP% roll of 5.3% equals to 90% RV. That is because maximum
      roll value of HP% is 5.8%, therefore: 5.3/5.8 ~ 90%.
    </div> */}
  </>
);
