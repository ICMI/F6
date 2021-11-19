import { computeCSS } from '../compiler/style';

export function attachStyle(node, ruleHashs) {
  // 遍历doms
  const stack = [[node, []]];
  while (stack.length) {
    const [node, path, parent] = stack.pop();
    node.style = computeCSS(node, path, parent?.style, ruleHashs);
    // dom 查找样式并合并
    for (let child of node.children) {
      stack.push([child, [...path, node], node]);
    }
  }
}
