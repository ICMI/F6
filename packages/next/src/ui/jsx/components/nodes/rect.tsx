import { jsx } from '@antv/f-engine';
import { deepMix, mix } from '@antv/util';
import { Global } from '../../../../const';
import { BaseNode } from './base';
export class SimpleRect extends BaseNode {
  options = {
    size: [100, 30],
    style: {
      radius: 0,
      stroke: Global.defaultNode.style.stroke,
      fill: Global.defaultNode.style.fill,
      lineWidth: Global.defaultNode.style.lineWidth,
    },
    // 文本样式配置
    labelCfg: {
      style: {
        fill: Global.nodeLabel.style.fill,
        fontSize: Global.nodeLabel.style.fontSize,
      },
    },
    // 连接点，默认为左右
    // anchorPoints: [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }]
    anchorPoints: [
      [0, 0.5],
      [1, 0.5],
    ],
    stateStyles: {
      ...Global.nodeStateStyles,
    },
  };

  /**
   * 获取节点的样式，供基于该节点自定义时使用
   * @param {Object} cfg 节点数据模型
   * @return {Object} 节点的样式
   */
  getShapeStyle(cfg: NodeConfig) {
    const { style: defaultStyle } = this.getOptions(cfg) as NodeConfig;
    const strokeStyle: ShapeStyle = {
      stroke: cfg.color,
    };
    // 如果设置了color，则覆盖默认的stroke属性
    const style = mix({}, defaultStyle, strokeStyle);
    const size = (this as ShapeOptions).getSize!(cfg);
    const width = style.width || size[0];
    const height = style.height || size[1];
    const styles = {
      x: -width / 2,
      y: -height / 2,
      width,
      height,
      ...style,
    };
    return styles;
  }

  renderShape(style) {
    return <rect style={style} ref={this.keyShapeRef} />;
  }
}
