import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import toast from "../../utils/toast";
import styled from "@emotion/styled";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  console.log(params);
  //useEffect(() => {
  //  toast.success("dddd");
  //}, []);

  /********************************************************************************************
   * SERVER REQUEST
   *******************************************************************************************/

  /********************************************************************************************
   * RENDER
   *******************************************************************************************/
  return <div>랜딩 페이지 : pathname : {location.pathname}</div>;
};

export default Dashboard;
