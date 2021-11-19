import EE from '@antv/event-emitter';
import Element from '@antv/g-base/lib/abstract/element';
import { UIDocument } from '.';

export default class BaseNode extends EE {
  isMounted: boolean;
  ownerDocument: UIDocument;
  parent = null;

  dom = null;
  style = null;
  layoutNode = null;
  renderNode: Element;

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

  setParent(parent) {
    this.parent = parent;
  }

  updateStyleAndLayout() {}
}
