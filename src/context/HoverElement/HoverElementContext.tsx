import React, { createContext, useCallback, useEffect, useState } from "react";

import { TableHoverElement } from "../../components";
import { useLocation } from "react-router-dom";

type HoverElementContextType = {
  hoverElement: JSX.Element;
  updateTableHoverElement: (props: { [key: string]: any }) => void;
  setCalculationColumn: (col: string) => void;
};

const defaultValue = {
  hoverElement: <></>,
  updateTableHoverElement: () => {},
  setCalculationColumn: () => {},
} as HoverElementContextType;

const HoverElementContext = createContext(defaultValue);

const HoverElementContextProvider: React.FC<{ children: any }> = ({
  children,
}) => {
  const [hoverElement, setHoverElement] = useState<JSX.Element>(<></>);
  const [calculationColumn, setCalculationColumn] = useState<string>();
  const location = useLocation();

  useEffect(() => {
    // to avoid sticky hover element glitch on new pages
    setHoverElement(<></>);
  }, [location.pathname]);

  const updateTableHoverElement = useCallback(
    (props: any) => {
      const el = (
        <TableHoverElement currentCategory={calculationColumn} {...props} />
      );
      setHoverElement(el);
    },
    [calculationColumn]
  );

  const value = {
    hoverElement,
    updateTableHoverElement,
    setCalculationColumn,
  };

  return (
    <HoverElementContext.Provider value={value}>
      {children}
    </HoverElementContext.Provider>
  );
};

export { HoverElementContext, HoverElementContextProvider };
