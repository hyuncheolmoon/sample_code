import React, { useCallback, MouseEvent, useMemo } from "react";
import { NavLink } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import { filter, map } from "lodash";

import { palette } from "../../constants";

export enum LINK_TYPE {
  CATEGORY = "CATEGORY",
  LINK = "LINK",
}

type TNavLinkItemProps = {
  linkItem: any;
  miniSize: boolean;
  openList: string[];
  activeCategory: string;
  onDropdown?: (id: string) => void;
};

const LINK_HEIGHT = 42;
const LINK_MARGIN = 4;

const NavLinkItem = ({
  linkItem,
  miniSize,
  openList,
  activeCategory,
  onDropdown,
}: TNavLinkItemProps) => {
  const { name, path, categoryId, views, icon: Icon } = linkItem;

  const type = path ? LINK_TYPE.LINK : LINK_TYPE.CATEGORY;
  const url = type === LINK_TYPE.LINK ? `/admin${path}` : "";
  const open = openList.indexOf(categoryId as string) > -1;

  const children = useMemo(() => {
    if (!views) {
      return undefined;
    }
    return filter(views, (item) => !item.hidden);
  }, [views]);
  const isChildren = children && children.length > 0;
  /********************************************************************************************
   * ACTION / EVENT
   *******************************************************************************************/

  const handleClickCategory = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (type !== LINK_TYPE.CATEGORY) {
        return;
      }
      event.preventDefault();
      onDropdown?.(categoryId as string);
    },
    [onDropdown, type, categoryId],
  );
  /********************************************************************************************
   * RENDER
   *******************************************************************************************/

  return (
    <LinkItem>
      <Link
        type={type}
        to={url}
        className={activeCategory === categoryId ? "active-category" : ""}
        onClick={handleClickCategory}
      >
        {isChildren && !miniSize && <Caret open={open} />}
        {Icon && (
          <LinkIcon>
            <Icon fontSize={"inherit"} />
          </LinkIcon>
        )}
        {!miniSize && <LinkName>{name}</LinkName>}
      </Link>

      {type === LINK_TYPE.CATEGORY && isChildren && (
        <CollapseLinks open={open} count={children.length} miniSize={miniSize}>
          {map(children, (link: any) => (
            <NavLinkItem
              key={`link-${link.name}`}
              linkItem={link}
              miniSize={miniSize}
              openList={openList}
              activeCategory={activeCategory}
            />
          ))}
        </CollapseLinks>
      )}
    </LinkItem>
  );
};

export default React.memo(NavLinkItem);

/********************************************************************************************
 * STYLE
 *******************************************************************************************/

const LinkItem = styled.div`
  position: relative;
  text-align: left;
  white-space: nowrap;
  height: auto;
  text-decoration: none;
  box-sizing: border-box;
  border-radius: 3px;
  margin-top: ${LINK_MARGIN}px;
`;
// margin: ${(props: { type: LINK_TYPE }) => props.type === LINK_TYPE.LINK ? '4px 0 4px 0px' : '4px 0px'};

const LinkIcon = styled.div`
  font-size: 23px;
  padding: 3px 0;
  height: 30px;
  width: 30px;
  text-align: center;
`;

const LinkName = styled.span`
  margin-left: 6px;
`;
const Link = styled(NavLink)`
  color: ${palette.white};
  font-size: 14px;
  height: ${LINK_HEIGHT}px;
  display: flex;
  align-items: center;
  position: relative;
  transition: all 300ms linear;
  font-weight: 400;
  line-height: 1.5em;
  border-radius: 3px;
  padding: 10px;

  text-decoration: none;

  &.active-category {
    //background-color: #666666 !important;
    background-color: #353668 !important;
    //font-weight: bold;
  }

  &.active {
    background-color: ${(props) =>
      props.type === LINK_TYPE.LINK ? "#00855B !important" : "inherit"};
  }

  &:hover {
    background-color: #353668;
  }
`;

const Caret = styled.div`
  margin-top: 4px;
  margin-right: 14px;
  right: 0;
  position: absolute;
  transition: all 200ms ease-in;
  transform: translateY(-50%)
    rotate(${(props: { open: boolean }) => (props.open ? "0deg" : "-90deg")});
  border-top: 5px solid;
  border-right: 5px solid transparent;
  border-left: 5px solid transparent;
  color: ${palette.white};
  border-radius: 2.5px;
`;

type TCollapseProps = { miniSize: boolean; open: boolean; count: number };
const CollapseLinks = styled.div<TCollapseProps>`
  margin-left: 15px;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;

  visibility: ${({ miniSize }) => (miniSize ? "hidden" : "visible")};

  transition: height 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  ${({ open, count }) =>
    open
      ? css`
          margin-bottom: 4px;
          height: ${count * (LINK_HEIGHT + LINK_MARGIN)}px;
        `
      : css`
          margin-top: 0;
          height: 0;
          visibility: hidden;
        `};
`;
