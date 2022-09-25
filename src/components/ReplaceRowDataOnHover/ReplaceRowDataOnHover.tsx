import React from "react";
import "./style.scss";

export const ReplaceRowDataOnHover = ({
  data,
  onHoverData,
}: {
  data: any;
  onHoverData: any;
}) => {
  return (
    <>
      <span className="show-on-hover">{data}</span>
      <span className="hide-on-hover">{onHoverData}</span>
    </>
  );
};
