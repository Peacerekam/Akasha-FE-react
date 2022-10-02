import React from "react";
import "./style.scss";

type ReplaceRowDataOnHoverProps = {
  data: any;
  onHoverData: any;
};

export const ReplaceRowDataOnHover: React.FC<ReplaceRowDataOnHoverProps> = ({
  data,
  onHoverData,
}) => {
  return (
    <>
      <span className="show-on-hover">{data}</span>
      <span className="hide-on-hover">{onHoverData}</span>
    </>
  );
};
