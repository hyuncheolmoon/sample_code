import React, { useCallback, useEffect, useRef } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import styled from "@emotion/styled";

import { confirmState, E_CONFIRM_TYPE } from "../../recoil/atom";

import { Dialog, Button, IconButton } from "@mui/material";
import { Close as IconClose } from "@mui/icons-material";

import palette from "../../constants/palette";

//type TConfirmProps = {
//  title?: string;
//  content?: React.ReactElement | string;
//};
const Confirm = () => {
  const [{ open, type, call, title, content, options }] =
    useRecoilState(confirmState);
  const reset = useResetRecoilState(confirmState);
  const confirmRef = useRef<HTMLButtonElement>(null);
  /********************************************************************************************
   * EXPORT REF
   *******************************************************************************************/

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        confirmRef?.current?.focus();
      });
    }
  }, [confirmRef, open]);

  const handleClose = useCallback(() => {
    reset();
  }, [reset]);

  const handleConfirm = useCallback(() => {
    call(true);
    handleClose();
  }, [call, handleClose]);

  const handleCancel = useCallback(() => {
    call(false);
    handleClose();
  }, [call, handleClose]);

  if (!open) {
    // dialog의 open close의 경우 렌더시 깜박인 현상이 있어 null로 처리
    return null;
  }

  return (
    <DialogLayout open={true} onClose={handleCancel}>
      <Header>
        <CloseBtn onClick={handleCancel}>
          <IconClose />
        </CloseBtn>
      </Header>
      <Content>
        <Title>{title}</Title>
        {content && <InfoContent>{content}</InfoContent>}
      </Content>
      <Footer>
        <ActionBtn
          variant={"contained"}
          onClick={handleConfirm}
          color="primary"
          ref={confirmRef}
        >
          {options?.confirmText || "확인"}
        </ActionBtn>
        {type === E_CONFIRM_TYPE.CONFIRM && (
          <ActionBtn
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
          >
            취소
          </ActionBtn>
        )}
      </Footer>
    </DialogLayout>
  );
};

export default Confirm;

const DialogLayout = styled(Dialog)`
  //z-index: 1033 !important;
`;
const Header = styled.div`
  position: relative;
  min-height: 50px;
  //background-color: yellow;
`;

const Content = styled.div`
  min-width: 420px;
  max-width: 500px;
  min-height: 50px;
  padding-top: 4px;
  color: ${palette.gray900};
`;
const Title = styled.div`
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  line-height: 1.75;
  padding: 0 35px;
  margin-bottom: 12px;
  white-space: pre-wrap;
`;
const InfoContent = styled.div`
  font-size: 16px;
  padding: 12px 19px;
  margin: 0 30px 12px 30px;
  background-color: #00a76f40;
  color: #00a56d;
  border-radius: 8px;
  font-weight: 600;
  text-align: left;
  line-height: 1.7;
  white-space: pre-wrap;
`;

const Footer = styled.div`
  width: 100%;
  text-align: center;
  height: 64px;
  padding: 4px 20px;
`;
const ActionBtn = styled(Button)`
  min-width: initial;
  height: 38px;
  font-size: 16px;
  margin: 0 8px;
`;
const CloseBtn = styled(IconButton)`
  color: ${palette.gray500};
  position: absolute;
  top: 4px;
  right: 8px;
`;
