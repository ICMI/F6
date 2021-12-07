export function traverseTree(tree, fn) {
  const stack = [[tree, [], null]];
  while (stack.length) {
    const [node, path, parent] = stack.shift();
    fn({ node, path, parent });
    for (let child of node.children) {
      stack.push([child, [...path, node], node]);
    }
  }
}
