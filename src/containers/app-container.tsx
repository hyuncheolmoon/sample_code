import React, { useCallback, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import styled from "@emotion/styled";

import AppRouter from "../routers/app-router";
import Header from "../components/header";
import Navbar from "../components/navbar";

import { ContainerWrapper } from "../assets/styled";
import { storage } from "../utils";
import { width } from "../constants";

const STORAGE_KEY = "edge-nav";
const AppContainer = () => {
  const [isEdge, setEdgeMode] = React.useState(storage.get(STORAGE_KEY));

  /********************************************************************************************
   * INITIALIZE
   *******************************************************************************************/
  /********************************************************************************************
   * ACTION / EVENT
   *******************************************************************************************/
  const handleToggleEdgeMode = useCallback(() => {
    setEdgeMode(!isEdge);
    if (!isEdge) {
      storage.set(STORAGE_KEY, true);
    } else {
      storage.del(STORAGE_KEY);
    }
  }, [isEdge]);
  /********************************************************************************************
   * RENDER
   *******************************************************************************************/
  return (
    <ContainerWrapper>
      <Navbar
        navData={[]}
        toggleEdgeMode={handleToggleEdgeMode}
        isEdge={isEdge}
      />
      <PageContents isEdge={isEdge}>
        <Header />
        <AppRouter />
      </PageContents>
    </ContainerWrapper>
  );
};

export default AppContainer;

const PageContents = styled.div<{ isEdge: boolean }>`
  transition-property: top, bottom, width;
  transition-duration: 0.2s, 0.2s, 0.35s;
  transition-timing-function: linear, linear, ease;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  //float: right;
  max-height: 100%;
  width: 100vw;
  //margin-left: ${({ isEdge }) => (isEdge ? width.nav.max : width.nav.min)}px;
  //width: calc( 100% - ${({ isEdge }) => (!isEdge ? width.nav.max : width.nav.min)}px
  );
`;
