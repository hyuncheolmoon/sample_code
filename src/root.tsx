import React from "react";
import moment from "moment";

import { ToastContainer } from "react-toastify";

import ErrorBoundary from "./components/error-boundary";
import RootRouter from "./routers/root-router";

window.moment = moment;

function Root() {
  return (
    <div>
      <ErrorBoundary>
        <ToastContainer limit={5} />
        <RootRouter />
      </ErrorBoundary>
    </div>
  );
}

export default Root;
