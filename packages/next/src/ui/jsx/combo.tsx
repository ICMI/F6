import { jsx, Component } from '@antv/f-engine';
import { getCombo } from './components/comos';
import { connect, connector } from './connector';

import { calcBBox, calcMatrix, calculateBBox } from '../adapter/element';

import { isNumber } from '@antv/util';
import { Global } from '../../const';
import { combo as comboActions } from '../../store';

@connect((graph, props) => {
  const { sortedCombo } = props;
  const combo = graph.comboManager.byId(sortedCombo.id);

  return {
    item: combo,
    allNodes: graph.nodeManager.models,
    combo: combo.model,
    nodes: graph.nodeManager.models.filter((node) => {
      return sortedCombo.children?.some(({ id }) => id === node.id);
    }),
    combos: graph.comboManager.models.filter((node) => {
      return sortedCombo.children?.some(({ id }) => id === node.id);
    }),
    inject: combo.inject.bind(combo),
    setPosition: combo.setPosition.bind(combo),
    calcComboBBox: graph.comboManager.calcComboBBox.bind(graph.comboManager),
    isAutoSize: graph.comboManager.isAutoSize,
  };
})
export class Combo extends Component {
  nodeRef = { current: null };
  cacheCombo = {};
  cahcePosition = {};
  size = {};
  position = {};

  willMount(): void {
    const { inject } = this.props;
    inject('getBBox', this.getBBox);
  }

  didMount(): void {
    this.container.item = this.props.item;
    this.container.style.zIndex = this.props.combo.depth;
  }

  get(key) {
    return this.props.combo[key];
  }

  getModel() {
    return this.cacheCombo;
  }

  getType() {
    return 'combo';
  }

  getBBox = () => {
    const { combo } = this.props;
    if (!combo) return;
    let matrix = calcMatrix(this.getNodeRoot());
    return calculateBBox(calcBBox(this.getKeyShape()), matrix);
  };

  getAnchorPoints() {}

  getRenderRect(padding = 0) {
    const { calcComboBBox, combo } = this.props;
    let x = 0;
    let y = 0;
    const bbox = calcComboBBox(combo.id);
    // merge graph的item样式与数据模型中的样式
    const size = {
      r: Math.hypot(bbox.height, bbox.width) / 2 || Global.defaultCombo.size[0] / 2,
      width: bbox.width || Global.defaultCombo.size[0],
      height: bbox.height || Global.defaultCombo.size[1],
    };
    if (isNumber(padding)) {
      size.r += padding;
      size.width += padding * 2;
      size.height += padding * 2;
    } else {
      size.r += padding[0];
      size.width += padding[1] + padding[3] || padding[1] * 2;
      size.height += padding[0] + padding[2] || padding[0] * 2;
    }

    if (!isNaN(bbox.x)) x = bbox.x;
    else if (isNaN(x)) x = Math.random() * 100;
    if (!isNaN(bbox.y)) y = bbox.y;
    else if (isNaN(y)) y = Math.random() * 100;
    // this.set(CACHE_SIZE, size);
    // return size;
    this.size = size;
    this.position = { x, y };
  }

  getRenderPosition() {}

  getShapeNode() {
    return this.nodeRef.current;
  }

  getKeyShape() {
    return this.nodeRef.current?.getKeyShape();
  }

  getNodeRoot() {
    return this.nodeRef.current?.getRootShape();
  }

  getRenderState() {
    return this.cacheCombo;
  }

  getPosition() {
    return this.cahcePosition;
  }

  getComboId() {
    return this.props.combo.id;
  }

  didUpdate(prev): void {
    const { isAutoSize, setPosition, sortedCombo } = this.props;
    this.container.parentNode.style.zIndex = sortedCombo.depth;
    // if (isAutoSize) {
    setPosition(this.position);
    // }
  }

  render() {
    const { isAutoSize, combo } = this.props;

    const Shape = getCombo(combo?.type || 'circle');

    if (!Shape) {
      console.warn('不存在对应的 Node Shape');
      return null;
    }

    const defaultStyle = Shape?.getOptions();
    this.getRenderRect();
    const size = this.size;

    this.cahcePosition = {
      x: combo.x || 0,
      y: combo.y || 0,
    };

    this.cacheCombo = {
      ...combo,
      ...defaultStyle,
      style: { ...defaultStyle.style, ...(size || {}) },
    };

    const ele = <Shape ref={this.nodeRef} combo={this.cacheCombo} />;

    return ele;
  }
}
