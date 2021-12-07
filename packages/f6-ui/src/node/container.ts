import { isSelectorMatchDom } from '../utils';
import { traverseTree } from '../utils';
import Base from './base';

class Container extends Base {
  children = [];
  /**
   * append 普通节点，增量节点更新
   * append style节点，需要全量更新
   */
  appendChild(node) {
    if (!node) return;

    // 如果是挂在其他树上的，卸了
    if (node.parent) {
      node.parent.removeChild(node);
    }

    node.setParent(this);
    this.children.push(node);

    if (!this.isOnline) {
      return;
    }

    let isNeedRootUpdate = false;
    traverseTree(node, ({ node }) => {
      // append style节点，需要全量更新
      if (node.isNeedRenderAll) isNeedRootUpdate = true;
      // 触发append后的操作
      node.onAppend?.();
      this.isOnline = true;
    });

    if (isNeedRootUpdate) {
      this.ownerDocument.updateStyleAndLayout();
    } else {
      this.ownerDocument.updateLayout(this);
    }
  }

  removeChild(node) {
    if (!node) return;
    this.children.splice(1, this.children.indexOf(this));
    this.renderNode.remove();
    let isNeedRootUpdate = false;
    traverseTree(node, ({ node }) => {
      // append style节点，需要全量更新
      if (node.isNeedRenderAll) isNeedRootUpdate = true;
      // 触发append后的操作
      node.onRemove?.();
      this.isOnline = false;
    });
    if (isNeedRootUpdate) {
      this.ownerDocument.updateStyleAndLayout();
    } else {
      this.ownerDocument.updateLayout(this);
    }
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
}

export default Container;
