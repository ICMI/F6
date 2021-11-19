import { computeLayout, render } from '.';

export class Pipe {
  run(key, ...args) {
    switch (key) {
      case 'reflow':
        computeLayout.apply(null, args);
        render.apply(null, args);
      case 'render':
        render.call(null, args);
    }
  }
}
