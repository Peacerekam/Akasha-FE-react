import "./index.scss";
import "./patreon.scss";
import "react-perfect-scrollbar/dist/css/styles.css";

import App from "./App";
// import React from "react";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
