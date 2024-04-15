import React from "react";
import { useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import LandingRouter from "../routers/landing-router";

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
    <Wrapper ref={wrapper as React.RefObject<HTMLDivElement>}>
      landing container
      <LandingRouter />
    </Wrapper>
  );
};

export default LandingContainer;

const Wrapper = styled.div`
  height: 100vh;
  position: relative;
`;
