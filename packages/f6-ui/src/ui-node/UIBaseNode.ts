import { isSelectorMatchDom, reflowAttrs, computeCSS } from '../utils/index';
import computeLayout from 'css-layout';
import isEqual from '@antv/util/lib/is-equal';
import EE from '@antv/event-emitter';
import { traverseTree } from '../utils';
import ContainerNode from './containerNode';

export default abstract class UIBaseNode extends ContainerNode {
  dom = null;
  style = null;
  layoutNode = null;

  isDisplay = true;

  private _parentGNode = null;
  private _prevAttrs = null;
  private _prevStyle = null;
  private _prevLayout = null;

  get top() {
    return this.layoutNode?.layout?.top;
  }

  get left() {
    return this.layoutNode?.layout?.left;
  }

  get width() {
    return this.layoutNode?.layout?.width;
  }
  get height() {
    return this.layoutNode?.layout?.height;
  }

  get tagName() {
    return this?.dom?.tagName;
  }

  get attributes() {
    return this?.dom?.attrs;
  }

  private get _layout() {
    return this.layoutNode?.layout;
  }

  set parentGNode(gNode) {
    this._parentGNode = gNode;
  }

  get parentGNode() {
    return this.parent?.gNode || this._parentGNode;
  }

  updateStyleAndLayoutAndRender() {
    // 节点没有挂载到G上
    if (!this.parentGNode) return;

    this.attachStyle();
    this.reflow();
  }

  reflow() {
    // 节点没有挂载到G上
    if (!this.parentGNode) return;

    // 上浮到absolute或根节点
    if (this.style?.position !== 'absolute' && this.parent) {
      this.parent.reflow();
      return;
    }

    // 开始重排
    this.layout();
    this.render();
  }

  attachStyle() {
    const stack = [[this, [], this.parent]];
    while (stack.length) {
      const [node, path, parent] = stack.pop();
      node.style = computeCSS(node, path, parent?.style, this.ownerUI.ruleHashs);
      // dom 查找样式并合并
      for (let child of node.children) {
        stack.push([child, [...path, node], node]);
      }
    }
  }

  genLayoutTree() {
    const stack = [[this, this.parent.layoutNode || null]];
    while (stack.length) {
      const [node, parent] = stack.shift();
      const layoutNode = {
        style: {},
        children: [],
      };
      if (node.style.display === 'none' || node.tagName === 'style') {
        continue;
      } else {
        layoutNode.style = { ...node.style };
        parent?.children?.push(layoutNode);
        node.layoutNode = layoutNode;
      }

      for (let child of Object.values(node.children)) {
        stack.push([child, layoutNode]);
      }
    }
  }

  // 子树布局
  layout() {
    this._prevLayout = { ...(this._layout || {}) };
    this.genLayoutTree();
    this.clearLayout();
    computeLayout(this.layoutNode);
    return;
  }

  // 初次绘制， 绑定一些事件之类
  mount() {
    if (this.isMounted) {
      return;
    }

    if (this.style?.display === 'none') {
      this.isDisplay = false;
      return;
    }
    // 保存之后会对比
    this._prevAttrs = this.attributes;
    this._prevStyle = this.style;

    this.draw(this.parentGNode);
    this.isMounted = true;
    this.gNode?.set('uiNode', this);
    this.gNode?.on('*', this.trigger);

    this.children.forEach((child) => child.mount());
    this.didMount();
  }
  // 全部draw一遍后触发下
  didMount() {}

  unmount() {
    if (!this.isMounted) return;
    this.isMounted = false;
    this.children.forEach((child) => child.unmount());
    this.didUnmount();
  }
  didUnmount() {}

  // 绘制子树
  render() {
    if (this.tagName === 'style') return;

    if (!this.isMounted) {
      this.mount();
      return;
    }
    // if (!this.shouldUpdate(this._prevAttrs, this._prevStyle)) return;
    // 处理display的情况
    if (this.style?.display === 'none') {
      this.isDisplay = false;
      this.gNode?.remove(false);
      return false;
    }

    if (this.isDisplay === false) {
      this.isDisplay = true;
      this.parentGNode?.add(this.gNode);
    }
    const should = this.shouldUpdate(this._prevAttrs, this._prevStyle, this._prevLayout);
    should && this.draw();
    this.children.forEach((child) => child.render());
    should && this.didUpdate();
  }

  didUpdate() {}

  shouldUpdate(prevAttr, prevStyle, prevLayout) {
    return true;
  }

  draw(parentGNode?) {}

  animate() {}

  private clearLayout() {
    if (!this.layoutNode) return;
    this.layoutNode.isDirty = true;
    this.children.forEach((child) => {
      child.clearLayout();
    });
  }

  setAttribute(key, value) {
    if (this.dom) {
      this._prevAttrs = { ...this.dom.attrs };
      this.dom.attrs[key] = value;
      if (!this.parent?.isMounted) return;
      this.render();
    }
  }

  setStyle(key, value) {
    if (this.style) {
      this._prevStyle = { ...this.style };
      this.style[key] = value;
      if (this.parent && !this.parent.isMounted) return;
      if (reflowAttrs[key]) {
        this.reflow();
      } else {
        this.render();
      }
    }
  }

  getAttribute(key) {
    return this.dom?.attrs[key];
  }

  getStyle(key) {
    return this.layoutNode?.layout[key] ?? this.style?.inherits[key] ?? this.style?.[key];
  }

  setText(text) {
    const textNode = this.query('text');
    if (textNode && textNode.styleNode.dom) {
      textNode.dom.text = text;
      textNode.render();
    }
  }

  trigger = (e) => {
    let shape = e.target;
    while (shape && !shape.get('uiNode')) {
      shape = shape.get('parent');
    }
    e.targetGNode = shape || null;
    e.uiNode = shape?.get('uiNode') ?? null;
    this.getEvents()[e.type]?.forEach((event) => event.callback(e, this));
  };
}
