import { createDraft, finishDraft } from 'immer';

export const injectTrigger = (target, propertyKey, descriptor) => {
  const func = descriptor.value;
  return {
    get() {
      return (action?) => {
        const draft = createDraft(this.state);
        func.call(this, action, draft);
        this.state = finishDraft(draft);
        store.trigger();
      };
    },
  };
};

class Store {
  events = [];

  state = {};

  // 如果想做成树也可以，目前store只有一层
  @injectTrigger
  init(action, state?) {
    Object.assign(state, action);
  }

  getState() {
    return this.state;
  }

  subscribe = (fn) => {
    this.events.push(fn);
  };

  trigger = () => {
    this.events.forEach((fn) => {
      fn();
    });
  };
}

export const store = new Store();

export const computed = (dependencyFn) => (target, key, descriptor) => {
  let result = null;
  let cacheArgs = null;
  const func = descriptor.value;
  return {
    get() {
      return (...args) => {
        let preCacheArgs = [...args, ...(dependencyFn?.(this) || [])];
        const isSame =
          cacheArgs &&
          preCacheArgs.every((a, index) => {
            const b = cacheArgs[index];
            if (typeof a !== typeof b) return false;
            if (typeof a === 'function') {
              return a() === b();
            }
            return a === b;
          });
        if (isSame) return result;
        cacheArgs = preCacheArgs;
        result = func.call(this, ...cacheArgs);
        return result;
      };
    },
  };
};
