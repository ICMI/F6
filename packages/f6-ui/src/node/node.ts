import Container from './container';
import { isReflow, isInherit } from '../compiler';

export default class Node extends Container {
  addRenderNode(renderNode) {
    if (!renderNode) return;
    renderNode.remove();
    this.renderNode = renderNode;
    this.renderNode.onEventEmit = this.trigger;
    this.renderNode.onBBoxChange = ({ width, height }) => {
      this.style['width'] = width;
      this.style['height'] = height;
      this.ownerDocument.updateLayout(this);
    };
  }

  draw() {
    this.renderNode?.startDraw(
      this.parent.renderNode,
      this.attributes,
      this.computedStyle,
      this.parent?.computedStyle,
    );
  }

  animate() {}

  attr(key, value) {
    if (arguments.length === 0 || !this.attributes) {
      return;
    }

    if (arguments.length === 1 && typeof key === 'string') {
      return this.attributes[key];
    }

    if (arguments.length === 2) {
      this.attributes[key] = value;
      if (!this.isOnline) return;
      if (key === 'style' || key === 'class' || key === 'id') {
        this.ownerDocument.updateStyleAndLayout(this);
      } else {
        this.ownerDocument.updateRener(this);
      }
    }
  }

  css(key, value) {
    if (arguments.length === 0 || !this.style) {
      return;
    }

    if (arguments.length === 1 && typeof key === 'string') {
      return this.computedStyle[key];
    }

    if (arguments.length === 2 && typeof key === 'string') {
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

  setAttribute(key, value) {
    if (this.dom) {
      this.dom.attrs[key] = value;
      if (!this.isOnline) return;
      this.ownerDocument.updateRener(this);
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
    return this.computedStyle[key];
  }

  setText(text) {
    const textNode = this.query('text');
    if (textNode && textNode.styleNode.dom) {
      textNode.dom.text = text;
      this.ownerDocument.updateRener(this);
    }
  }
}
