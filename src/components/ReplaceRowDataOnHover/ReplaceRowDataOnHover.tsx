import React, { useEffect, useRef, useState } from "react";
import "./style.scss";

type ReplaceRowDataOnHoverProps = {
  data: any;
  onHoverData: any;
};

export const ReplaceRowDataOnHover: React.FC<ReplaceRowDataOnHoverProps> = ({
  data,
  onHoverData,
}) => {
  const [minWidth, setMinWidth] = useState<number>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref?.current) return;
    setMinWidth(ref.current.offsetWidth);
  }, [ref]);

  return (
    <>
      <span className="show-on-hover" style={{ minWidth }}>
        {data}
      </span>
      <span className="hide-on-hover" ref={ref}>
        {onHoverData}
      </span>
    </>
  );
};
