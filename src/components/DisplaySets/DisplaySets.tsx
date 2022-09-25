import "./style.scss";

export const DisplaySets = ({ artifactSets }: any) => {
  const setNames = Object.keys(artifactSets);
  const activeSets = setNames.filter(
    (name: any) => artifactSets[name].count > 1
  );
  return (
    <div>
      <div className="table-set-display" >
        {activeSets.map((name) => {
          const { icon, count } = artifactSets[name];
          return (
            <div key={name} className="table-icon-text-pair relative">
              <img className="table-icon" src={icon}  />
              <span className="bottom-right-absolute" >
                {Math.floor(count / 2) * 2}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
