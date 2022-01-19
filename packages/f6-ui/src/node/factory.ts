import { RenderNodeContainer, RenderNodeImage, RenderNodeShape, RenderNodeText } from '../render';
import Node from './node';

const Node_Map = {};

function createContainer() {
  const node = new Node();
  node.addRenderNode(new RenderNodeContainer());
  return node;
}

function createImage() {
  const node = new Node();
  node.addRenderNode(new RenderNodeImage());
  return node;
}

function createText() {
  const node = new Node();
  node.addRenderNode(new RenderNodeText());
  return node;
}

function createShape() {
  const node = new Node();
  node.addRenderNode(new RenderNodeShape());
  return node;
}

function createStyle() {
  let rules = null;
  const node = new Node();
  node.isNeedRenderAll = true;
  node.onAppend = () => {
    const textNode = node.query('text');
    const cssString = textNode.dom.innerText;
    rules = node.ownerDocument.addRules(cssString);
  };
  node.onRemove = () => {
    node.ownerDocument.removeRules(rules);
  };
  return node;
}

registerNode('div', createContainer);
registerNode('root', createContainer);
registerNode('img', createImage);
// 兼容旧版本
registerNode('image', createImage);

registerNode('style', createStyle);
registerNode('text', createText);
registerNode('shape', createShape);

export function registerNode(tagName, nodeCreateFn) {
  Node_Map[tagName] = nodeCreateFn;
}

export function createNode(tagName, ...args) {
  let nodeCreateFn = Node_Map[tagName];
  if (!nodeCreateFn) {
    nodeCreateFn = createContainer;
    console.error(`找不到标签${tagName}的创建函数`);
  }
  const uiNode = nodeCreateFn(...args);
  return uiNode;
}
