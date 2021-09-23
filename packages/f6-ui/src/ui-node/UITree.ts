// html, css -> uiNode

import UIBaseNode from './base';
import { createUINode } from '.';

import htmlParse from '../om/dom';
import { computeCSS, parseRulesHash } from '../utils';

class UITree extends UIBaseNode {
  ruleHashs = [];

  constructor(htmlString, cssString, group) {
    super();
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

  // 重新渲染

  // html -> dom -> uiNode
  genDomTree(htmlString) {
    const dom = htmlParse(htmlString, true);
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
  attachStyle() {
    // 遍历doms
    const stack = [[this.root, []]];
    while (stack.length) {
      const [node, path, parent] = stack.pop();
      node.style = computeCSS(node, path, parent?.style, this.ruleHashs);
      // dom 查找样式并合并
      for (let child of node.children) {
        stack.push([child, [...path, node], node]);
      }
    }
  }

  // -> paint
  layout() {
    this.root.layout();
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

  createElement(type, ...args) {
    const node = createUINode.call(null, type, args);
    node.ownerUI = this;
    return node;
  }

  createSegmentNode(htmlString, cssString) {
    if (cssString) {
      htmlString += `<style>${cssString}</style>`;
    }
    const dom = htmlParse(htmlString, true);
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

export default UITree;
