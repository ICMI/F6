import computeLayoutFn from 'css-layout';

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

  node.clearLayout();

  computeLayoutFn(this.layoutNode);
}
