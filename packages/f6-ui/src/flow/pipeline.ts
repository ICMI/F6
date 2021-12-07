import { attachCss, computeLayout, render, computeInherit } from '.';

export class Pipe {
  run(key, ...args) {
    switch (key) {
      case 'reAttach':
        attachCss.apply(null, args);
      case 'reflow':
        computeLayout.apply(null, args);
      case 'reInherit':
        computeInherit.apply(null, args);
      case 'render':
        render.apply(null, args);
    }
  }
}
