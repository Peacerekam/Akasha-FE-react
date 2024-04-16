import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SettingsContext } from "../../context/SettingsProvider/SettingsProvider";
import { cssJoin } from "../../utils/helpers";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";

export const CalculationResultWidgetExpander: React.FC<{}> = () => {
  const { showcaseState, setShowcaseState } = useContext(SettingsContext);

  return (
    <div
      className="showcase-expand-wrapper"
      onClick={() => setShowcaseState((x) => !x)}
      title={`${showcaseState ? "Fold" : "Expand"} builds showcase`}
    >
      {/* expand */}
      <FontAwesomeIcon
        className={cssJoin([
          "chevron-down-icon",
          showcaseState ? "rotate-180deg" : "",
        ])}
        icon={faChevronDown}
        size="1x"
      />
    </div>
  );
};
