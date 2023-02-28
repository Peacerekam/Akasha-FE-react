import React from "react";
import "./style.scss";

type PageMessageProps = {
  message: string;
};

export const PageMessage: React.FC<PageMessageProps> = ({ message }) => {
  return (
    <div className="page-message">
      {message.split("\\n").map((string) => (
        <div key={string}>{string}</div>
      ))}
    </div>
  );
};
