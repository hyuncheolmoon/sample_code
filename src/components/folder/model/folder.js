import { find } from 'lodash';

class Folder {
  constructor(folder) {
    this.folderNo = folder.folderNo || 0;
    this.seq = folder.seq || 0;
    this.folderName = folder.folderName || '';
    this.type = folder.type || 'P'; //채널 타입(P:프로젝트, F:폴더
    this.parent = folder.parent || 0;
    this.projectNo = folder.projectNo || 0;
    this.display = folder.display || 'Y';

    /**
     * custom data
     */
    this.prevNode = null;
    this.nextNode = null;

    this.editMode = false;
    // this.draggable = true;
    this.children = [];
    // this.checked = false; // 드래그 다중선택
    // this.focused = false; // keyboard 이벤트 포커스
    this.show = true; // 현재 노드를 보여주냐 마냐...

    this.projectInfo = null;
    this.parentInfo = null;

    //home 화면에서만 사용.. 폴더가 없는 협업공간들을 묶기위한 더미 폴더
    this.dummy = false;
  }

  import = (data) => {
    for (const key in data) {
      this[key] = data[key];
    }
  };

  setProject = (project) => {
    this.projectInfo = project;
  };

  setParent = (parent) => {
    this.parentInfo = parent;
  };

  setPrev = (prev) => {
    this.prevNode = prev;
  };

  setNext = (next) => {
    this.nextNode = next;
  };

  /**
   * 이름 변경모드
   * @param flag
   */
  setEditMode = (flag) => {
    this.editMode = flag;
  };

  /**
   * folder 열고
   */
  open = () => {
    this.display = 'Y';
    return this.display;
  };

  /**
   * folder 닫고
   */
  fold = () => {
    this.display = 'N';
    return this.display;
  };

  /**
   * 자식 노드가 있는지 확인
   * @return {boolean}
   */
  hasChild = () => {
    return this.children.length > 0;
  };

  /**
   * 검색시에 노드를 보여주냐 마냐 판단...
   * @return {T}
   */
  showChild = () => {
    const hasChild = find(this.children, ['show', true]);
    return Boolean(hasChild);
  };

  /**
   * 현재 체크상태 확인
   * @param checkNos
   */
  isChecked = (checkNos) => {
    return checkNos.indexOf(this.folderNo) > -1;
  };

  setDummy = () => {
    this.dummy = true;
  };
}

export default Folder;
