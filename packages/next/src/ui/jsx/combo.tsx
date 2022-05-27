import { jsx, Component } from '@antv/f-engine';
import { getCombo } from './components/comos';
import { connector } from './connector';

import { calcBBox, calcMatrix, calculateBBox } from '../adapter/element';

import { isNumber } from '@antv/util';
import { Global } from '../../const';
import { combo as comboActions } from '../../store';

@connector((state, props) => {
  const { sortedCombo } = props;
  return {
    allNodes: state.node.state.entities,
    combo: state.combo.state.entities[sortedCombo.id],
    nodes: Object.values(state.node.state.entities).filter((node) => {
      return sortedCombo.children?.some(({ id }) => id === node.id);
    }),
    combos: Object.values(state.combo.state.entities).filter((node) => {
      return sortedCombo.children?.some(({ id }) => id === node.id);
    }),
  };
})
export class Combo extends Component {
  nodeRef = { current: null };
  cacheCombo = {};
  cahcePosition = {};

  didMount(): void {
    this.container.item = this;
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

  getBBox() {
    const { combo } = this.props;
    if (!combo) return;
    let matrix = calcMatrix(this.getNodeRoot());
    return calculateBBox(calcBBox(this.getKeyShape()), matrix);
  }

  calcComboBBox() {
    const { nodes, combos, combo } = this.props;
    return comboActions.calcComboBBox(combo.id);
  }

  getAnchorPoints() {}

  getRenderSize(padding = 0) {
    const bbox = this.calcComboBBox();
    if (bbox) {
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
      // this.set(CACHE_SIZE, size);
      return size;
    }
  }

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
    const { combo } = this.props;
    let { x, y } = combo;

    const comboBBox = this.calcComboBBox();

    if (!isNaN(comboBBox.x)) x = comboBBox.x;
    else if (isNaN(x)) x = Math.random() * 100;

    if (!isNaN(comboBBox.y)) y = comboBBox.y;
    else if (isNaN(y)) y = Math.random() * 100;

    comboActions.updateOne({
      id: combo.id,
      changes: {
        x,
        y,
      },
    });
  }

  render() {
    const { combo } = this.props;

    const Shape = getCombo(combo?.type || 'circle');

    if (!Shape) {
      console.warn('不存在对应的 Node Shape');
      return null;
    }

    const defaultStyle = Shape?.getOptions();
    const size = this.getRenderSize();

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
