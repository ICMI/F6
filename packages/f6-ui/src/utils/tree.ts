export function traverseTree(tree, fn, from: Record<'parent' | 'path' | string, any> = {}) {
  const { path = [], parent = null } = from;
  const stack = [[tree, path, parent]];
  while (stack.length) {
    const [node, path, parent] = stack.shift();
    const isContinue = fn({ node, path, parent });
    if (typeof isContinue === 'boolean' && !isContinue) {
      continue;
    }
    for (let child of node.children) {
      stack.push([child, [...path, node], node]);
    }
  }
}
