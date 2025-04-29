import React, { Component, createRef } from 'react';

import { func } from 'prop-types';
import styled from '@emotion/styled';

// import bee from '../../../utils/bee';
import utils from '../../../utils/utils';
// import { Beecon } from '../../Icon';
// import Colors from '../../../constants/Colors';
// import { StyledInput } from '../../../design-system/form';
class CreateFolder extends Component {
  static defaultProps = {};

  static propTypes = {
    //root
    //action
    //reduce
    //props
    onAdd: func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      // 폴더 생성 모드 활성화 여부
      createFolderMode: false,
    };

    //단일
    this.folderNameRef = createRef();
  }

  /**************************************************************************
   *
   *                       EVENT / ACTION
   *
   *************************************************************************/

  // 폴더 생성 모드 활성화 및 입력 필드 포커스
  showCreateFolderMode = () => {
    this.setState({ createFolderMode: true }, () => {
      this.folderNameRef.current?.focus();
    });
  };

  // 폴더 생성 모드 비활성화
  hideCreateFolderMode = () => {
    this.setState({ createFolderMode: false });
  };

  // 폴더 생성 처리
  handleCreateFolder = () => {
    const name = this.folderNameRef?.current?.value;
    if (!name) {
      return this.hideCreateFolderMode();
    }

    const { onAdd } = this.props;
    onAdd(name, 0, 1); // 폴더 이름, 부모 ID, 깊이 전달
    this.hideCreateFolderMode();
  };

  // 키보드 이벤트 처리 (Enter: 폴더 생성, Escape: 취소)
  handleKeys = (e) => {
    const { Enter, Escape } = utils.keyCode;

    switch (e.keyCode) {
      case Enter:
        this.handleCreateFolder();
        break;
      case Escape: {
        const input = this.folderNameRef?.current;
        input.value = '';
        this.hideCreateFolderMode();
        break;
      }
      default:
        break;
    }
  };

  /**************************************************************************
   *
   *                          RENDER
   *
   *************************************************************************/
  render() {
    const { createFolderMode } = this.state;

    return (
      <Wrapper>
        {/* 폴더 생성 버튼 */}
        <Button type={'button'} onClick={this.showCreateFolderMode}>
          <span className="contents">
            <Beecon name="timescircle" size={16} />
            {bee.getI18n('LABEL.CREATE_FOLDER')}
          </span>
        </Button>

        {/* 폴더 생성 모드일 때 표시되는 입력 필드 */}
        {createFolderMode && (
          <StyledInput
            type="text"
            ref={this.folderNameRef}
            placeholder={bee.getI18n('CREATE_FOLDER.PLACEHOLDER')}
            maxLength={20}
            onKeyDown={this.handleKeys}
            onBlur={this.handleCreateFolder}
          />
        )}
      </Wrapper>
    );
  }
}

export default CreateFolder;

// 스타일 컴포넌트 정의
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;
`;

// 폴더 생성 버튼 스타일
const Button = styled.button`
  position: relative;
  cursor: pointer;
  background-color: transparent;
  &:before {
    position: absolute;
    right: 0;
    left: 0;
    height: 1px;
    background-color: ${Colors.gray200};
    content: ' ';
    top: 50%;
  }

  .basic,
  .contents {
    position: relative;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    background-color: ${Colors.beige40};
    font-size: 12px;
    color: ${Colors.gray700};
    padding: 5px 4px;
    .beecon {
      margin-right: 4px;
      path {
        fill: ${Colors.gray500};
      }
    }
  }

  &:hover {
    .basic,
    .contents {
      color: ${Colors.gray900};
      .beecon {
        path {
          fill: ${Colors.gray700};
        }
      }
    }
  }
`;
