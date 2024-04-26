import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import toast from "../../utils/toast";
import styled from "@emotion/styled";

const Landing = () => {
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
  return (
    <div>
      랜딩 페이지 : pathname : {location.pathname}
      <a href={"/app"}>바로가기</a>
    </div>
  );
};

export default Landing;
