import React, { useCallback, useRef, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import { FilledInput, InputAdornment } from "@mui/material";
import { Done, Clear } from "@mui/icons-material";

import palette from "../../../constants/palette";
import utils from "../../../utils/utils";

type TEditTextProps = {
  id?: string;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  onCancel?: () => void;
  onSubmit?: (value: string) => void;
  checkValid?: (value: string) => boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
  // onFocus?: () => void;
};

const EditText = ({
  disabled = false,
  readonly = false,
  onSubmit = () => {},
  onCancel = () => {},
  placeholder = "",
  // onFocus = () => {},
  onChange = () => {},
  checkValid = () => true,
  defaultValue = "",
}: TEditTextProps) => {
  const [value, setValue] = useState<string>(defaultValue);

  const editRef = useRef<HTMLInputElement>();
  const isEditing = useMemo(
    () => value !== defaultValue,
    [value, defaultValue],
  );
  const isValid = useMemo(
    () => !!value && checkValid(value),
    [value, checkValid],
  );
  /********************************************************************************************
   * ACTION / EVENT
   *******************************************************************************************/

  const handleCancelEditMode = useCallback(
    // (event?: React.MouseEvent<HTMLButtonElement>) => {
    () => {
      onChange(defaultValue);
      setValue(defaultValue);
      onCancel();
    },
    [defaultValue, onCancel, onChange],
  );
  const handleKeyEvent = useCallback(
    (event: React.KeyboardEvent) => {
      if (utils.keyCode.Escape !== event.keyCode) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      handleCancelEditMode();
    },
    [handleCancelEditMode],
  );

  const handleChangeText = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event?.target) {
        return;
      }
      const changedText = event?.target?.value as string;
      onChange(changedText);
      setValue(changedText);
    },
    [setValue, onChange],
  );

  const handleEditSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
      event.preventDefault();
      if (!isEditing || !isValid) {
        return;
      }
      onSubmit(value);
    },
    [onSubmit, value, isEditing, isValid],
  );
  /********************************************************************************************
   * RENDER
   *******************************************************************************************/
  return (
    <EditForm onSubmit={handleEditSubmit}>
      <EditUnitCostBox
        // autoFocus={true}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        //inputProps={{
        //  min: 0,
        //  step: 10,
        //  // onFocus: onFocus,
        //}}
        onKeyDown={handleKeyEvent}
        readOnly={readonly}
        permission={`${!readonly}`}
        validation={`${isValid}`}
        onChange={handleChangeText}
        value={value}
        inputRef={editRef}
        endAdornment={
          isEditing ? (
            <InputAdornment position="end">
              <NoneStyleButton
                type={"submit"}
                disabled={!isValid}
                onClick={handleEditSubmit}
              >
                <Done color={"primary"} />
              </NoneStyleButton>
              <NoneStyleButton type={"button"} onClick={handleCancelEditMode}>
                <Clear color={"error"} />
              </NoneStyleButton>
            </InputAdornment>
          ) : null
        }
      />
    </EditForm>
  );
};

const EditForm = styled.form`
  //display: flex;
  //flex-direction: row;

  .MuiInputBase-root {
    width: 100%;
    background-color: inherit;

    &.MuiFilledInput-adornedEnd {
      padding-right: 0;
    }

    &.Mui-disabled {
      background-color: rgba(0, 0, 0, 0.08);

      .MuiFilledInput-input {
        cursor: not-allowed;
      }
    }

    .MuiFilledInput-input {
      font-size: 14px;
      padding: 6px 0 6px 5px;
    }
  }
`;

const EditUnitCostBox = styled(FilledInput)<{
  permission: string;
  validation: string;
}>`
  ${({ permission }) =>
    permission === "false" &&
    css`
      input {
        cursor: default;
      }

      :before {
        border-bottom: 0 !important;
      }

      :after {
        border-bottom: 0;
      }
    `}
  ${({ validation }) =>
    validation === "false" &&
    css`
      :before {
        border-color: ${palette.red200};
      }

      :after {
        border-color: ${palette.red200};
      }
    `}
}`;

const NoneStyleButton = styled.button`
  cursor: pointer;
  width: auto;
  padding: 0 4px;
  border: 0;
  background: 0;

  :disabled {
    cursor: not-allowed;

    svg {
      fill: ${palette.gray600};
    }
  }
`;
export default EditText;
