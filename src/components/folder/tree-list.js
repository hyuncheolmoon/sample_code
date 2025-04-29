import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { string, number, func, object, array } from 'prop-types';
import styled, { css } from 'styled-components';
import { find, uniq, remove, findIndex, sortBy } from 'lodash';
import { ClickAwayListener, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import hexToRgba from 'hex-to-rgba';

import SocketClient from '../../cores/SocketClient';

import { WebServerConstant } from '../../constants/constants.json';
import Colors from '../../constants/Colors';
import { Beecon, IconFormCheckBox } from '../Icon';
import { layoutSize } from '../../design-system/layouts';
import { Button, IconButton } from '../Button';
import { PresetTooltip } from '../Tooltip';
import { mediaBreakpointDown } from '../../constants/breakpoints';
import { textTruncate } from '../../design-system/text';
import { StyledStatus } from '../../design-system/left-navigation';

import {
  getFolderList,
  // postFolderRegist,
  putFolderPositionChangeSingle,
  putFolderPositionChangeMulti,
  putFolderFold,
  deleteFolder,
  putFolderName,
  syncUpdateFolder,
} from '../../redux/actions/projectFolder';

import { setPresetProject } from '../../redux/actions/project';
import { registerNewUser } from '../../redux/actions/user';

import Folder from './Model/folder';
import FolderOptions from './Popup/FolderOptions';

// import CreateFolder from './Header/CreateFolder';
import EditFolderName from './EditFolderName';

import bee from '../../utils/bee';

const { PushType } = WebServerConstant;

const focusClassName = 'focused';
const dragColor = '#ccc';

class TreeList extends Component {
  static defaultProps = { folderList: [], searchText: '', getRef: () => {} };

  static propTypes = {
    //root
    location: object.isRequired,
    //action
    registerNewUser: func.isRequired,
    setPresetProject: func.isRequired,
    // postFolderRegist: func.isRequired,
    getFolderList: func.isRequired,
    putFolderPositionChangeSingle: func.isRequired,
    putFolderPositionChangeMulti: func.isRequired,
    putFolderFold: func.isRequired,
    deleteFolder: func.isRequired,
    putFolderName: func.isRequired,
    syncUpdateFolder: func.isRequired,
    //reduce
    userAuthInfo: object.isRequired,
    presetProjectNos: array,
    folderList: array,
    projectList: array,
    completedProjectList: array,
    pushFolder: object,
    //props
    getRef: func,
    onDragMode: func,
    updatedNos: array,
    newNos: array,
    activeNo: number,
    onProjectClick: func.isRequired,
    searchText: string, //검색어가 있으면 검색 모드... drag기능 막음
    onCompletedOpen: func.isRequired, //완료된 협업공간 리스트 오픈
  };

  constructor(props) {
    super(props);

    this.state = {
      dragNode: null,
      dragMode: false,
      checkedNos: [],
      presetInfoOpen: false,
      presetTooltipNo: 0, // 프리셋 생성후 정보 출력
      treeList: [], //검색시 필터 데이터
      focusNo: -100,
    };

    //서버에서 받은 원본 데이터..
    this.rawDatas = [];

    //트리형 리스트
    this.treeList = [];

    //검색시 생성하는 완료된 협업공간 폴더
    this.completedFolder = null;

    //key value형 model데이터
    this.treeDatas = {};

    //단일 현재 드래그 중인 데이터
    this.dragData = null;

    //폴더 설정 팝업
    this.optionRef = null;

    // 이전 클릭 상태, shift 다중선택 이벤트로 사용
    this.recentCheckValue = false;
    this.recentCheckNode = null;

    props.getRef(this);
  }

  componentDidMount() {
    this.setTreeDatas();
    this.createCompletedFolder();
  }

  componentDidUpdate(prevProps) {
    const {
      folderList,
      // projectList,
      searchText,
      pushFolder,
      location,
    } = this.props;
    if (prevProps.folderList !== folderList) {
      this.setTreeDatas();
      this.createCompletedFolder();
    }

    if (prevProps.searchText !== searchText) {
      this.setFilterList();
    }

    if (pushFolder && prevProps.pushFolder !== pushFolder) {
      this.realtimeSyncFolderList();
    }
    if (location.pathname !== prevProps.location.pathname) {
      this.handleCancelDragMode();
    }
  }

  componentDidCatch(error, errorInfo) {
    bee.putLogging(error, errorInfo);
  }
  /**************************************************************************
   *
   *                          SYNC
   *
   *************************************************************************/

  realtimeSyncFolderList = () => {
    const { pushFolder, syncUpdateFolder } = this.props;
    const pushData = pushFolder.pushData;

    if (!pushData) {
      return;
    }

    const custom = pushData.customParam;

    switch (pushFolder.pushType) {
      case PushType.PROJECT_NAME_CHANGE: {
        return this.getFolderList();
      }
      case PushType.PROJECT_FOLDER_CHANGE: {
        const folder = this.treeDatas[custom?.folderNo];
        if (!folder) {
          return this.getFolderList();
        }

        if (custom.type === 'display' && folder.display !== custom.foldYn) {
          syncUpdateFolder({
            folderNo: folder.folderNo,
            display: custom.foldYn,
          });
        } else if (
          custom.type === 'nameChange' &&
          folder.folderName !== custom.folderName
        ) {
          syncUpdateFolder({
            folderNo: folder.folderNo,
            folderName: custom.folderName,
          });
          // folder.folderName = custom.folderName;
          // this.forceUpdate();
        } else if (custom.type !== 'display' && custom.type !== 'nameChange') {
          this.getFolderList();
        }
        break;
      }
      default:
        break;
    }
  };

  /**************************************************************************
   *
   *                      KEYBOARD EVENT
   *
   *************************************************************************/

  setFocusNo = (nodeEl) => {
    if (!nodeEl) {
      this.setState({ focusNo: -100 });
      return;
    }

    // nodeEl.classList.add(focusClassName);
    this.setState({ focusNo: parseInt(nodeEl.dataset.projectNo) });
  };

  setNodeElementList = () => {
    const nodeList = document.getElementsByClassName('project-focus-node');
    this.nodeList = [];
    for (let i in nodeList) {
      const n = nodeList[i];
      if (typeof n !== 'object') {
        break;
      }
      this.nodeList.push(n);
    }
  };

  /**
   * 검색시 0번지에 자동 focus
   */
  handleAutoFocus = () => {
    // this.nodeList[0]?.classList.add(focusClassName);
    this.setFocusNo(this.nodeList[0]);
  };

  handleFocusDown = () => {
    let focusNode = null;
    let focusIdx = 0;
    this.nodeList.forEach((n, idx) => {
      if (n.classList.contains(focusClassName)) {
        focusNode = n;
        focusIdx = idx;
      }
    });
    if (!focusNode) {
      this.setFocusNo(this.nodeList[0]);
      return;
    }
    // focusNode.classList.remove(focusClassName);
    const nextNode = this.nodeList[focusIdx + 1];
    if (!nextNode) {
      return;
    }

    this.setFocusNo(nextNode);
    nextNode?.scrollIntoView({ block: 'nearest' });
    // nextNode?.scrollIntoView();
  };

  handleFocusUp = () => {
    let focusNode = null;
    let focusIdx = 0;
    this.nodeList.forEach((n, idx) => {
      if (n.classList.contains(focusClassName)) {
        focusNode = n;
        focusIdx = idx;
      }
    });
    if (!focusNode || focusIdx === 0) {
      return;
    }
    const prevNode = this.nodeList[focusIdx - 1];
    // focusNode.classList.remove(focusClassName);

    this.setFocusNo(prevNode);
    // prevNode?.scrollIntoView();
    prevNode?.scrollIntoView({ block: 'center' });
  };

  /**
   *
   * @param projectNo 클릭시 projectNo가 넘어와 실행(우선순위)
   * projectNo는 검색중 클릭시, 없을시 검색중 enter 클릭시 focus로
   */
  handleFocusSelect = (projectNo) => {
    const { focusNo } = this.state;
    const { onCompletedOpen, searchText } = this.props;

    const selectedNo = projectNo || focusNo;

    let focusedNode = document.getElementById(`nav-project-${selectedNo}`);

    if (!focusedNode) {
      return;
    }
    const child = focusedNode.querySelector('div');
    child.click();

    const completed = find(this.completedFolder.children, [
      'projectNo',
      selectedNo,
    ]);
    //완료된 프로젝트는 검색종료시 트리에서 사라짐으로 오픈하고 포커스
    if (completed) {
      onCompletedOpen(() => {
        const completedNode = document.getElementById(
          `nav-project-${selectedNo}`,
        );
        completedNode?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        this.setState({ focusNo: -100 });
      });
      return;
    }
    //부모 폴더가 닫혀있을시 열어주는 로직
    const focusFolderNo = focusedNode.dataset.folderNo;
    const folderInfo = this.treeDatas[focusFolderNo];
    const parentInfo = folderInfo.parentInfo;
    console.log('guscjf', parentInfo);
    if (parentInfo?.display === 'N') {
      this.handleFolderFold(parentInfo, 'Y', true);
    }

    if (searchText) {
      this.setState({ focusNo: -100 });
    }

    setTimeout(() => {
      focusedNode?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 0);
  };

  /**************************************************************************
   *
   *                        TREE DATA INIT
   *
   *************************************************************************/

  /**
   * 검색기능...
   */
  setFilterList = () => {
    const { searchText } = this.props;
    const treeList = this.treeList;

    this.completedFolder.show = true;
    this.rawDatas.forEach((n) => {
      n.show = true;
    });
    if (!searchText) {
      this.setState({ treeList, focusNo: -100 }, () => {
        setTimeout(this.setNodeElementList, 0);
      });
      return;
    }

    // 일반 협업공간 필터
    this.rawDatas.forEach((n) => {
      if (n.type === 'F') {
        return;
      }
      const name = n?.projectInfo?.projectName || '';
      if (name.toLowerCase().indexOf(searchText?.toLowerCase()) === -1) {
        n.show = false;
      }
    });

    // 완료된 협업공간 폴더 필터
    this.completedFolder.children.forEach((c) => {
      c.show = true;
      const name = c?.projectInfo?.projectName || '';
      if (name.toLowerCase().indexOf(searchText?.toLowerCase()) === -1) {
        c.show = false;
      }
    });

    const filterList = [...treeList, this.completedFolder];
    // 자식노드가 모두 보이지 않으면 폴더도 숨김
    filterList.forEach((f) => {
      if (f.type === 'P') {
        return;
      }
      if (!f.showChild()) {
        f.show = false;
      }
    });

    this.setState({ treeList: filterList }, () => {
      setTimeout(() => {
        this.setNodeElementList();
        this.handleAutoFocus();
      }, 0);
    });
  };

  /**
   * 완료된 협엄공간 폴더 생성
   */
  createCompletedFolder = () => {
    const { completedProjectList } = this.props;

    //folderList.forEach((f) => {
    //  const folder = new Folder(f);
    //  folder.display = 'Y';
    //  this.searchDatas.push(folder);
    //});
    const completeFolder = new Folder({
      folderNo: -100,
      folderName: bee.getI18n('LNB.PROJECT_COMPLETED'),
      parent: 0,
      depth: 1,
      type: 'F',
      display: 'Y',
      projectNo: 0,
    });
    completedProjectList.forEach((c) => {
      const folder = new Folder({
        folderNo: c.projectNo,
        folderName: c.projectName,
        parent: -100,
        depth: 2,
        type: 'P',
        display: 'Y',
        projectNo: c.projectNo,
      });
      folder.setProject(c);
      completeFolder.children.push(folder);
    });
    // console.log('guscjf', completeFolder);
    this.completedFolder = completeFolder;
  };

  /**
   * @param list
   * 노드의 다음노드 셋
   */
  relationNode = (list) => {
    list.forEach((n, idx) => {
      const prev = list[idx - 1];
      prev && n.setPrev(prev);
      prev && prev.setNext(n);
      n.children.length > 0 && this.relationNode(n.children);
    });
  };

  /**
   * 최초 서버 데이터를 트리 데이터로 변경
   */
  setTreeDatas = () => {
    const {
      folderList = [],
      projectList,
      presetProjectNos,
      userAuthInfo,
    } = this.props;
    let treeList = [];
    let parentObj = null;
    this.rawDatas = [];

    let presetNo = 0;
    folderList?.forEach((f) => {
      //seq가 음수인 데이터는 잘못된 데이터임. 무시해야함
      if (f.seq < 0) {
        // console.log('comapleted folder data', f);
        return;
      }
      if (!f) {
        // console.error('invalid folder data', f);
        return;
      }

      const folder = this.convertModel(f);

      this.rawDatas.push(folder);

      if (folder.type === 'F') {
        parentObj = folder;
        treeList.push(folder);
      } else {
        // 폴더 안에 프로젝트가 있을시 항상 폴더가 먼저 나오는기준
        const project = find(projectList, { projectNo: folder.projectNo });
        //projectList에 값이 없으면 출력 자체를 안함
        if (!project) {
          console.log('guscjf  프로젝트 정보 없음 :  ', folder);
          return;
        }
        folder.setProject(project);
        folder.parent ? parentObj.children.push(folder) : treeList.push(folder);
        folder.parent && folder.setParent(parentObj);

        /**
         * 방금 생성한 프리셋 넘버를 현재 프로젝트에서 찾기 로직,,,, 개선은 나중에... 일단 빠르게 .. 시간이 없다
         */
        if (
          userAuthInfo.isNew &&
          presetProjectNos &&
          f.projectNo &&
          presetProjectNos.indexOf(f.projectNo) > -1 &&
          presetNo === 0
        ) {
          console.log('guscjf', f.projectNo);
          presetNo = f.projectNo;
        }
        // presetNo = 30034888;
      }
    });
    this.treeList = treeList;
    this.relationNode(treeList);

    this.setState(
      {
        presetTooltipNo: presetNo,
        presetInfoOpen: presetNo > 0,
        // presetInfoOpen: true,
      },
      this.setFilterList,
    );
  };

  /**************************************************************************
   *
   *                        TREE DATA CONTROL
   *
   *************************************************************************/

  /**
   * @param parent
   * @param node
   * @description 프로젝트를 폴더로 넣을때(폴더로 drop)
   */
  dropFolderNode = (dropNode) => {
    const dragNode = this.dragData;
    //해당 폴더에서 폴더로 넣을때
    if (dragNode.parent === dropNode.folderNo) {
      return;
    }
    if (dropNode.type === 'P') {
      return;
    }

    let seq = 1;
    if (dropNode.children?.length > 0) {
      seq = dropNode.children[dropNode.children.length - 1]?.seq + 1;
    }

    if (dropNode.display === 'N') {
      this.handleFolderFold(dropNode, 'Y');
    }

    this.hubChangeSeq(dragNode, dropNode.folderNo, seq);
  };

  /**
   * @param dropNode
   * @description 폴더의 밑에 드롭했을 때 자식노드가 있으면 자식노드중 가장 상위에 위치하게
   */
  dropFolderTopNode = (dropNode) => {
    const dragNode = this.dragData;
    const seq = 1;

    this.hubChangeSeq(dragNode, dropNode.folderNo, seq);
  };

  /**
   * @param dropNode
   * @description 노드의 상위
   */
  dropTopNode = (dropNode) => {
    const dragNode = this.dragData;
    const seq = dropNode.seq;

    this.hubChangeSeq(dragNode, dropNode.parent, seq);
  };

  /**
   * @param dropNode
   * @description 노드의 밑
   */
  dropBottomNode = (dropNode) => {
    const dragNode = this.dragData;
    let seq = dropNode.seq;

    // const { checkedNos } = this.state;
    seq = dropNode?.nextNode?.seq || seq + 1;

    this.hubChangeSeq(dragNode, dropNode.parent, seq);
  };
  /**************************************************************************
   *
   *                        TREE UTIL
   *
   *************************************************************************/

  /**
   *
   * @param data
   * @return {Folder}
   */
  convertModel = (data) => {
    const folder = new Folder(data);
    this.treeDatas[data.folderNo] = folder;
    return folder;
  };

  /**
   * @param folderNo
   * @return {HTMLElement}
   * @description folderNo를 통해 해당 노드를 찾음
   */
  getNode = (folderNo) => {
    const dropNodeEl = document.getElementById(`node-area-${folderNo}`);
    // const dropNodeEl = document.getElementById(`node-area-${folderNo}`);
    return dropNodeEl;
  };

  /**
   *
   * @param node
   * @param event
   * 드래그시 마우스에 보이는 이미지 설정
   */
  showDragElement = (node, event) => {
    let dragEl = document.getElementById('drag-element');
    dragEl = dragEl.cloneNode(true);
    document.body.appendChild(dragEl);
    event.nativeEvent.dataTransfer.setDragImage(dragEl, 0, 0);
  };

  /**
   *
   * @param node
   * @param event
   * @param type  P, F
   * @description 드래그중 노드에서 Y축 좌표값을 분석 위치를 반환
   * @return number : top, 1 : bottom
   */
  getPosition = (element, event, type) => {
    const mouseY = event.clientY;
    const p = element.getBoundingClientRect();

    if (type == 'P') {
      const middle = (p.top + p.bottom) / 2;
      return mouseY < middle ? -1 : 1;
    }

    const edge = (p.bottom - p.top) / 5;
    if (p.top + edge > mouseY) {
      return -1;
    } else if (p.bottom - edge < mouseY) {
      return 1;
    } else {
      return 0;
    }
  };
  /**************************************************************************
   *
   *                        TREE EVENT
   *
   *************************************************************************/

  handleDragStart = (node, event) => {
    if (this.dragData) {
      return;
    }
    const { dragMode, checkedNos } = this.state;
    // @TODO 드래그 모드일때 무조건 넣는게 아니라 폴더를 드래그 폴더를 드래그 했을때의 처리를 분기로 처리해야할듯.. 예외가 많음
    if (dragMode && !node.isChecked(checkedNos)) {
      checkedNos.push(node.folderNo);
      this.setState({ checkedNos });
    }

    this.optionRef?.handleClose();
    // console.log('guscjf start', event, node);
    this.dragData = node;
    this.setState({ dragNode: node }, () => {
      this.showDragElement(node, event);
    });
  };

  handleDragEnd = () => {
    // console.log('guscjf end', event, node);
    this.setState({ dragNode: null });
    this.dragData = null;
  };

  /**
   *
   * @param event
   * @param node
   * @description 프로젝트의 ui 처리
   */
  handleDragOver = (node, event) => {
    // console.log('guscjf over', event, node);
    const dropNodeEl = this.getNode(node.folderNo);
    const position = this.getPosition(dropNodeEl, event, node.type);
    dropNodeEl.style.borderTop = '';
    dropNodeEl.style.borderBottom = '';
    dropNodeEl.style.background = '';

    switch (position) {
      case -1:
        if (node.parent && this.dragData.type === 'F') {
          return;
        }
        dropNodeEl.style.borderTop = `1px solid ${dragColor}`;
        break;
      case 0:
        //0은 폴더만 옮
        if (node.type === 'F' && this.dragData.type === 'F') {
          return;
        }
        dropNodeEl.style.background = dragColor;
        break;
      case 1:
        if (node.parent && this.dragData.type === 'F') {
          return;
        }
        if (
          node.type === 'F' &&
          node.display === 'Y' &&
          this.dragData.type === 'F'
        ) {
          return;
        }
        dropNodeEl.style.borderBottom = `1px solid ${dragColor}`;
        break;
    }

    // console.log('guscjf over', event, node, event.target);
  };

  handleDragLeave = (node) => {
    // console.log('guscjf', node);
    const dropNodeEl = this.getNode(node.folderNo);
    //project type
    // const dropNodeEl = event.target;
    dropNodeEl.style.borderTop = '';
    dropNodeEl.style.borderBottom = '';
    dropNodeEl.style.background = '';
    // dropNodeEl.style.cursor = 'pointer';
    // console.log('guscjf leave', event, node);
  };

  handleDrop = (node, event) => {
    const dropNodeEl = this.getNode(node.folderNo);
    // console.log('guscjf drop', event, node);
    dropNodeEl.style.background = '';
    dropNodeEl.style.borderTop = '';
    dropNodeEl.style.borderBottom = '';
    // dropNodeEl.style.cursor = 'pointer';

    const { dragMode } = this.state;
    const position = this.getPosition(dropNodeEl, event, node.type);

    switch (position) {
      case -1:
        if (this.dragData.type === 'F' && node.parent) {
          bee.toast('LNB.FOLDER_DROP_WARNING');
          dragMode && this.handleRemoveFolder();
          return;
        }
        this.dropTopNode(node);
        break;
      case 0:
        //0은 폴더만 옮
        if (this.dragData.type == 'F' && node.type === 'F') {
          bee.toast('LNB.FOLDER_DROP_WARNING');
          dragMode && this.handleRemoveFolder();
          return;
        }
        this.dropFolderNode(node);
        break;
      case 1:
        if (this.dragData.type === 'F' && node.parent) {
          bee.toast('LNB.FOLDER_DROP_WARNING');
          dragMode && this.handleRemoveFolder();
          return;
        }

        if (
          node.type === 'F' &&
          node.display === 'Y' &&
          this.dragData.type === 'F'
        ) {
          return;
        }
        // 폴더의 밑에 드롭했을 때 자식노드가 있으면 자식노드중 가장 상위에 위치하게
        if (
          this.dragData.type === 'P' &&
          node.type === 'F' &&
          node.hasChild()
        ) {
          this.dropFolderTopNode(node);
          return;
        }
        this.dropBottomNode(node);
        break;
    }
    this.dragData = null;
  };

  handleDrag = () => {
    // console.log('guscjf drag', event, node);
  };

  /**
   *
   * @param node
   * @param event
   * 폴더 ui 처리
   */
  handleDragEnter = () => {
    //if (node.type === 'P' || this.dragData.type === 'F') {
    //  return;
    //}
    //if (node.display === 'N') {
    //  this.handleFolderFold(node, 'Y');
    //}
  };

  handleEndDragOver = () => {
    const endNode = document.getElementById('end-node');
    endNode.style.borderTop = `1px solid ${dragColor}`;
  };

  handleEndDragLeave = () => {
    const endNode = document.getElementById('end-node');
    endNode.style.borderTop = '';
  };

  handleEndDrop = () => {
    const dragNode = this.dragData;
    const dropNode = this.treeList[this.treeList.length - 1] || null;
    const endNode = document.getElementById('end-node');
    endNode.style.borderTop = '';
    if (!dropNode) {
      //없을리가 없음.. 드래그할 대상자가 없으면 endDrop이 실행 못함
      return;
    }

    this.hubChangeSeq(dragNode, 0, dropNode.seq + 1);
  };

  /**************************************************************************
   *
   *                       EVENT / ACTION
   *
   *************************************************************************/

  /**
   *
   * @param event
   * @param node
   * 폴더 옵션 팝업 오픈
   */
  handleFolderOptionOpen = (event, node) => {
    this.optionRef.handleOpen(event.target, node);
  };

  /**
   */
  /**
   * @param node
   * @description 폴더 이름 수정 모드
   */
  handleFolderEditMode = (node) => {
    console.log('guscjf', node);
    if (node.type === 'P') {
      return;
    }
    node.setEditMode(true);
    this.forceUpdate();
  };

  /**
   * @param node
   * @description 폴더 이름 수정 취소
   */
  handleFolderEditCancel = (node) => {
    node.setEditMode(false);
    this.forceUpdate();
  };

  /**
   * 프로젝트 페이지로
   * @param node
   */
  handleGoProject = (node) => {
    const { onProjectClick } = this.props;
    bee.history.push(`/project/${node.projectNo}`);
    onProjectClick(node.projectNo);
  };

  /**
   *
   * @param node
   * @param event
   * node의 체크박스를 눌렀을때
   */
  handleCheckNode = (node, event) => {
    event.stopPropagation();
    const { dragMode } = this.state;
    const { onDragMode } = this.props;

    if (dragMode && event.shiftKey) {
      this.handleSelectNode(node, event);
      return;
    }
    const no = node.folderNo;
    this.setState((prevState) => {
      let checkedNos = prevState.checkedNos;
      if (node.isChecked(checkedNos)) {
        this.recentCheckValue = false;
        remove(checkedNos, (n) => n === no);
      } else {
        this.recentCheckValue = true;
        checkedNos.push(no);
      }
      this.recentCheckNode = node;

      onDragMode(true);
      return { checkedNos, dragMode: true };
    });
  };

  /**
   *
   * @param node
   * @param event
   * shift 이벤트 및 노드 클릭 이벤트
   */
  handleSelectNode = (node, event) => {
    if (node.type === 'F') {
      return;
    }
    const { searchText } = this.props;
    const { dragMode, checkedNos: nos } = this.state;
    if ((!dragMode && !event.shiftKey) || searchText) {
      this.handleGoProject(node);
      return;
    }
    if ((!dragMode && event.shiftKey) || (dragMode && !event.shiftKey)) {
      return this.handleCheckNode(node, event);
    }

    //드래그 모드에서 시프트 진행

    let checkedNos = nos;
    const recentNode = this.recentCheckNode;
    const checked = this.recentCheckValue;
    const list = this.rawDatas;
    if (!recentNode) {
      return;
    }

    const idx1 = findIndex(list, (f) => f.folderNo == recentNode.folderNo);
    const idx2 = findIndex(list, (f) => f.folderNo == node.folderNo);
    const start = idx1 < idx2 ? idx1 : idx2;
    const end = idx1 < idx2 ? idx2 : idx1;

    for (let i = start; i <= end; i++) {
      const f = list[i];
      if (f.type === 'F') {
        continue;
      }
      if (checked) {
        checkedNos.push(f.folderNo);
        checkedNos = uniq(checkedNos);
      } else {
        remove(checkedNos, (n) => n === f.folderNo);
      }
    }

    this.setState({ checkedNos });
  };

  /**
   * @description 드래그 모드 해제
   */
  handleCancelDragMode = () => {
    this.setState(
      {
        checkedNos: [],
        dragMode: false,
      },
      () => {
        const { onDragMode } = this.props;
        onDragMode(false);
      },
    );
  };

  /**
   * @description 드래그 모드일때 체크리스트에 폴더의 no가 들어간것을 제거
   * checkNos에는 협업공간만의 folderNo 만 들어갈수 있음
   * 참고로... 드래그 하는순간 checknos에 folderNo가 자동추가됨...
   */
  handleRemoveFolder = () => {
    const { checkedNos } = this.state;
    if (!this.dragData) {
      return;
    }

    remove(checkedNos, (no) => no === this.dragData.folderNo);
    this.setState({ checkedNos });
  };

  /**
   * @description 프리셋 팝업 닫기
   */
  handlePresetTooltipClose = () => {
    this.setState({ presetInfoOpen: false, presetTooltipNo: 0 }, () => {
      const { setPresetProject, registerNewUser } = this.props;
      setPresetProject({ presetProjectNos: null });
      //최초 회원가입에 대한 new flag를 false로... 이메일팝업 띄울때 밖에 사용안함
      registerNewUser(false);
    });
  };

  /**************************************************************************
   *
   *                         SERVER REQUEST
   *
   *************************************************************************/

  getFolderList = () => {
    const { getFolderList } = this.props;
    bee.deferred(getFolderList);
    // .then(() => {})
    // .catch(() => {});
  };

  /**
   * @param folderNo
   * @param foldYn
   * @param force 검색중일때 열기기능을 실행하는 경우 강제
   * @description 폴더의 자식노드 노출, show, hide
   */
  handleFolderFold = (node, foldYn, force) => {
    const { searchText, putFolderFold, syncUpdateFolder } = this.props;
    if (searchText && !force) {
      return;
    }

    console.log('guscjf', foldYn);
    if (node.display === foldYn) {
      return;
    }

    const folderNo = node.folderNo;

    // foldYn === 'Y' ? node.open() : node.fold();
    // this.forceUpdate();
    // const currentYn = node.display;
    foldYn === 'Y' ? node.open() : node.fold();
    syncUpdateFolder({ folderNo, display: foldYn });

    bee
      .deferred(putFolderFold, {
        folderNo,
        foldYn,
        sessionId: SocketClient?.sessionId || undefined,
      })
      .then(() => {
        // console.log('guscjf', res);
      })
      .catch(() => {
        // foldYn === 'Y' ? node.fold() : node.open();
        // this.forceUpdate();
        syncUpdateFolder({
          folderNo,
          display: foldYn === 'Y' ? node.fold() : node.open(),
        });
      });
  };

  /**
   *
   * @param dragNode
   * @param parent
   * @param seq
   * @description 하나만 변경하는건지 멀티로 변경하는건지 확인후 api 실행
   */
  hubChangeSeq = (dragNode, parent, seq) => {
    const { dragMode, checkedNos } = this.state;

    /**
     * 폴더를 드래그 할때 선택된 협업공간중 해당 폴더의 자식 노드가  있는 경우 필터
     */
    let selectedNos = checkedNos;
    if (
      checkedNos.length > 1 &&
      dragNode.type === 'F' &&
      dragNode.children.length > 0
    ) {
      const childNos = dragNode.children.map((n) => n.folderNo);
      selectedNos = checkedNos.filter((no) => {
        return childNos.indexOf(no) === -1;
      });
    }

    if (dragMode && selectedNos.length > 1) {
      this.handleChangeSeqMulti(selectedNos, parent, seq);
    } else {
      this.handleChangeSeqSingle(dragNode.folderNo, parent, seq);
    }
  };

  /**
   *
   * @param folderNo
   * @param parent
   * @param seq
   * 하나의 폴더를 위치 변경할때
   */
  handleChangeSeqSingle = (folderNo, parent, seq) => {
    const { putFolderPositionChangeSingle } = this.props;

    bee
      .deferred(putFolderPositionChangeSingle, {
        folderNo,
        parent,
        seq,
      })
      .then((res) => {
        console.log('gusjcf', res);
        this.setState({ checkedNos: [] });
        this.recentCheckValue = false;
        this.recentCheckNode = null;
        this.setState({ checkedNos: [] });
      });
  };

  /**
   *
   * @param checkedNos
   * @param parent
   * @param seq
   * 폴
   */
  handleChangeSeqMulti = (checkedNos, parent, startSeq) => {
    const { putFolderPositionChangeMulti } = this.props;

    // 다중 선택시 정렬을 현재 트리 순서대로 정렬... 넘어오는 checkedNos는 체크하는 순대로임
    const orderNos = this.rawDatas.map((n) => n.folderNo);
    const folderNos = sortBy(checkedNos, (no) => orderNos.indexOf(no));

    bee
      .deferred(putFolderPositionChangeMulti, {
        folderNos: folderNos.join(','),
        parent,
        startSeq,
      })
      .then(() => {
        this.recentCheckValue = false;
        this.recentCheckNode = null;
        this.setState({ checkedNos: [] });
      });
  };

  handleChangeName = (folderInfo, newName) => {
    const { putFolderName, syncUpdateFolder } = this.props;

    const oldName = folderInfo.folderName;
    if (!newName || oldName === newName) {
      return;
    }

    // folderInfo.folderName = newName;
    // this.forceUpdate();

    folderInfo.setEditMode(false);
    syncUpdateFolder({ folderNo: folderInfo.folderNo, folderName: newName });

    bee
      .deferred(putFolderName, {
        folderNo: folderInfo.folderNo,
        folderName: newName,
      })
      .then((res) => {
        console.log('gusjcf', res);
      })
      .catch(() => {
        // folderInfo.folderName = oldName;
        syncUpdateFolder({
          folderNo: folderInfo.folderNo,
          folderName: oldName,
        });
        // this.forceUpdate();
        bee.toast.error('COMMON.SERVER_ERROR_MESSAGE');
      });
  };

  //폴더 삭제 검사
  /**
   *
   * @param 폴더 삭제
   */
  handleFolderDelete = (node) => {
    if (node.type === 'P') {
      return;
    }

    if (node.hasChild()) {
      return bee.toast('LNB.FOLDER_DELETE_FAIL');
    }
    const { deleteFolder } = this.props;
    bee
      .deferred(deleteFolder, { folderNo: node.folderNo })
      .then((res) => {
        console.log('gusjcf', res);
      })
      .catch(() => {
        bee.toast.error('COMMON.SERVER_ERROR_MESSAGE');
      });
  };

  /**************************************************************************
   *
   *                           RENDER
   *
   *************************************************************************/

  /**
   * 폴더가 접혀잇을때 폴더 내의 자식노드에 Updated 된 협업공간이 잇는지 확인
   */
  renderCheckUpdated = (n) => {
    const { updatedNos } = this.props;
    // const updatedNos = [30034666];
    const childProjectNos = n.children.map((n) => n.projectNo);
    let childUpdated = false;
    childProjectNos.forEach((no) => {
      if (updatedNos.indexOf(no) > -1) {
        childUpdated = true;
      }
    });

    return childUpdated ? <StyledStatus updated /> : <></>;
  };

  renderTreeNodeContent = (n) => {
    const { newNos, updatedNos, searchText } = this.props;
    const {
      checkedNos,
      dragMode,
      presetTooltipNo,
      presetInfoOpen,
    } = this.state;
    const project = n.projectInfo;
    let status = '';
    if (updatedNos.indexOf(n.projectNo) > -1) {
      status = 'updated';
    } else if (newNos.indexOf(n.projectNo) > -1) {
      status = 'new';
    }

    const searching = Boolean(searchText);
    return (
      <>
        <Beecon
          className={'drag-icon'}
          name="drag"
          color={Colors.gray500}
          size={12}
        />

        <NodeContent
          id={`nav-project-${n.projectNo}`}
          // id={`node-${n.folderNo}`}
          type={n.type}
          depth={n.parent ? 1 : 0}
          data-folder-no={n.folderNo}
          //onDoubleClick={() => {
          //더블클릭을 구현하려면... onClick에 타이머를 적용해서 직접 구현해야 함
          //  this.handleFolderEditMode(n);
          //}}
          onClick={(event) => {
            n.type === 'F'
              ? this.handleFolderFold(n, n.display === 'Y' ? 'N' : 'Y')
              : this.handleSelectNode(n, event);
          }}
        >
          {n.type === 'F' ? (
            <FolderItem title={n.folderName}>
              <div className="name">
                {/*{'('} {n.seq} {')'}*/}
                {n.folderName}
              </div>

              {!searching && (
                <IconButton
                  icon={n.display === 'Y' ? 'caretup' : 'caretdown'}
                  size={14}
                  color="gray600"
                  //onClick={() => {
                  //  this.handleFolderFold(n, n.display === 'Y' ? 'N' : 'Y');
                  //}}
                  //onDoubleClick={(e) => {
                  //  e.stopPropagation();
                  //}}
                />
              )}

              {n.children.length > 0 &&
                updatedNos.length > 0 &&
                n.display === 'N' &&
                this.renderCheckUpdated(n)}
            </FolderItem>
          ) : (
            <ProjectItem>
              <IconArea search={searching}>
                <NodeCheck
                  dragMode={dragMode}
                  className={'node-check'}
                  onClick={(event) => {
                    this.handleCheckNode(n, event);
                  }}
                >
                  <Beecon
                    name={
                      n.isChecked(checkedNos)
                        ? 'formcheckboxchecked'
                        : 'formcheckbox'
                    }
                    size={16}
                    color={
                      n.isChecked(checkedNos)
                        ? Colors.secondary400
                        : Colors.gray500
                    }
                  />
                  {/* <input type={'checkbox'} checked={n.isChecked(checkedNos)} /> */}
                </NodeCheck>
                <ProjectBase className={'node-icon'} dragMode={dragMode}>
                  <Beecon
                    className={'project-icon'}
                    name={project?.baseYn === 'Y' ? 'world' : 'flag'}
                    color={
                      project?.projectStatus === '009' ? Colors.gray500 : null
                    }
                    size={16}
                  />
                </ProjectBase>
              </IconArea>
              <div
                className={`name ${
                  project?.projectStatus === '009' ? 'completed' : ''
                }`}
                title={project?.projectName || n.folderName}
              >
                {/*{'('} {n.seq} {')'}*/}
                {project?.projectName || n.folderName}
              </div>

              {status && status === 'new' && (
                <StyledStatus new>new</StyledStatus>
              )}

              {status && status === 'updated' && <StyledStatus updated />}

              {presetTooltipNo !== n.projectNo ? null : (
                // {30034877 !== n.projectNo ? null : (
                // index !== 0 ? null : (
                <>
                  <ClickAwayListener
                    onClickAway={this.handlePresetTooltipClose}
                  >
                    <CustomTooltip
                      id={'preset-info'}
                      open={presetInfoOpen}
                      // open={true}
                      onClose={this.handlePresetTooltipClose}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      placement={'right'}
                      title={
                        <PresetTooltip
                          onClose={this.handlePresetTooltipClose}
                        />
                      }
                    >
                      <span></span>
                    </CustomTooltip>
                  </ClickAwayListener>
                </>
              )}
            </ProjectItem>
          )}
        </NodeContent>
        {n.type === 'F' && (
          <IconButton
            className={'folder-option'}
            icon={'morevertical'}
            size={16}
            color="gray700"
            onClick={(e) => {
              this.handleFolderOptionOpen(e, n);
            }}
          />
        )}
      </>
    );
  };

  renderTreeNode = (n) => {
    // const active = location.pathname.indexOf(`/project/${n.projectNo}`) > -1;

    const { activeNo, searchText } = this.props;
    const { focusNo, checkedNos } = this.state;

    const searching = Boolean(searchText);
    //if (dragNode) {
    //  console.log(
    //    'guscjf',
    //    dragNode?.folderNo,
    //    n.folderNo,
    //    dragNode?.folderNo === n.folderNo,
    //  );
    //}
    const className = `${activeNo === n.projectNo ? 'active' : ''} 
        ${n.type === 'P' ? 'project-focus-node' : ''} 
        ${n.type === 'P' && focusNo === n.projectNo ? focusClassName : ''}
        ${n.type === 'P' && n.projectNo ? `project-no-${n.projectNo}` : ''}
        `;

    return (
      <Node
        key={n.folderNo}
        depth={n.depth}
        id={`node-area-${n.folderNo}`}
        // draggable={n.type === 'P'}
        draggable={!searching}
        type={n.type}
        active={n.projectNo === activeNo}
        data-project-no={n.projectNo}
        // data-folder-no={n.folderNo}
        className={className}
        onDragStart={(e) => {
          this.handleDragStart(n, e);
        }}
        onDrag={(e) => {
          this.handleDrag(n, e);
        }}
        onDragEnd={(e) => {
          this.handleDragEnd(n, e);
        }}
        onDragEnter={(e) => {
          this.handleDragEnter(n, e);
        }}
        onDragOver={(e) => {
          this.handleDragOver(n, e);
        }}
        onDragLeave={(e) => {
          this.handleDragLeave(n, e);
        }}
        onDrop={(e) => {
          this.handleDrop(n, e);
        }}
        selected={n.type === 'P' && n.isChecked(checkedNos)}
      >
        {!n.editMode ? (
          <>{this.renderTreeNodeContent(n)}</>
        ) : (
          <EditFolderName
            folderInfo={n}
            onEdit={this.handleChangeName}
            onCancel={this.handleFolderEditCancel}
          />
        )}
      </Node>
    );
  };

  renderTreeList = (list) => {
    const { searchText } = this.props;
    const searching = Boolean(searchText);
    return (
      <NodeWrapper>
        {list.map((n) => (
          <Fragment key={n.folderNo}>
            {(() => {
              if (!n.show) {
                return <></>;
              }
              if (!n.hasChild()) {
                return this.renderTreeNode(n);
              }
              return (
                <>
                  {this.renderTreeNode(n)}
                  {((n.display === 'Y' && n.hasChild()) || searching) &&
                    this.renderTreeList(n.children)}
                </>
              );
            })()}
          </Fragment>
        ))}
      </NodeWrapper>
    );
  };

  render() {
    const { treeList, dragMode, dragNode, checkedNos } = this.state;

    return (
      <>
        <div id="se_id_project_folder_list">
          {this.renderTreeList(treeList)}
          <EndNode
            id={'end-node'}
            draggable={dragNode}
            onDragOver={this.handleEndDragOver}
            onDragLeave={this.handleEndDragLeave}
            onDrop={this.handleEndDrop}
          />

          {dragMode && (
            <DragBtnArea>
              <div className="box">
                <Button
                  type={'button'}
                  fullWidth
                  onClick={this.handleCancelDragMode}
                  color="secondary"
                  label={bee.getI18n('LABEL.COMPLETED')}
                />
              </div>
            </DragBtnArea>
          )}
          <FolderOptions
            getRef={(node) => {
              this.optionRef = node;
            }}
            onEdit={this.handleFolderEditMode}
            onDelete={this.handleFolderDelete}
          />

          {/*드래그 시 마우스 커서에 나오는 엘리민트 이미지*/}
          <DragElement
            id={'drag-element'}
            style={{
              //드래그용... 평소에 보이지 않게
              position: 'fixed',
              left: '-999px',
            }}
          >
            <div className="top-cell">
              {dragNode?.type === 'P' && dragMode && (
                <IconFormCheckBox
                  size={16}
                  checked
                  checkedColor={Colors.secondary400}
                />
              )}
              {dragNode?.type === 'P' && !dragMode && (
                <ProjectBase className={'node-icon'} dragMode={dragMode}>
                  <Beecon
                    className={'project-icon'}
                    name={
                      dragNode?.projectInfo?.baseYn === 'Y' ? 'world' : 'flag'
                    }
                    size={16}
                  />
                </ProjectBase>
              )}

              <div
                className={
                  dragNode?.type === 'F' ? 'folder-name' : 'project-name'
                }
              >
                {dragNode?.type === 'F'
                  ? dragNode?.folderName
                  : dragNode?.projectInfo?.projectName}
                {dragNode?.type === 'F' && (
                  <IconButton
                    icon={dragNode?.display === 'Y' ? 'caretup' : 'caretdown'}
                    size={14}
                    color="gray600"
                  />
                )}
              </div>
            </div>

            {checkedNos?.length > 1 && (
              <div className="bottom-cell">
                {bee.getI18n('FOLDER.SELECTION_MULTIPLE_COUNT', {
                  selectionCount: checkedNos?.length - 1,
                })}
              </div>
            )}
          </DragElement>
        </div>
      </>
    );
  }
}

const mapStateToProps = ({
  broadCast: { pushFolder },
  folder: { folderList },
  project: { rawList: projectList, presetProjectNos, completedProjectList },
  user: { userAuthInfo },
}) => ({
  folderList,
  projectList,
  completedProjectList,
  presetProjectNos,
  userAuthInfo,
  pushFolder,
});

const mapDispatchToProps = {
  // postFolderRegist,
  getFolderList,
  putFolderFold,
  putFolderName,
  putFolderPositionChangeSingle,
  putFolderPositionChangeMulti,
  deleteFolder,
  setPresetProject,
  registerNewUser,
  syncUpdateFolder,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(TreeList);

const CustomTooltip = withStyles({
  tooltip: {
    backgroundColor: 'transparent',
  },
  popper: {
    opacity: 1,
  },
})(Tooltip);

const NodeWrapper = styled.div`
  flex: 1 0 auto;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const Node = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: ${(props) => (props.type === 'F' ? '8px' : 0)};
  margin-bottom: ${(props) => (props.type === 'F' ? '4px' : 0)};
  user-select: none;
  padding: 0 0 0 4px;
  cursor: pointer;

  background-color: ${(props) =>
    props.selected ? hexToRgba(Colors.black, 0.05) : 'transparent'};

  .drag-icon {
    visibility: hidden;
    flex-shrink: 0;
    margin-right: 2px;
  }
  .folder-option {
    visibility: hidden;
    flex-shrink: 0;
    ${textTruncate}
  }

  form {
    width: 100%;
    padding: 0 16px;
  }

  &:hover {
    background-color: ${hexToRgba(Colors.black, 0.05)};
    .drag-icon {
      visibility: ${(props) => (props.draggable ? 'visible' : 'hidden')};
      //visibility: visible;
      &:hover {
        path {
          fill: ${Colors.gray700};
        }
      }
    }
    .folder-option {
      visibility: visible;
    }
  }

  &.active {
    font-weight: bold;
    background-color: ${(props) =>
      props.keyselected === 1
        ? Colors.gray200
        : hexToRgba(Colors.secondary400, 0.1)};

    .name {
      color: ${Colors.secondary400};
    }
    .project-icon {
      color: ${Colors.secondary400};
      path {
        fill: ${Colors.secondary400} !important;
      }
    }
  }
  &.focused {
    //transition: background-color 0.4s ease 0s, font-weight 0.2s ease 0s,
    //  fill 0.2s ease 0s;
    background-color: #e2e2e2;
  }
`;

const IconArea = styled.div`
  flex-shrink: 0;
  .node-check {
    display: none;
  }
  .node-icon {
    display: block;
  }
  &:hover {
    .node-check {
      display: ${(props) => (props.search ? 'none' : 'block')};
    }
    .node-icon {
      display: ${(props) => (props.search ? 'block' : 'none')};
    }
  }
`;

const ProjectBase = styled.div`
  display: ${(props) => (props.dragMode ? ' none !important' : 'block')};
`;

const NodeCheck = styled.div`
  display: ${(props) => (props.dragMode ? 'block !important' : 'none')};
`;

const NodeContent = styled.div`
  flex: 1 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: ${(props) => props.depth * 10}px;
  width: 0;
`;

const itemStyle = css`
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

const ProjectItem = styled.div`
  ${itemStyle}
  padding-right: 16px;
  .name {
    padding: 3px 0;
    margin-left: 4px;
    ${textTruncate}
    font-size: 14px;
    line-height: 1.57;
    color: ${Colors.gray900};
    &.completed {
      color: ${Colors.gray700};
    }
  }
`;

const FolderItem = styled.div`
  ${itemStyle}
  .name {
    padding: 2px 0;
    ${textTruncate}
    font-size: 13px;
    color: ${Colors.gray700};
  }
  .icon-button {
    flex-shrink: 0;
  }
`;

const DragBtnArea = styled.div`
  background-color: ${Colors.beige40};
  width: ${layoutSize.nav};
  @media ${mediaBreakpointDown.md} {
    width: ${layoutSize.tabletNav};
  }

  border-left: 1px solid ${Colors.secondary400};
  border-right: 1px solid ${Colors.secondary400};
  border-bottom: 1px solid ${Colors.secondary400};
  position: fixed;
  bottom: 0;
  left: 0;
  //z-index: 1002;
  z-index: 10;
  box-shadow: 0 -4px 8px 0 rgba(0, 0, 0, 0.1);

  .box {
    display: flex;
    align-items: center;
    height: 72px;
    padding: 0 16px;
    background-color: transparent;
    border-top: 0 solid transparent;
    border-radius: 0;
    border-left: 3px solid ${hexToRgba(Colors.secondary400, 0.2)};
    border-right: 3px solid ${hexToRgba(Colors.secondary400, 0.2)};
    border-bottom: 3px solid ${hexToRgba(Colors.secondary400, 0.2)};
  }
`;

const DragElement = styled.div`
  display: block;
  width: ${layoutSize.nav};
  @media ${mediaBreakpointDown.md} {
    width: ${layoutSize.tabletNav};
  }
  background: ${Colors.beige40};
  padding: 6px 16px 6px 20px;
  .top-cell {
    display: flex;
    flex-direction: row;
    align-items: center;

    .folder-name {
      padding: 2px 0;
      font-size: 13px;
      color: ${Colors.gray700};
      flex: 1;
      ${textTruncate}
    }
    .project-name {
      padding-left: 4px;
      flex: 1;
      font-size: 14px;
      color: ${Colors.gray900};
      ${textTruncate}
    }
  }
  .bottom-cell {
    font-size: 14px;
    line-height: 1.57;
    color: ${Colors.gray700};
    padding-left: 20px;
  }
`;

const EndNode = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  user-select: none;
  padding: 0 0 0 4px;
  height: 10px;
  //background: red;
  cursor: pointer;
`;
