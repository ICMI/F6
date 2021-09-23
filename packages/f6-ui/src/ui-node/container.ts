import EE from '@antv/event-emitter';
import { isSelectorMatchDom } from '../utils/index';
import { traverseTree } from '../utils';

class ContainerNode extends EE {
  parent = null;
  children = [];
  updateStyleAndLayout() {}

  setParent(parent) {
    this.parent = parent;
  }

  appendChild(...list) {
    let isNeedRootUpdate = false;
    list.forEach((child) => {
      child.setParent(this);
      this.children.push(child);
      traverseTree(child, (node) => {
        if (node.tagName === 'style') isNeedRootUpdate = true;
        node.onAppend?.(this);
      });
    });

    if (isNeedRootUpdate) {
      this.getOwnerUI().updateStyleAndLayout();
    } else {
      this.updateStyleAndLayout();
    }

    this.ownerUI.attachStyle();
    this.ownerUI.layout();
    this.ownerUI.render();
  }

  removeChild(child) {
    if (!child) return;
    child.remove();
  }

  remove() {
    const parent = this.parent;
    this.gNode?.remove();
    if (parent) {
      parent.children.splice(1, parent.children.indexOf(this));
      if (this.isMounted) parent.reflow();
    }
    if (this.isMounted) this.unmount();
  }

  query(selector) {
    if (typeof selector !== 'string') return;
    const arr = selector.split(/\s+/g).filter((s) => s !== '');
    const stack: any = [[this, arr]];
    while (stack.length) {
      const [uiNode, selectorArr] = stack.shift();
      for (const child of uiNode.children) {
        let rest = [];
        if (isSelectorMatchDom(child.dom, selectorArr[0])) {
          if (selectorArr.slice(1).length === 0) {
            return child;
          } else {
            rest = selectorArr.slice(1);
          }
        } else {
          rest = selectorArr;
        }
        stack.push([child, rest]);
      }
    }
  }

  queryAll(selector) {
    if (typeof selector !== 'string') return;
    const arr = selector.split(/\s+/g).filter((s) => s !== '');
    const result = [];
    const stack: any = [[this, arr, result]];
    while (stack.length) {
      const [uiNode, selectorArr, result] = stack.shift();
      for (const child of uiNode.children) {
        let rest = [];
        if (isSelectorMatchDom(child.dom, selectorArr[0])) {
          if (selectorArr.slice(1).length === 0) {
            result.push(child);
            rest = [selectorArr[0]];
          } else {
            rest = selectorArr.slice(1);
          }
        } else {
          rest = selectorArr;
        }
        stack.push([child, rest, result]);
      }
    }
    return result;
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

export default ContainerNode;
