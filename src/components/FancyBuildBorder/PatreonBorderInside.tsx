import { cssJoin } from "../../utils/helpers";

type PatreonBorderInsideProps = {
  classNames?: string[];
  style?: React.CSSProperties;
  animationSpeedMultiplier?: number;
};

export const PatreonBorderInside: React.FC<PatreonBorderInsideProps> = ({
  classNames = [],
  style = {},
  animationSpeedMultiplier = 1,
}) => {
  const borderClassName = cssJoin(["patreon-stat-decoration", ...classNames]);

  const borderCssVars = {
    "--animation-duration": `${1.5 * animationSpeedMultiplier}s`,
  } as React.CSSProperties;

  return (
    <div style={style} className={borderClassName}>
      <div className="corner top-left" />
      <div className="corner top-right" />
      <div className="corner bottom-left" />
      <div className="corner bottom-right" />
      <div className="border top" style={borderCssVars} />
      <div className="border right" style={borderCssVars} />
      <div className="border bottom" style={borderCssVars} />
      <div className="border left" style={borderCssVars} />
    </div>
  );
};
