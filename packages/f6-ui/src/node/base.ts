import EE from '@antv/event-emitter';
import { getMergedStyle } from '../compiler';
import { RenderNode } from '../render';
import Document from './document';

export default class Base extends EE {
  isOnline: boolean; // 是否添加到document上了， 如果不加到document上，不用计算layout等
  ownerDocument: Document;
  isNeedRenderAll: boolean = false;
  parent = null;
  cachePath = [];

  dom = null;
  style = null;
  renderNode: RenderNode;
  private layoutNode = null;

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

  get layout() {
    return this.layoutNode?.layout;
  }

  get computedStyle() {
    return Object.assign({}, getMergedStyle(this.style), this.layout, {
      parentMaxWidth: this.layoutNode?.lastLayout?.parentMaxWidth,
    });
  }

  onAppend() {}

  onRemove() {}

  addRenderNode(renderNode: RenderNode) {}

  trigger = (e) => {
    e.uiNode = this;
    this.getEvents()[e.type]?.forEach((event) => event.callback(e, this));
  };

  setParent(parent) {
    this.parent = parent;
  }
}
