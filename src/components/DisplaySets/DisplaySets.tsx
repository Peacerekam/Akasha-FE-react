import "./style.scss";

import { AssetFallback } from "../AssetFallback";

type DisplaySetsProps = {
  artifactSets: any;
};

export const DisplaySets: React.FC<DisplaySetsProps> = ({ artifactSets }) => {
  const setNames = Object.keys(artifactSets);
  const activeSets = setNames
    .filter((name: any) => artifactSets[name].count > 1)
    .sort((a, b) => (a > b ? 1 : -1));
  return (
    <div>
      <div className="table-set-display">
        {activeSets.map((name) => {
          const { icon, count } = artifactSets[name];
          return (
            <div key={name} className="table-icon-text-pair relative">
              <AssetFallback
                alt=""
                className="table-icon"
                src={icon}
                isArtifact
              />
              <span className="bottom-right-absolute">
                {Math.floor(count / 2) * 2}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
