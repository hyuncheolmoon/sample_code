import React, { useState, useMemo, useRef, useCallback } from "react";
import styled from "@emotion/styled";
import { filter, forEach } from "lodash";

import { ViewList, MenuOpen } from "@mui/icons-material";

import { NavList } from "./templetes";

import { palette, width, height } from "../constants";

type TNavbarProps = {
  navData: any;
  isEdge: boolean;
  toggleEdgeMode: () => void;
};

const Navbar = ({ navData, isEdge, toggleEdgeMode }: TNavbarProps) => {
  const [isHover, setHover] = useState(false);

  const navList = useMemo(() => {
    const navs: any[] = [];
    forEach(navData, (section) => {
      const links = filter(section.links, (item) => !item.hidden);
      if (links.length === 0) {
        return;
      }
      navs.push(section.section);
      navs.push(...section.links);
    });
    return navs;
  }, [navData]);


  /********************************************************************************************
   * INITIALIZE
   *******************************************************************************************/
  /********************************************************************************************
   * ACTION / EVENT
   *******************************************************************************************/
  const setDrawerNavbar = useCallback(() => {
    if (!isEdge || isHover) {
      return;
    }
    setHover(true);
  }, [isEdge, isHover]);

  const unsetDrawerNavbar = useCallback(() => {
    if (!isEdge || !isHover) {
      return;
    }
    setHover(false);
  }, [isEdge, isHover]);

  /********************************************************************************************
   * RENDER
   *******************************************************************************************/

  const miniSize = useMemo(() => isEdge && !isHover, [isEdge, isHover]);
  return (
    <NavbarDrawer
      // anchor="left"
      // PaperProps={{ style: { overflowX: "hidden" } }}
      // variant="permanent"
    >
      <NavLayout
        miniSize={miniSize}
        // onMouseEnter={setDrawerNavbar}
        // onMouseLeave={unsetDrawerNavbar}
      >
        <NavHeader>
          <MiniNavBtn onClick={toggleEdgeMode} aria-label="toggle-navbar">
            {isEdge ? <ViewList /> : <MenuOpen />}
          </MiniNavBtn>
        </NavHeader>
        <div>
          <NavList miniSize={miniSize} navList={navList} />
        </div>
      </NavLayout>
    </NavbarDrawer>
  );
};

export default Navbar;

const NavbarDrawer = styled.div`
  border: none;
  position: relative;
  transition-property: top, bottom, width;
  transition-duration: 0.2s, 0.2s, 0.35s;
  transition-timing-function: linear, linear, ease;
  overflow-y: initial;
  border-right: 1px solid #f2f4f6;
`;

const NavLayout = styled.div<{ miniSize: boolean }>`
  width: ${({ miniSize }) => (!miniSize ? width.nav.min : width.nav.max)}px;
  height: 100vh;
  color: ${palette.white};
  position: relative;
  background-color: #1c2536;
  transition-property: top, bottom, width;
  transition-duration: 0.2s, 0.2s, 0.35s;
  transition-timing-function: linear, linear, ease;
`;

const NavHeader = styled.div`
  height: ${height.header}px;
  width: auto;
  padding: 15px 15px;
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.3);
`;

const MiniNavBtn = styled.button`
  width: 30px;
  height: 30px;
  font-size: 20px;
  text-align: center;
  position: absolute;
  right: 14px;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  //transition: box-shadow 0.2s cubic-bezier(0.4, 0, 1, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  svg {
    fill: ${palette.gray500};
    height: 22px;
    width: 22px;
  }

  &:hover {
    svg {
      fill: ${palette.white};
    }
  }
`;
