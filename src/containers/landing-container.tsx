import React from "react";
import { useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import LandingRouter from "../routers/landing-router";
import { ContainerWrapper } from "../assets/styled";

const LandingContainer = () => {
  const location = useLocation();
  const wrapper = React.createRef();

  /********************************************************************************************
   * INITIALIZE
   *******************************************************************************************/
  /********************************************************************************************
   * ACTION / EVENT
   *******************************************************************************************/
  /********************************************************************************************
   * RENDER
   *******************************************************************************************/
  return (
    <ContainerWrapper ref={wrapper as React.RefObject<HTMLDivElement>}>
      landing container
      <LandingRouter />
    </ContainerWrapper>
  );
};

export default LandingContainer;

