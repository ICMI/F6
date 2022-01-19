import { traverseTree } from '../utils';

export function render(node) {
  traverseTree(node, ({ node }) => {
    const { display } = node.computedStyle;
    if (display === 'none') {
      node.renderNode?.hide();
      return false;
    } else {
      node.renderNode?.show();
      node.draw();
    }
  });
}
