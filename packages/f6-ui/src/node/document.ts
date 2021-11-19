// html, css -> uiNode

import { createUINode } from '.';
import { parseHtml, parseRulesHash } from '../compiler';
import { Pipe } from '../flow';
import Base from './base';

class Document extends Base {
  ruleHashs = [];
  children = [];
  pipe = null;

  constructor(htmlString, cssString, group) {
    super();
    this.pipe = new Pipe();
    this.genDomTree(htmlString);
    this.addRules(cssString);
    this.attachStyle();

    this.manualMount(group);
  }

  get root() {
    return this.children[0];
  }

  // 手动挂载G节点
  manualMount(parentGNode) {
    this.gNode = parentGNode;
    this.layout();
    this.mount();
  }

  updateLayout(node?) {
    this.pipe.run('computeLayout', node || this.root);
    this.pipe.run('render', node || this.root);
  }
  updateStyleAndLayout(node?) {
    this.pipe.run('computeCss', node || this.root, this.ruleHashs);
    this.pipe.run('computeLayout', node || this.root);
    this.pipe.run('render', node || this.root);
  }

  // 重新渲染

  // html -> dom -> uiNode
  genDomTree(htmlString) {
    const dom = parseHtml(htmlString, true);
    const tree = this.createElement(dom.tagName);
    tree.dom = dom;
    // 创建ui节点
    const stack = [[dom, tree]];
    while (stack.length) {
      const [node, parent] = stack.pop();
      for (let child of node.children) {
        const uiNode = this.createElement(child.tagName);
        parent?.children.push(uiNode);
        uiNode.dom = child;
        uiNode.setParent(parent);
        stack.push([child, uiNode]);
      }
    }
    tree.setParent(this);
    this.children = [tree];
  }

  // css -> rules
  addRules(cssString) {
    const rulehash = parseRulesHash(cssString);
    this.ruleHashs.push(rulehash);
  }

  //-> layout -> attach
  attachStyle(node?) {
    // 遍历doms
    attachStyle(node || this.root, this.ruleHashs);
  }

  // -> paint
  layout(node?) {
    computeLayout(node || this.root);
  }

  run(key, node) {
    this.pipe.run(key, node);
  }

  // mount() {
  // this.root.mount();
  // }

  render() {
    return this.root.render();
  }

  get width() {
    return this.root.width;
  }
  get height() {
    return this.root.height;
  }

  setViewPort() {}

  createElement(type, ...args) {
    const node = createUINode.call(null, type, args);
    node.ownerUI = this;
    return node;
  }

  createSegmentNode(htmlString, cssString) {
    if (cssString) {
      htmlString += `<style>${cssString}</style>`;
    }
    const dom = parseHtml(htmlString, true);
    const tree = this.createElement(dom.tagName);
    // 创建ui节点
    const stack = [[dom, tree]];
    while (stack.length) {
      const [node, parent] = stack.pop();
      for (let child of node.children) {
        const uiNode = this.createElement(child.tagName);
        parent?.children.push(uiNode);
        uiNode.dom = child;
        uiNode.setParent(parent);
        stack.push([child, uiNode]);
      }
    }
    return tree.children;
  }

  delegateFunc(func) {
    this.root[func]();
  }
}

export default Document;
