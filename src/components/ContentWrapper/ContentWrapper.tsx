import { useContext } from "react";
import { isProduction } from "../../App";
import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";

type ContentWrapperProps = {
  children: any;
};

export const ContentWrapper: React.FC<ContentWrapperProps> = ({ children }) => {
  const { contentWidth } = useContext(AdProviderContext);

  const classNames = ["content-wrapper", isProduction ? "" : "dev-indicator"]
    .join(" ")
    .trim();

  const style = { maxWidth: contentWidth } as React.CSSProperties;

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
};
