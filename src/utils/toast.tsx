import {toast as reactToast, ToastOptions, TypeOptions, ToastPosition} from 'react-toastify';

const toast = (() => {
    //  'info' | 'success' | 'warning' | 'error' | 'default';
    const _toast = (text: string, variant: TypeOptions = 'default') => {
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
    _toast.success = (text: string) => {
        _toast(text, 'success');
    };

    _toast.info = (text: string) => {
        _toast(text, 'info');
    };

    _toast.warn = (text: string) => {
        _toast(text, 'warning');
    };

    _toast.error = (text: string) => {
        _toast(text, 'error');
    };

    _toast.default = _toast.info;

    return _toast;
})();

export default toast;
