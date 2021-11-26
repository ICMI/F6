import UINode from './base';
import { assembleFont, ShapeAttrs } from '@antv/g-base';

export default class UIStyleNode extends UINode {
  didAppend() {
    const textNode = this.query('text');
    const cssString = textNode.dom.text;
    this.ownerUI.addRules(cssString);
  }
  didUnmount() {}
}
