import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { IS_PRODUCATION } from "../../utils/maybeEnv";
import { cssJoin } from "../../utils/helpers";
import { useContext } from "react";

type ContentWrapperProps = {
  children: any;
};

export const ContentWrapper: React.FC<ContentWrapperProps> = ({ children }) => {
  const { contentWidth } = useContext(AdProviderContext);

  const classNames = cssJoin([
    "content-wrapper",
    IS_PRODUCATION ? "" : "dev-indicator",
  ]);

  const style = { maxWidth: contentWidth } as React.CSSProperties;

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
};
