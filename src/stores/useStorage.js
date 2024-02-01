export const useStorage = (namespace = '', type = 'localStorage') => {
  /**
   * @type {Storage}
   */
  const storage = window[type];
  let storageAdapter = {
    get config() {
      return {
        namespace,
        type,
      };
    },
    get state() {
      return namespace ? JSON.parse(storage.getItem(namespace)) || {} : storage;
    },
    clear() {
      return namespace ? storage.removeItem(namespace) : storage.clear();
    },
    getItem(key = '') {
      if (arguments.length < 1) {
        throw new Error(
          `Failed to execute 'setItem' on 'Storage': 1 arguments required, but only ${arguments.length} present.`
        );
      }
      return (namespace ? this.state[key] : this.state.getItem(key)) || null;
    },
    key(index) {
      if (arguments.length < 1) {
        throw new Error(
          `Failed to execute 'setItem' on 'Storage': 1 arguments required, but only ${arguments.length} present.`
        );
      }
      if (!(typeof index === 'number' && /\d+/.test(index))) {
        console.warn('"index" must be a positive integer');
        return null;
      }
      let key;
      if (namespace) {
        let kv = Object.entries(this.state)[index];
        key = kv ? kv[0] : null;
      } else {
        key = storage.key(index);
      }
      return key || null;
    },
    get length() {
      return (namespace ? Object.keys(this.state).length : storage.length) || 0;
    },
    removeItem(key) {
      if (arguments.length < 1) {
        throw new Error(
          `Failed to execute 'setItem' on 'Storage': 1 arguments required, but only ${arguments.length} present.`
        );
      }
      if (namespace) {
        let data = JSON.parse(JSON.stringify(this.state));
        delete data[key];
        storage.setItem(namespace, JSON.stringify(data));
      } else {
        storage.removeItem(key);
      }
    },
    setItem(key, value) {
      if (arguments.length < 2) {
        throw new Error(
          `Failed to execute 'setItem' on 'Storage': 2 arguments required, but only ${arguments.length} present.`
        );
      }
      if (namespace) {
        let data = JSON.parse(JSON.stringify(this.state));
        data[key] = value;
        storage.setItem(namespace, JSON.stringify(data));
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    },
  };
  return storageAdapter;
};
