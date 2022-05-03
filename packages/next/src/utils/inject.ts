import { getGlobalContext } from '../service';
export const injectGlobalContext = (target, propertyKey) => {
  return Object.defineProperty(target, propertyKey, {
    get() {
      return getGlobalContext();
    },
  });
};
