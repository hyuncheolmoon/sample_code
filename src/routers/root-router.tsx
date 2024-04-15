import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import AppContainer from "../containers/app-container";
import LandingContainer from "../containers/landing-container";

const RootRouter = () => {
  return (
    <Routes>
      <Route path="/app/*" element={<AppContainer />} />
      <Route path="/landing/*" element={<LandingContainer />} />
      <Route path="/*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
};

export default RootRouter;
