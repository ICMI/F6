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

function getLayoutRoot(node) {
  let layoutRoot = node;
  if (layoutRoot) {
    // 上浮到absolute或根节点
    while (layoutRoot && layoutRoot?.style?.position !== 'absolute') {
      layoutRoot = layoutRoot.parent;
    }
  }
  return layoutRoot ? layoutRoot : node.ownerDocument.root;
}

export function computeLayout(node) {
  const layoutRoot = getLayoutRoot(node);

  genLayoutTree(layoutRoot);

  clearLayout(layoutRoot);

  computeLayoutFn(layoutRoot.layoutNode);

  return layoutRoot;
}
