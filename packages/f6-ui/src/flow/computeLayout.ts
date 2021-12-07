import computeLayoutFn from 'css-layout';
import { traverseTree } from '../utils';

function clearLayout(node) {
  traverseTree(node, ({ node }) => {
    if (!node.layoutNode) return;
    node.layoutNode.isDirty = true;
  });
}

function genLayoutTree(node) {
  const stack = [[node, node.parent.layoutNode || null]];
  while (stack.length) {
    const [node, parent] = stack.shift();
    const layoutNode = {
      style: {},
      children: [],
    };
    if (node.style.display === 'none' || node.tagName === 'style') {
      continue;
    } else {
      layoutNode.style = { ...node.style };
      parent?.children?.push(layoutNode);
      node.layoutNode = layoutNode;
    }

    for (let child of Object.values(node.children)) {
      stack.push([child, layoutNode]);
    }
  }
}

export function computeLayout(node) {
  genLayoutTree(node);

  clearLayout(node);

  computeLayoutFn(node.layoutNode);
}
