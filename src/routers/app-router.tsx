import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import DashboardPage from "../pages/dashboard/dashboard";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<DashboardPage />} />
      <Route path="/*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
