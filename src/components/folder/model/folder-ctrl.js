/**
 * 안씀 안씀.. .아직 reduce에 넣을 생가가 없음.... Nav에만 쓸것임
 */
import store from '../redux/store/store';
import { Folder } from './folder';
import {
  syncSetChannelList,
  syncSetChannel,
  syncAddChannel,
  syncRemoveChannel,
} from '../redux/actions';

const FolderCtrl = () => {
  let obj = {};
  let projectGroup = {};

  const create = (data) => {
    const folder = new Folder(data);
    if (!folder.folderNo) {
      console.log('guscjf folder No 정보 없음');
      return folder;
    }
    if (folder.projectNo) {
      projectGroup[folder.projectNo] = folder;
    }
    obj[folder.folderNo] = folder;
    return folder;
  };

  const get = (folderNo) => {
    return obj[folderNo];
  };

  const getByProject = (projectNo) => {
    return projectGroup[projectNo];
  };

  /**
   * @param data channelInfo
   * 채널 정보 덮어쓰기
   */
  const set = (data) => {
    if (data instanceof Folder === false) {
      console.log('guscjf folder class 아님', data);
      return null;
    }
    // store.dispatch(syncSetChannel({ channel: data }));
    return data;
  };

  /**
   * @param data channelInfo
   * 채널 추가
   */
  const add = (data) => {
    const oldFolder = get(data.folderNo);
    if (oldFolder) {
      set(data);
      return;
    }
    const folder = create(data);
    store.dispatch(syncAddChannel({ folder }));
    return channel;
  };

  const del = (channelNo) => {
    const c = get(channelNo);
    delete obj[channelNo];
    if (c.projectNo) {
      delete projectGroup[c.projectNo];
    }

    store.dispatch(syncRemoveChannel({ channelNo: c.channelNo }));
  };

  /**
   * @param list channelInfo[]
   * 채널 리스트 넣기
   */
  const setList = (list, user) => {
    obj = {};

    let dummy = {};
    user.forEach((u) => {
      dummy[u.channelNo] = u;
    });

    const channelList = list
      .filter((l) => l.status === ChannelStatus.enabled)
      .map((c) => {
        const u = dummy[c.channelNo];
        //userChannelList로 넘어오는 데이터 import시키기
        if (u) {
          c.readMessageNo = u.readMessageNo;
          c.mentionCount = u.mentionCount;
          c.unreadCount = u.unreadCount;
          c.alarm = u.alarm;
          c.alarmStatus = u.alarmStatus;
          c.bookMark = u.bookMark;
        }
        return create(c);
      });

    for (let no in dummy) {
      delete dummy[no];
    }
    store.dispatch(syncSetChannelList({ channelList }));
  };

  const getObjs = () => {
    return obj;
  };

  //const setList = (list) => {
  //  obj = {};
  //  const channelList = list.map((l) => {
  //    return create(l);
  //  });
  //  store.dispatch(syncSetChannelList({ channelList }));
  //};

  /**
   *
   * @param { Array } userNos
   * 현재 채널 리스트에서 유저 구성이 같은 채널 찾기
   */
  const userCheck = (userNos) => {
    const channels = store.getState().messenger.channelList;
    if (!channels) {
      return false;
    }
    for (let i = 0; i < channels.length; i++) {
      const c = channels[i];
      if (c.userCheck(userNos)) {
        return c;
      }
    }
    return false;
  };

  return {
    set: set,
    get: get,
    add: add,
    del: del,
    setList: setList,
    getByProject: getByProject,
    getObjs: getObjs,
  };
};

const f = FolderCtrl();
window.folder_ctrl = f;
export default f;
