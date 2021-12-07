// html, css -> uiNode

import { createNode } from './factory';
import { parseHtml, parseRulesHash } from '../compiler';
import { Pipe } from '../flow';
import { RenderNode } from '../render';
import Base from './base';

const defaultCssSet = `
  root {
    font-family: serif;
    color: black;
  }
`;

class Document extends Base {
  ruleHashs = [];
  children = [];
  private pipe = null;

  constructor(htmlString, cssString, group) {
    super();
    this.pipe = new Pipe();
    this.addRules(defaultCssSet);
    this.genDomTree(htmlString);
    this.addRules(cssString);
    this.addRenderNode(new RenderNode(group));
    this.updateStyleAndLayout();
  }

  addRenderNode(renderNode: RenderNode) {
    if (!renderNode) return;
    this.renderNode = renderNode;
    this.renderNode.onEventEmit = this.trigger.bind(this);
  }

  get root() {
    return this.children[0];
  }

  updateRener(node) {
    this.pipe.run('render', node || this.root);
  }

  updateInherit(node) {
    this.pipe.run('reInherit', node || this.root);
  }

  updateLayout(node?) {
    let layoutRoot = node;

    if (layoutRoot) {
      // 上浮到absolute或根节点
      while (layoutRoot?.style?.position !== 'absolute' && layoutRoot.parent) {
        layoutRoot = node.parent;
      }
    }

    this.pipe.run('reflow', layoutRoot || this.root);
  }

  updateStyleAndLayout(node?) {
    this.pipe.run('reAttach', node || this.root, this.ruleHashs);
  }

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
    return rulehash;
  }

  setUserCssSet(cssString: String) {
    const rulehash = parseRulesHash(cssString);
    this.ruleHashs.splice(1, 0, rulehash);
  }

  removeRules(rules) {
    const index = this.ruleHashs.indexOf(rules);
    if (index !== -1) {
      this.ruleHashs.splice(index, 1);
    }
  }

  run(key, node) {
    this.pipe.run(key, node);
  }

  get width() {
    return this.root.width;
  }
  get height() {
    return this.root.height;
  }

  setViewPort() {}

  createElement(type, ...args) {
    const node = createNode.call(null, type, args);
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

  getG6Node() {
    return this.renderNode.cacheNode;
  }
}

export default Document;
