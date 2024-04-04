import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import AppContainer from "../containers/app-container";

const RootRouter = () => {
  return (
    <Routes>
      <Route path="/app/*" element={<AppContainer />} />
      <Route path="/*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};

export default RootRouter;
