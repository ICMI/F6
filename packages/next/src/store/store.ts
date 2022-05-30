import { createDraft, finishDraft } from 'immer';

export const injectTrigger =
  (needDispatch = true, action?) =>
  (target, propertyKey, descriptor) => {
    const func = descriptor.value;
    return {
      get() {
        return (...args) => {
          const draft = createDraft(this.state);
          func.apply(this, [...args, draft]);
          this.state = finishDraft(draft);
          needDispatch && store.trigger();
        };
      },
    };
  };

class Store {
  events = [];

  state = {};

  // 如果想做成树也可以，目前store只有一层
  @injectTrigger()
  init(action, state?) {
    Object.assign(state, action);
  }

  getState() {
    return this.state;
  }

  subscribe = (fn) => {
    this.events.push(fn);
  };

  trigger = async () => {
    for (const event of this.events) {
      event();
    }
  };
}

export const store = new Store();

export const computed = (dependencyFn?) => (target, key, descriptor) => {
  let result = null;
  let cacheArgs = null;
  const func = descriptor.value;
  return {
    get() {
      return (...args) => {
        let prepareCacheArgs = [...args, ...(dependencyFn?.(this, ...args) || [])];
        const isSame =
          cacheArgs &&
          prepareCacheArgs.every((a, index) => {
            const b = cacheArgs[index];
            if (typeof a !== typeof b) return false;
            if (typeof a === 'function') {
              return a() === b();
            }
            return a === b;
          });
        if (isSame) return result;
        cacheArgs = prepareCacheArgs;
        result = func.call(this, ...cacheArgs);
        return result;
      };
    },
  };
};
