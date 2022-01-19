export function traverseTree(tree, fn) {
  const stack = [[tree, [], null]];
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
