import React, { Component, createRef } from 'react';
import { object, func } from 'prop-types';

import { StyledInput } from '../../design-system/form';
import bee from '../../utils/bee';
import utils from '../../utils/utils';

class EditFolderName extends Component {
  static defaultProps = {};

  static propTypes = {
    //root
    //action
    //reduce
    //props
    folderInfo: object.isRequired,
    onEdit: func.isRequired,
    onCancel: func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {};

    //단일
    this.folderNameRef = createRef();
  }

  componentDidMount() {
    this.setName();
  }

  setName = () => {
    this.folderNameRef?.current?.select();
  };
  /**************************************************************************
   *
   *                       EVENT / ACTION
   *
   *************************************************************************/

  handleEditName = () => {
    // e.stopPropagation();
    // e.preventDefault();
    const { folderInfo, onEdit, onCancel } = this.props;
    let name = this.folderNameRef?.current?.value;
    name = name.trim();

    if (!name || folderInfo.folderName === name) {
      return onCancel(folderInfo);
    }

    onEdit(folderInfo, name);
  };

  handleKeys = (e) => {
    const { onCancel, folderInfo } = this.props;
    const { Enter, Escape } = utils.keyCode;

    switch (e.keyCode) {
      case Enter:
        this.handleEditName();
        break;
      case Escape:
        onCancel(folderInfo);
        break;
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
    const { folderInfo } = this.props;
    return (
      // <form onSubmit={this.handleEditName}>
      <StyledInput
        type="text"
        ref={this.folderNameRef}
        placeholder={bee.getI18n('CREATE_FOLDER.PLACEHOLDER')}
        maxLength={20}
        defaultValue={folderInfo.folderName}
        onKeyDown={this.handleKeys}
        onBlur={this.handleEditName}
      />
      // </form>
    );
  }
}

export default EditFolderName;
