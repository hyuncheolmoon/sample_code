import React from "react";
import styled from "@emotion/styled";

import { height } from "../constants";

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <LeftMenu></LeftMenu>
        <RightMenu>휴..</RightMenu>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;

const HeaderContainer = styled.div`
  position: absolute;
  width: 100%;
  //padding: 10px 0;
  transition: all 150ms ease 0s;
  height: ${height.header}px;
  display: block;
  background-color: yellow;
`;
const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  //align-content: space-between;
  position: relative;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  padding-left: 15px;
  padding-right: 15px;
`;
const LeftMenu = styled.div`
  padding-left: 12px;
  flex: 1 1 auto;
`;

const RightMenu = styled.div`
  //padding-left: 12px;
  //align-self: end;
`;
