import React from "react";
import { useLocation } from "react-router-dom";
import styled from "@emotion/styled";

import AppRouter from "../routers/app-router";
import { ContainerWrapper } from "../assets/styled";

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
    <ContainerWrapper ref={wrapper as React.RefObject<HTMLDivElement>}>
      app container
      <AppRouter />
    </ContainerWrapper>
  );
};

export default AppContainer;

