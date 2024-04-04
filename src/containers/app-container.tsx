import React from "react";
import { useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import AppRouter from "../routers/app-router";

const AppContainer = () => {
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
      app container
      <AppRouter />
    </Wrapper>
  );
};

export default AppContainer;

const Wrapper = styled.div`
  height: 100vh;
  position: relative;
`;
