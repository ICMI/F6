import { isSelectorMatchDom, reflowAttrs } from '../utils/index';
import computeLayout from 'css-layout';
import isEqual from '@antv/util/lib/is-equal';
import EE from '@antv/event-emitter';
import { traverseTree } from '../utils';
import Container from './container';
import { isReflow, isInherit, getMergedStyle } from '../compiler';

export default class Node extends Container {
  isDisplay = true;

  reflow() {
    // 开始重排
    this.ownerDocument.updateLayout(this);
  }

  // 初次绘制， 绑定一些事件之类
  mount() {
    // if (this.isMounted) {
    //   return;
    // }
    // if (this.style?.display === 'none') {
    //   this.isDisplay = false;
    //   return;
    // }
    // this.draw(this.parentGNode);
    // this.isMounted = true;
    // this.gNode?.set('uiNode', this);
    // this.gNode?.on('*', this.trigger);
    // this.children.forEach((child) => child.mount());
    // this.didMount();
  }
  // 全部draw一遍后触发下
  didMount() {}

  unmount() {
    // if (!this.isMounted) return;
    // this.isMounted = false;
    // this.children.forEach((child) => child.unmount());
    // this.didUnmount();
  }
  didUnmount() {}

  // 绘制子树
  render() {
    this.ownerDocument.updateRener(this);
    // if (!isTagNeedRener(this.dom.tagName)) {
    //   return;
    // }

    // if (!this.isMounted) {
    //   this.mount();
    //   return;
    // }
    // // if (!this.shouldUpdate(this._prevAttrs, this._prevStyle)) return;
    // // 处理display的情况
    // if (this.style?.display === 'none') {
    //   this.isDisplay = false;
    //   this.gNode?.remove(false);
    //   return false;
    // }

    // if (this.isDisplay === false) {
    //   this.isDisplay = true;
    //   this.parentGNode?.add(this.gNode);
    // }
    // this.draw();
    // this.children.forEach((child) => child.render());
  }

  draw() {
    this.renderNode?.startDraw(
      this.parent.renderNode,
      this.attributes,
      this.computedStyle,
      this.layoutNode.layout,
    );
  }

  animate() {}

  setAttribute(key, value) {
    if (this.dom) {
      this.dom.attrs[key] = value;
      if (!this.isOnline) return;
      this.render();
    }
  }

  setStyle(key, value) {
    if (this.style) {
      this.style[key] = value;
      if (!this.isOnline) return;
      if (isReflow(key)) {
        this.ownerDocument.updateLayout(this);
      } else if (isInherit(key)) {
        this.ownerDocument.updateInherit(this);
      } else {
        this.ownerDocument.updateRener(this);
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
}
