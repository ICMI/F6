import { isSelectorMatchDom, reflowAttrs } from '../utils/index';
import computeLayout from 'css-layout';
import isEqual from '@antv/util/lib/is-equal';
import EE from '@antv/event-emitter';
import { traverseTree } from '../utils';
import ContainerNode from './container';

export default abstract class UIBaseNode extends ContainerNode {
  isDisplay = true;
  private _parentGNode = null;

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
    this.ownerDocument.updateLayout(this);
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
    this.draw();
    this.children.forEach((child) => child.render());
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
      this.dom.attrs[key] = value;
      if (!this.parent?.isMounted) return;
      this.render();
    }
  }

  setStyle(key, value) {
    if (this.style) {
      this.style[key] = value;
      if (this.parent && !this.parent.isMounted) return;
      if (reflowAttrs[key]) {
        this.ownerDocument.run('reflow', this);
      } else {
        this.ownerDocument.run('render', this);
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
      this.ownerDocument.run('render', this);
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
