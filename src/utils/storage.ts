class storage {
    static set = (key: string, _value: any) => {
        if (!key) {
            return false;
        }
        let value = _value;
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
        return true;
    };
    static get = (key: string) => {
        if (!key) {
            return false;
        }
        let _value = localStorage.getItem(key);
        if (!_value) {
            return undefined;
        }

        let value;
        try {
            value = JSON.parse(_value);
        } catch (e) {
            value = _value;
        }
        return value;
    };
    static del = (key: string) => {
        if (!localStorage.getItem(key)) {
            return undefined;
        }
        localStorage.removeItem(key);
        return true;
    };
}

export default storage;
