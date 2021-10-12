import { isSelectorMatchDom } from '../utils/index';
import { traverseTree } from '../utils';
import BaseNode from './baseNode';

class ContainerNode extends BaseNode {
  parent = null;
  children = [];

  setParent(parent) {
    this.parent = parent;
  }

  /**
   * append 普通节点，增量节点更新
   * append style节点，需要全量更新
   */
  appendChild(node) {
    if (!node) return;

    // 如果是挂在其他树上的，卸了
    if (node.parent) {
      node.remove();
    }

    node.setParent(this);
    this.children.push(node);

    let isNeedRootUpdate = false;
    traverseTree(node, (node) => {
      // append style节点，需要全量更新
      if (node.tagName === 'style') isNeedRootUpdate = true;
      // 触发append后的操作
      node.afterAppend?.(this);
    });

    if (isNeedRootUpdate) {
      this.ownerDocument.updateStyleAndLayout();
    } else {
      this.updateStyleAndLayout();
    }

    // this.ownerDocument.attachStyle();
    // this.ownerDocument.layout();
    // this.ownerDocument.render();
  }

  removeChild(node) {
    if (!node) return;
    node.remove();
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
