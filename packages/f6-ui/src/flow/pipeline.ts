import { attachCss, computeLayout, render, computeInherit } from '.';

export class Pipe {
  run(key, node, rules) {
    let resultNode = node;
    switch (key) {
      case 'reAttach':
        attachCss.call(null, resultNode, rules);
      case 'reflow':
        resultNode = computeLayout.call(null, resultNode);
      case 'reInherit':
        computeInherit.call(null, resultNode);
      case 'render':
        render.call(null, resultNode);
    }
  }
}
