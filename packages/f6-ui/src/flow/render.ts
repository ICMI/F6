import { traverseTree } from '../utils';

export function render(node) {
  traverseTree(node, ({ node }) => {
    node.draw();
  });
}
