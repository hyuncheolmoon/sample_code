import { atom } from 'recoil';

export enum E_CONFIRM_TYPE {
  CONFIRM = 'CONFIRM',
  NOTICE = 'NOTICE',
}

export type T_CONFIRM_OPTIONS = {
  confirmText?: string;
  cancelText?: string;
};

type T_CONFIRM_DATA = {
  open: boolean;
  title: string;
  type?: E_CONFIRM_TYPE;
  content?: string;
  call: null | any;
  options?: null | T_CONFIRM_OPTIONS;
};

export const confirmState = atom({
  key: 'confirmState', // unique ID (with respect to other atoms/selectors)
  default: {
    open: false,
    type: E_CONFIRM_TYPE.CONFIRM,
    title: '',
    content: '',
    call: null,
    options: null,
  } as T_CONFIRM_DATA,
});
