import { computeCSS, isInherit } from '../compiler';
import { traverseTree } from '../utils';

export function computeInherit(node) {
  traverseTree(node, ({ node, parent }) => {
    const nodeStyle = node.style;
    const parentStyle = parent?.style;
    if (parentStyle) {
      for (let [key, value] of Object.entries(parentStyle)) {
        if ((isInherit(key) && !nodeStyle[key]) || nodeStyle[key] === 'inherit') {
          nodeStyle[key] = value;
        }
      }
    }
  });
}

export function attachCss(node, ruleHashs) {
  // 遍历doms
  traverseTree(node, ({ node, path, parent }) => {
    node.style = computeCSS(node, path, parent?.style, ruleHashs);
  });
}
