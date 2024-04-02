import {toast as reactToast, ToastOptions, TypeOptions, ToastPosition} from 'react-toastify';
// import { AxiosResponse } from 'axios';

const toast = (() => {
    //  'info' | 'success' | 'warning' | 'error' | 'default';
    const toast = (text: string, variant: TypeOptions = 'default') => {
        const options: ToastOptions = {
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
            position: 'top-right' as ToastPosition,
        };

        const toastText = text?.replace?.(/<br\s*\/>/g, '\n') || text;

        const toastId = toastText;

        switch (variant) {
            case 'info':
                reactToast.info(toastText, {
                    toastId,
                    updateId: toastId,
                    ...options,
                });
                break;
            case 'success':
                reactToast.success(toastText, {autoClose: false, ...options});
                break;
            case 'warning':
                reactToast.warn(toastText, {updateId: toastId, ...options});
                break;
            case 'error':
                reactToast.error(toastText, {...options});
                break;
            case 'default':
            default:
                reactToast(toastText, {toastId, updateId: toastId, ...options});
                break;
        }
    };
    toast.success = (text: string) => {
        toast(text, 'success');
    };

    toast.info = (text: string) => {
        toast(text, 'info');
    };

    toast.warn = (text: string) => {
        toast(text, 'warning');
    };

    toast.error = (text: string) => {
        toast(text, 'error');
    };

    toast.default = toast.info;

    return toast;
})();

export default toast;
