export function traverseTree(tree, fn) {
  const stack = [tree];
  while (stack.length) {
    const node = stack.pop();
    fn(node);
    stack.push(...(node.children || []));
  }
}
