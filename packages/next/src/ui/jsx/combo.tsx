import { jsx, Component } from '@antv/f-engine';
import { getCombo } from './components/comos';
import { connector } from './connector';

import { calcBBox, calcMatrix, calculateBBox } from '../../selector/node';
import { isNumber } from '@antv/util';
import { Global } from '../../const';

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

  getKeyShapeBBox() {
    const { combo } = this.props;
    if (!combo) return;
    let matrix = calcMatrix(this.getNodeRoot());
    const keyShapeBBox = calculateBBox(calcBBox(this.getKeyShape()), matrix);
    return keyShapeBBox;
  }

  getComboBBox() {
    const { nodes, combos, getNodeBBox } = this.props;
    const children = [...nodes, ...combos];

    const comboBBox = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
      x: undefined,
      y: undefined,
      width: undefined,
      height: undefined,
      centerX: undefined,
      centerY: undefined,
    };

    if (!children || children.length === 0) {
      return comboBBox;
    }

    children.forEach((node) => {
      const childBBox = getNodeBBox(node.id, node.__type);
      if (!childBBox) return; // ignore hidden children
      if (childBBox.x && comboBBox.minX > childBBox.minX) comboBBox.minX = childBBox.minX;
      if (childBBox.y && comboBBox.minY > childBBox.minY) comboBBox.minY = childBBox.minY;
      if (childBBox.x && comboBBox.maxX < childBBox.maxX) comboBBox.maxX = childBBox.maxX;
      if (childBBox.y && comboBBox.maxY < childBBox.maxY) comboBBox.maxY = childBBox.maxY;
    });
    comboBBox.x = (comboBBox.minX + comboBBox.maxX) / 2;
    comboBBox.y = (comboBBox.minY + comboBBox.maxY) / 2;
    comboBBox.width = comboBBox.maxX - comboBBox.minX;
    comboBBox.height = comboBBox.maxY - comboBBox.minY;

    comboBBox.centerX = (comboBBox.minX + comboBBox.maxX) / 2;
    comboBBox.centerY = (comboBBox.minY + comboBBox.maxY) / 2;

    Object.keys(comboBBox).forEach((key) => {
      if (comboBBox[key] === Infinity || comboBBox[key] === -Infinity) {
        comboBBox[key] = undefined;
      }
    });

    return comboBBox;
  }

  getRenderSize(padding = 0) {
    const bbox = this.getComboBBox();
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

  getBBox() {
    const bbox = this.getKeyShapeBBox();
    const comboBBox = this.getRenderSize();

    bbox.centerX = (bbox.minX + bbox.maxX) / 2;
    bbox.centerY = (bbox.minY + bbox.maxY) / 2;

    const cacheSize = comboBBox;

    const cacheBBox = {};
    // const oriX = cacheBBox.x;
    // const oriY = cacheBBox.x;

    if (cacheSize) {
      cacheSize.width = Math.max(cacheSize.width, bbox.width);
      cacheSize.height = Math.max(cacheSize.height, bbox.height);
      const type: string = 'circle';
      if (type === 'circle') {
        bbox.width = cacheSize.r * 2;
        bbox.height = cacheSize.r * 2;
      } else {
        bbox.width = cacheSize.width;
        bbox.height = cacheSize.height;
      }
      bbox.minX = bbox.centerX - bbox.width / 2;
      bbox.minY = bbox.centerY - bbox.height / 2;
      bbox.maxX = bbox.centerX + bbox.width / 2;
      bbox.maxY = bbox.centerY + bbox.height / 2;
    } else {
      bbox.width = bbox.maxX - bbox.minX;
      bbox.height = bbox.maxY - bbox.minY;
      bbox.centerX = (bbox.minX + bbox.maxX) / 2;
      bbox.centerY = (bbox.minY + bbox.maxY) / 2;
    }
    bbox.x = bbox.minX;
    bbox.y = bbox.minY;
    // if (bbox.x !== oriX || bbox.y !== oriY) this.set(CACHE_ANCHOR_POINTS, null);
    return bbox;
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

  render() {
    const { combo } = this.props;

    const Shape = getCombo(combo?.type || 'circle');

    if (!Shape) {
      console.warn('不存在对应的 Node Shape');
      return null;
    }

    const defaultStyle = Shape?.getOptions();
    let { x, y } = combo;
    const size = this.getRenderSize();

    if (typeof x !== 'number' && typeof y !== 'number') {
      const comboBBox = this.getComboBBox();

      if (!isNaN(comboBBox.x)) x = comboBBox.x;
      else if (isNaN(x)) x = Math.random() * 100;

      if (!isNaN(comboBBox.y)) y = comboBBox.y;
      else if (isNaN(y)) y = Math.random() * 100;
    }

    this.cahcePosition = {
      x,
      y,
    };

    this.cacheCombo = {
      ...combo,
      ...this.cahcePosition,
      ...defaultStyle,
      style: { ...defaultStyle.style, ...(size || {}) },
    };

    return <Shape ref={this.nodeRef} combo={this.cacheCombo} />;
  }
}
