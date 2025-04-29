import React, { Component } from 'react';
import { func } from 'prop-types';
import { Popper, ClickAwayListener } from '@material-ui/core';

import { StyledContainer, StyledMenu } from '../../../design-system/popper';
import bee from '../../../utils/bee';

class FolderOptions extends Component {
  static propTypes = {
    getRef: func,
    onEdit: func.isRequired,
    onDelete: func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };

    props.getRef(this);

    this.folderInfo = null;
  }

  componentDidCatch(error, errorInfo) {
    bee.putLogging(error, errorInfo);
  }

  /**
   * @description 담장자 관리를 위한 popup창 열기
   */
  handleOpen = (element, folder) => {
    element?.setAttribute('style', 'visibility:visible');
    this.setState({
      anchorEl: element,
    });

    this.folderInfo = folder;
  };

  /**
   * @description 담장자 관리를 위한 popup창 닫기
   */
  handleClose = () => {
    const { anchorEl: element } = this.state;
    element?.setAttribute('style', 'visibility:inherit');
    this.setState({
      anchorEl: null,
    });

    this.folderInfo = null;
  };

  handleEdit = () => {
    const { onEdit } = this.props;
    onEdit(this.folderInfo);
    this.handleClose();
  };

  handleDelete = () => {
    const { onDelete } = this.props;
    onDelete(this.folderInfo);
    this.handleClose();
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    return (
      <Popper
        id="se_id_folder_options"
        open={open}
        anchorEl={anchorEl}
        onClose={this.handleClose}
        disablePortal={false}
        placement={'bottom-start'}
      >
        <ClickAwayListener onClickAway={this.handleClose}>
          <StyledContainer minWidth={160}>
            <StyledMenu type="button" onClick={this.handleEdit}>
              {bee.getI18n('LABEL.FOLDER_RENAME')}
            </StyledMenu>
            <StyledMenu type="button" onClick={this.handleDelete}>
              {bee.getI18n('LABEL.FOLDER_DELETE')}
            </StyledMenu>
          </StyledContainer>
        </ClickAwayListener>
      </Popper>
    );
  }
}

export default FolderOptions;
