import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "../pages/landing/landing";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/landing/*" element={<LandingPage />} />
      <Route path="/" element={<Navigate to="landing" replace />} />
    </Routes>
  );
};

export default AppRouter;
