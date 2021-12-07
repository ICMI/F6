import { registerNode, Node, Document } from './node';

function createUI(htmlString, cssString, group) {
  const tree = new Document(htmlString, cssString, group);
  return tree;
}

// function createSegmentNode(htmlString, cssString, group?) {
//   const tree = create(htmlString, cssString, false);
//   if (group) tree.manualMount(group);
//   return tree;
// }

// function create(htmlString, cssString, isNeedRoot = false) {
//   const dom = htmlParse(htmlString, isNeedRoot);
//   const cssTree = cssParse(cssString);
//   const styleTree = styleParse(dom, cssTree);
//   const tree = createUINode(styleTree.dom.tagName, styleTree);
//   // 创建ui节点
//   const stack = [[styleTree, tree]];
//   while (stack.length) {
//     const [node, parent] = stack.pop();
//     for (let child of node.originChildren) {
//       const uiNode = createUINode(child.dom.tagName, child);

//       parent.children.push(uiNode);
//       uiNode.setParent(parent);

//       stack.push([child, uiNode]);
//     }
//   }
//   return tree;
// }
export { registerNode, Node, createUI };
export default { registerNode, Node, createUI };
