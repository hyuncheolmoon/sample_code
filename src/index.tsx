import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./assets/scss/index.scss";
import Root from "./root";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  </BrowserRouter>,
);
